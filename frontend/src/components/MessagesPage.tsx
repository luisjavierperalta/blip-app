import React, { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { db, auth, storage } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { users as mockUsers } from './HomePage';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Regular.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Bold.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Light.woff2') format('woff2');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }
  body, input, button, textarea {
    font-family: 'Interstate', Arial, Helvetica, sans-serif;
  }
`;

const GlassPage = styled.div`
  width: 100vw;
  max-width: 430px;
  min-height: 100vh;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-radius: 36px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const GlassHeader = styled.div`
  padding: 18px 18px 12px 18px;
  background: rgba(255,255,255,0.45);
  border-bottom: 1.5px solid #eee;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
`;

const NewMessageBtn = styled.button`
  background: linear-gradient(90deg, #007aff 0%, #00e6d0 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,122,255,0.08);
  margin-left: 12px;
  transition: background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #005ecb 0%, #00b894 100%);
  }
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  margin: 0 auto 12px auto;
  padding: 12px 18px;
  border-radius: 18px;
  border: 1.5px solid #eee;
  font-size: 1.08rem;
  outline: none;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
  display: block;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 28px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.18);
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f5f6fa;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: #fff;
  &:hover {
    background: #f0f0f0;
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 14px;
`;

const Name = styled.div`
  font-weight: 700;
  color: #222;
  font-size: 1.08rem;
`;

const LastMessage = styled.div`
  color: #888;
  font-size: 0.97rem;
  margin-top: 2px;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e5e5ea;
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 8px 12px 8px;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div<{isMe: boolean}>`
  align-self: ${p => p.isMe ? 'flex-end' : 'flex-start'};
  background: ${p => p.isMe ? '#007aff' : '#fff'};
  color: ${p => p.isMe ? '#fff' : '#222'};
  border-radius: 18px;
  padding: 10px 16px;
  margin-bottom: 8px;
  max-width: 75%;
  font-size: 1.08rem;
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
`;

const MessageInputRow = styled.form`
  display: flex;
  align-items: center;
  padding: 12px 12px 12px 12px;
  background: #fff;
  border-top: 1.5px solid #eee;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1.5px solid #eee;
  font-size: 1.08rem;
  outline: none;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,122,255,0.08);
  transition: background 0.18s;
  &:hover {
    background: #005ecb;
  }
`;

const AttachmentButton = styled.label`
  background: #f0f0f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  cursor: pointer;
  font-size: 1.3rem;
  border: none;
`;

export default function MessagesPage({ chatUser, onClose }: { chatUser?: any, onClose?: () => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser || { uid: 'mockuser', displayName: 'Test User', photoURL: '', email: 'test@mock.com' };
  const [mediaPreview, setMediaPreview] = useState<any>(null);
  const [mediaFile, setMediaFile] = useState<File|null>(null);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [filteredConvos, setFilteredConvos] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>(mockUsers);
  const navigate = useNavigate();
  const location = useLocation();

  // Get chat ID from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chat');
    if (chatId) {
      // Find the conversation with this ID
      const conversation = conversations.find(c => c.id === chatId);
      if (conversation) {
        setSelected(conversation);
      }
    }
  }, [location.search, conversations]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'conversations'), where('users', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selected) return;
    const q = query(collection(db, 'conversations', selected.id, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => doc.data()));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, [selected]);

  // Open chat if chatUser is provided
  useEffect(() => {
    if (chatUser && user) {
      const ids = [user.uid, chatUser.uid].sort();
      const convoId = ids.join('_');
      setSelected({ id: convoId, userMetas: {
        [user.uid]: { name: user.displayName, photo: user.photoURL },
        [chatUser.uid]: { name: chatUser.name, photo: chatUser.img },
      }});
    }
  }, [chatUser, user]);

  // Handle file input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  // Send a message (with optional media)
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !mediaFile) || !selected) return;
    let mediaUrl = '';
    let mediaType = '';
    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop()?.toLowerCase();
      if (['jpg','jpeg','png','gif','webp'].includes(ext)) mediaType = 'image';
      else if (['mp4','mov','webm','avi'].includes(ext)) mediaType = 'video';
      else mediaType = 'file';
      const storageRef = ref(storage, `messages/${selected.id}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
    }
    await addDoc(collection(db, 'conversations', selected.id, 'messages'), {
      text: input,
      sender: user.uid,
      createdAt: serverTimestamp(),
      mediaUrl,
      mediaType,
    });
    setInput('');
    setMediaFile(null);
    setMediaPreview(null);
  };

  // Start or open a conversation
  const openConversation = async (otherUser: any) => {
    if (!user) return;
    const ids = [user.uid, otherUser.uid].sort();
    const convoId = ids.join('_');
    const convoRef = doc(db, 'conversations', convoId);
    const convoSnap = await getDoc(convoRef);
    if (!convoSnap.exists()) {
      await setDoc(convoRef, {
        users: ids,
        userMetas: {
          [user.uid]: { name: user.displayName, photo: user.photoURL },
          [otherUser.uid]: { name: otherUser.name, photo: otherUser.img },
        },
        createdAt: serverTimestamp(),
      });
    }
    setSelected({ id: convoId, ...convoSnap.data(), ...(!convoSnap.exists() && { userMetas: {
      [user.uid]: { name: user.displayName, photo: user.photoURL },
      [otherUser.uid]: { name: otherUser.name, photo: otherUser.img },
    } }) });
  };

  // Filter conversations by search
  useEffect(() => {
    if (!search) setFilteredConvos(conversations);
    else setFilteredConvos(conversations.filter(c => {
      const otherId = c.users.find((id: string) => id !== user.uid);
      const meta = c.userMetas?.[otherId] || {};
      return (meta.name || '').toLowerCase().includes(search.toLowerCase()) || (c.lastMessage || '').toLowerCase().includes(search.toLowerCase());
    }));
  }, [search, conversations, user]);

  // Filter users for new message
  useEffect(() => {
    if (!userSearch) setFilteredUsers(mockUsers);
    else setFilteredUsers(mockUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())));
  }, [userSearch]);

  return (
    <>
      <GlobalStyle />
      <GlassPage>
        <GlassHeader>
          {selected ? (
            <span style={{ cursor: 'pointer' }} onClick={() => setSelected(null)}>&larr; Back</span>
          ) : (
            <>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>&larr; Back to Home</span>
              <NewMessageBtn onClick={()=>setShowNewMsg(true)}>New Message</NewMessageBtn>
              {onClose && <span style={{marginLeft:'auto',cursor:'pointer',color:'#007aff',fontWeight:700}} onClick={onClose}>Close</span>}
            </>
          )}
        </GlassHeader>
        {!selected ? (
          <>
            <SearchBar
              type="text"
              placeholder="Search messages or users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <ConversationList>
              {filteredConvos.map((c) => {
                const otherId = c.users.find((id: string) => id !== user.uid);
                const meta = c.userMetas?.[otherId] || {};
                return (
                  <ConversationItem key={c.id} onClick={() => setSelected(c)}>
                    <Avatar src={meta.photo || '/icon.png'} alt={meta.name || 'User'} />
                    <div>
                      <Name>{meta.name || 'User'}</Name>
                      <LastMessage>{c.lastMessage || 'No messages yet'}</LastMessage>
                    </div>
                  </ConversationItem>
                );
              })}
            </ConversationList>
          </>
        ) : (
          <ChatContainer>
            <MessagesList>
              {messages.map((m, i) => (
                <MessageBubble key={i} isMe={m.sender === user.uid} style={{transition:'all 0.2s',animation:'fadeIn 0.3s'}}>
                  {m.mediaUrl && m.mediaType === 'image' && (
                    <img src={m.mediaUrl} alt="media" style={{maxWidth:180,maxHeight:120,borderRadius:12,marginBottom:4}} />
                  )}
                  {m.mediaUrl && m.mediaType === 'video' && (
                    <video src={m.mediaUrl} controls style={{maxWidth:180,maxHeight:120,borderRadius:12,marginBottom:4}} />
                  )}
                  {m.text}
                </MessageBubble>
              ))}
              <div ref={messagesEndRef} />
            </MessagesList>
            <MessageInputRow onSubmit={sendMessage}>
              <AttachmentButton htmlFor="media-upload" title="Attach media">
                <span role="img" aria-label="attach">📎</span>
                <input id="media-upload" type="file" accept="image/*,video/*,.gif" style={{display:'none'}} onChange={handleFileChange} />
              </AttachmentButton>
              <MessageInput
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <SendButton type="submit">Send</SendButton>
            </MessageInputRow>
            {mediaPreview && (
              <div style={{padding:'8px 0',textAlign:'center'}}>
                <img src={mediaPreview} alt="preview" style={{maxWidth:180,maxHeight:120,borderRadius:12,boxShadow:'0 2px 8px #ccc'}} />
                <button style={{marginLeft:8,background:'#ff2d2d',color:'#fff',border:'none',borderRadius:8,padding:'2px 10px',fontWeight:700,cursor:'pointer'}} onClick={()=>{setMediaPreview(null);setMediaFile(null);}}>Remove</button>
              </div>
            )}
          </ChatContainer>
        )}
        {showNewMsg && (
          <ModalOverlay onClick={()=>setShowNewMsg(false)}>
            <ModalBox onClick={e=>e.stopPropagation()}>
              <h3 style={{marginBottom:12}}>Start New Message</h3>
              <SearchBar
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{marginBottom:16}}
              />
              <div style={{maxHeight:220,overflowY:'auto',width:'100%'}}>
                {filteredUsers.map((u,i) => (
                  <ConversationItem key={i} onClick={()=>{
                    setShowNewMsg(false);
                    setSelected(null);
                    setTimeout(()=>openConversation(u), 200);
                  }}>
                    <Avatar src={u.img} alt={u.name} />
                    <div>
                      <Name>{u.name}</Name>
                    </div>
                  </ConversationItem>
                ))}
              </div>
              <button style={{marginTop:18,background:'#007aff',color:'#fff',border:'none',borderRadius:12,padding:'8px 24px',fontWeight:700,cursor:'pointer'}} onClick={()=>setShowNewMsg(false)}>Cancel</button>
            </ModalBox>
          </ModalOverlay>
        )}
      </GlassPage>
    </>
  );
} 