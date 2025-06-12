import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const NavContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #FF6B00;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    background: #FF8533;
  }
`;

export default function DevNavigation() {
  const navigate = useNavigate();
  return (
    <NavContainer>
      <NavButton onClick={() => navigate('/')} title="Auth">A</NavButton>
      <NavButton onClick={() => navigate('/login')} title="Login">B</NavButton>
      <NavButton onClick={() => navigate('/home')} title="Home">H</NavButton>
    </NavContainer>
  );
} 