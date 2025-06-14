import React, { useEffect } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2000;
  animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 4.7s;
  max-width: 320px;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
`;

const Message = styled.div`
  color: #666;
  font-size: 0.95rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#007aff' : '#e6eaf1'};
  color: ${props => props.$primary ? 'white' : '#333'};
  
  &:hover {
    background: ${props => props.$primary ? '#0056b3' : '#d1d5db'};
    transform: translateY(-1px);
  }
`;

interface ConnectionNotificationProps {
  type: 'request' | 'accepted';
  userName: string;
  onAccept?: () => void;
  onReject?: () => void;
  onClose: () => void;
}

const ConnectionNotification: React.FC<ConnectionNotificationProps> = ({
  type,
  userName,
  onAccept,
  onReject,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <NotificationContainer>
      <Content>
        <Title>
          {type === 'request' ? 'New Connection Request' : 'Connection Accepted!'}
        </Title>
        <Message>
          {type === 'request' 
            ? `${userName} wants to connect with you`
            : `${userName} accepted your connection request`
          }
        </Message>
        {type === 'request' && (
          <ActionButtons>
            <ActionButton onClick={onAccept} $primary>
              Accept
            </ActionButton>
            <ActionButton onClick={onReject}>
              Decline
            </ActionButton>
          </ActionButtons>
        )}
      </Content>
    </NotificationContainer>
  );
};

export default ConnectionNotification; 