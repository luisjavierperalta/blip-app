import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 400px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  color: #222;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Content = styled.div`
  color: #444;
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const Step = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e6eaf1;
`;

const StepNumber = styled.span`
  background: #007aff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-weight: 600;
`;

const CoolPointsIcon = styled.img`
  width: 32px;
  height: 32px;
  vertical-align: middle;
  margin: 0 4px;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #007aff 0%, #00b8ff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  &:hover {
    background: linear-gradient(90deg, #00b8ff 0%, #007aff 100%);
    transform: translateY(-1px);
  }
`;

interface WelcomeCoolPointsProps {
  onClose: () => void;
  isMan: boolean;
}

const WelcomeCoolPoints: React.FC<WelcomeCoolPointsProps> = ({ onClose, isMan }) => {
  const [step, setStep] = useState(1);
  const coolIcon = isMan ? '/coolboy.png' : '/coolgirl.png';

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Title>Welcome to Cool Points! 🎉</Title>
            <Content>
              <p>You've received 500 cool points to get started! <CoolPointsIcon src={coolIcon} alt="cool points" /></p>
              <p>Cool points are a way to show appreciation and connect with others in the community.</p>
            </Content>
            <Button onClick={() => setStep(2)}>Next</Button>
          </>
        );
      case 2:
        return (
          <>
            <Title>How to Use Cool Points</Title>
            <Content>
              <Step>
                <StepNumber>1</StepNumber>
                Visit other users' profiles
              </Step>
              <Step>
                <StepNumber>2</StepNumber>
                Click the "Send Cool Points" button
              </Step>
              <Step>
                <StepNumber>3</StepNumber>
                Enter the amount you want to send
              </Step>
              <Step>
                <StepNumber>4</StepNumber>
                Watch your cool points grow as others send them to you!
              </Step>
            </Content>
            <Button onClick={() => setStep(3)}>Next</Button>
          </>
        );
      case 3:
        return (
          <>
            <Title>Ready to Start!</Title>
            <Content>
              <p>Your cool points balance is private, but the points you receive are public on your profile.</p>
              <p>Start exploring and connecting with others!</p>
            </Content>
            <Button onClick={onClose}>Get Started</Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ModalOverlay>
      <ModalCard>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {renderStep()}
      </ModalCard>
    </ModalOverlay>
  );
};

export default WelcomeCoolPoints; 