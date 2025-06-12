import React, { useState } from 'react';
import styled from 'styled-components';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

interface MessageButtonProps {
  targetUserId: string;
  targetUserName: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ targetUserId, targetUserName }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartChat = async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'conversations');
      const q = query(
        chatsRef,
        where('users', 'array-contains', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChat = null;

      querySnapshot.forEach((doc) => {
        const chat = doc.data();
        if (chat.users.includes(targetUserId)) {
          existingChat = doc.id;
        }
      });

      if (existingChat) {
        // Navigate to existing chat
        navigate(`/messages?chat=${existingChat}`);
      } else {
        // Create new chat
        const newChat = await addDoc(chatsRef, {
          users: [currentUser.uid, targetUserId],
          createdAt: new Date(),
          lastMessage: '',
          lastMessageTime: new Date()
        });

        // Navigate to new chat
        navigate(`/messages?chat=${newChat.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStartChat} disabled={isLoading}>
      <FiMessageSquare size={18} />
      {isLoading ? 'Starting chat...' : 'Message'}
    </Button>
  );
};

export default MessageButton; 