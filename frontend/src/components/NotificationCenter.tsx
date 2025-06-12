import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiX, FiMessageSquare, FiUserPlus, FiHeart, FiMessageCircle, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Notification, subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notificationUtils';
import { useAuth } from '../contexts/AuthContext';

const slideIn = keyframes`
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const NotificationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  animation: ${fadeIn} 0.3s ease;
`;

const NotificationContainer = styled.div`
  width: 100%;
  max-width: 430px;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-radius: 36px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  border: 1.5px solid rgba(255,255,255,0.35);
  overflow: hidden;
  animation: ${slideIn} 0.3s ease;
`;

const NotificationHeader = styled.div`
  padding: 16px;
  background: rgba(255,255,255,0.45);
  border-bottom: 1.5px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NotificationHeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.5px;
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
`;

const CloseButton = styled.button`
  background: rgba(255,255,255,0.45);
  border: 1.5px solid #eee;
  color: #111;
  cursor: pointer;
  padding: 8px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 700;
  
  &:hover {
    background: rgba(255,255,255,0.65);
    transform: scale(1.05);
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 70px);
`;

const NotificationItem = styled.div<{ unread?: boolean }>`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: ${props => props.unread ? 'rgba(0, 122, 255, 0.05)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &:hover {
    background: rgba(0, 122, 255, 0.08);
  }
`;

const NotificationIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: ${props => {
    switch (props.type) {
      case 'message': return 'rgba(0, 122, 255, 0.1)';
      case 'connection': return 'rgba(52, 199, 89, 0.1)';
      case 'like': return 'rgba(255, 59, 48, 0.1)';
      case 'comment': return 'rgba(255, 149, 0, 0.1)';
      default: return 'rgba(142, 142, 147, 0.1)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.type) {
      case 'message': return '#007AFF';
      case 'connection': return '#34C759';
      case 'like': return '#FF3B30';
      case 'comment': return '#FF9500';
      default: return '#8E8E93';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationItemTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #111;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NotificationBody = styled.div`
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NotificationTime = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
`;

const EmptyState = styled.div`
  padding: 32px;
  text-align: center;
  color: #888;
  font-size: 1.08rem;
  background: rgba(255,255,255,0.65);
  border-radius: 22px;
  margin: 16px;
  box-shadow: 0 4px 16px rgba(30,40,80,0.10);
  border: 1.2px solid rgba(255,255,255,0.25);
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF3B30;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const BellIconWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(currentUser.uid, (newNotifications) => {
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        navigate(`/messages?chat=${notification.data?.chatId}`);
        break;
      case 'connection':
        navigate(`/profile/${notification.senderId}`);
        break;
      // Add more navigation cases as needed
    }
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FiMessageSquare size={20} />;
      case 'connection':
        return <FiUserPlus size={20} />;
      case 'like':
        return <FiHeart size={20} />;
      case 'comment':
        return <FiMessageCircle size={20} />;
      default:
        return <FiBell size={20} />;
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <NotificationOverlay onClick={onClose}>
      <NotificationContainer ref={containerRef} onClick={e => e.stopPropagation()}>
        <NotificationHeader>
          <NotificationHeaderTitle>Notifications</NotificationHeaderTitle>
          <CloseButton onClick={onClose}>
            <FiX size={24} />
          </CloseButton>
        </NotificationHeader>
        <NotificationList>
          {notifications.length === 0 ? (
            <EmptyState>No notifications yet</EmptyState>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                unread={!notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationIcon type={notification.type}>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <NotificationContent>
                  <NotificationItemTitle>{notification.title}</NotificationItemTitle>
                  <NotificationBody>{notification.body}</NotificationBody>
                  <NotificationTime>{formatTime(notification.createdAt)}</NotificationTime>
                </NotificationContent>
              </NotificationItem>
            ))
          )}
        </NotificationList>
      </NotificationContainer>
    </NotificationOverlay>
  );
};

export default NotificationCenter; 