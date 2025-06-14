import React, { useState } from 'react';
import styled from 'styled-components';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Button = styled.button`
  width: 48%;
  margin: 24px 0 0 0;
  padding: 14px 0;
  font-size: 1.1rem;
  background: linear-gradient(90deg, #007aff 0%, #00b8ff 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 2px 18px rgba(30,40,80,0.10);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.18s, background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #00b8ff 0%, #007aff 100%);
    box-shadow: 0 4px 24px rgba(30,40,80,0.13);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
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
    if (!currentUser) {
      alert('Please log in to send messages');
      return;
    }
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
        const chatId = `${currentUser.uid}_${targetUserId}`;
        const chatRef = doc(db, 'conversations', chatId);
        
        await setDoc(chatRef, {
          users: [currentUser.uid, targetUserId],
          createdAt: new Date(),
          lastMessage: '',
          lastMessageTime: new Date(),
          userMetas: {
            [currentUser.uid]: {
              name: currentUser.displayName || 'User',
              photo: currentUser.photoURL || ''
            },
            [targetUserId]: {
              name: targetUserName,
              photo: ''
            }
          }
        });

        // Navigate to the new chat
        navigate(`/messages?chat=${chatId}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStartChat} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Message'}
    </Button>
  );
};

export default MessageButton; 