import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db, auth, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiPaperclip, FiSend, FiImage, FiVideo } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  font-weight: 600;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 20px;
  
  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 1rem;
    margin-left: 8px;
  }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const ChatItem = styled.div<{ isActive?: boolean }>`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.isActive ? '#f0f0f0' : 'white'};
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ChatContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-left: 20px;
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Message = styled.div<{ isOwn?: boolean }>`
  max-width: 70%;
  margin: 8px 0;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${props => props.isOwn ? '#007AFF' : '#f0f0f0'};
  color: ${props => props.isOwn ? 'white' : '#333'};
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
`;

const MessageInput = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
  
  input {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 1rem;
    background: #f5f5f5;
    border-radius: 20px;
    margin: 0 12px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  transition: color 0.2s;
  
  &:hover {
    color: #007AFF;
  }
`;

const MediaPreview = styled.div`
  position: relative;
  max-width: 200px;
  margin: 8px 0;
  
  img, video {
    width: 100%;
    border-radius: 8px;
  }
`;

const SeenIndicator = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
  text-align: right;
`;

const MessagePage = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user is developer
  const isDeveloper = currentUser?.email === 'luisjperalta@aol.com';

  useEffect(() => {
    if (!currentUser && !isDeveloper) return;

    // Fetch chats
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser?.uid || 'developer')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [currentUser, isDeveloper]);

  useEffect(() => {
    if (!selectedChat) return;

    // Fetch messages for selected chat
    const q = query(
      collection(db, 'chats', selectedChat, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!currentUser && !isDeveloper) || !selectedChat || (!newMessage && !mediaFile)) return;

    let mediaUrl = '';
    if (mediaFile) {
      const storageRef = ref(storage, `chat-media/${Date.now()}-${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
      text: newMessage,
      mediaUrl,
      senderId: currentUser?.uid || 'developer',
      senderName: currentUser?.displayName || 'Developer',
      timestamp: serverTimestamp(),
      seen: false
    });

    setNewMessage('');
    setMediaFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMediaFile(event.target.files[0]);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.participants.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Container>
      <Header>
        <Title>Messages</Title>
        {isDeveloper && !currentUser && (
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            Developer Mode
          </div>
        )}
      </Header>
      
      <SearchBar>
        <FiSearch size={20} />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBar>

      <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
        <ChatList>
          {filteredChats.map(chat => (
            <ChatItem
              key={chat.id}
              isActive={chat.id === selectedChat}
              onClick={() => setSelectedChat(chat.id)}
            >
              <h3>{chat.participants.find((p: string) => p !== currentUser?.uid)}</h3>
              <p>{chat.lastMessage}</p>
            </ChatItem>
          ))}
        </ChatList>

        {selectedChat && (
          <ChatContent>
            <MessageList>
              {messages.map(message => (
                <Message key={message.id} isOwn={message.senderId === currentUser?.uid}>
                  {message.mediaUrl && (
                    <MediaPreview>
                      {message.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={message.mediaUrl} alt="Media" />
                      ) : (
                        <video src={message.mediaUrl} controls />
                      )}
                    </MediaPreview>
                  )}
                  {message.text}
                  <SeenIndicator>
                    {message.seen ? 'Seen' : 'Delivered'}
                  </SeenIndicator>
                </Message>
              ))}
              <div ref={messagesEndRef} />
            </MessageList>

            <MessageInput>
              <input
                type="file"
                id="media-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,video/*"
              />
              <label htmlFor="media-upload">
                <IconButton type="button">
                  <FiPaperclip size={24} />
                </IconButton>
              </label>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              
              <IconButton onClick={handleSendMessage}>
                <FiSend size={24} />
              </IconButton>
            </MessageInput>
          </ChatContent>
        )}
      </div>
    </Container>
  );
};

export default MessagePage; 