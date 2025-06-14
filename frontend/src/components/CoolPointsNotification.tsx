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

const CoolPointsIcon = styled.img`
  width: 32px;
  height: 32px;
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

interface CoolPointsNotificationProps {
  amount: number;
  senderName: string;
  onClose: () => void;
  isMan: boolean;
}

const CoolPointsNotification: React.FC<CoolPointsNotificationProps> = ({
  amount,
  senderName,
  onClose,
  isMan
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const coolIcon = isMan ? '/coolboy.png' : '/coolgirl.png';

  return (
    <NotificationContainer>
      <CoolPointsIcon src={coolIcon} alt="cool points" />
      <Content>
        <Title>Received Cool Points! 🎉</Title>
        <Message>
          {senderName} sent you {amount} cool point{amount > 1 ? 's' : ''}
        </Message>
      </Content>
    </NotificationContainer>
  );
};

export default CoolPointsNotification; 