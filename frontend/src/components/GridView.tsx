import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { subscribeToUserStatus } from '../services/presence';

const GreenDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  background: ${props => props.isOnline ? '#00e676' : '#ff3b30'};
  border-radius: 50%;
  margin-left: 4px;
  animation: pulse 1.5s infinite;
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const GridItem = styled.div`
  width: 200px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  border: 1.5px solid #e6eaf1;
  box-shadow: 0 4px 12px rgba(30,40,80,0.08);
`;

const UserName = styled.h3`
  margin: 12px 0 4px 0;
  font-size: 1.1rem;
  color: #222;
  font-weight: 600;
`;

const MeetNowButton = styled.button`
  width: 100%;
  padding: 8px 0;
  background: linear-gradient(180deg, #fff 70%, #f3f6fa 100%);
  border: 1.5px solid #e6eaf1;
  border-radius: 12px;
  color: #007aff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(30,40,80,0.08);
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: linear-gradient(180deg, #fff 80%, #e6f0ff 100%);
    border-color: #007aff;
    box-shadow: 0 4px 12px rgba(0,122,255,0.15);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const GridView = ({ users }) => {
  const [onlineStatus, setOnlineStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const unsubscribers = users.map(user => 
      subscribeToUserStatus(user.id, (isOnline) => {
        setOnlineStatus(prev => ({
          ...prev,
          [user.id]: isOnline
        }));
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [users]);

  const handleMeetNow = (userId: string) => {
    // TODO: Implement meet now functionality
    console.log('Meet now clicked for user:', userId);
  };

  return (
    <GridContainer>
      {users.map((user) => (
        <GridItem key={user.id}>
          <UserImage src={user.photoURL} alt={user.name} />
          <UserName>{user.name}</UserName>
          <GreenDot isOnline={onlineStatus[user.id] || false} />
          <MeetNowButton onClick={() => handleMeetNow(user.id)}>
            <span role="img" aria-label="video">📹</span>
            Meet Now
          </MeetNowButton>
        </GridItem>
      ))}
    </GridContainer>
  );
};

export default GridView; 