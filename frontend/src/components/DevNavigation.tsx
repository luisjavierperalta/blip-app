import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

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

const pageOrder = ['/', '/setup-profile', '/home'];

export default function DevNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const currentIndex = pageOrder.indexOf(currentPath);

  // If not found, default to Auth page
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const prevPage = pageOrder[(safeIndex - 1 + pageOrder.length) % pageOrder.length];
  const nextPage = pageOrder[(safeIndex + 1) % pageOrder.length];

  return (
    <NavContainer>
      <NavButton onClick={() => navigate(prevPage)} title={`Go to ${prevPage === '/' ? 'Auth' : prevPage === '/setup-profile' ? 'Profile Setup' : 'Home'}`}>←</NavButton>
      <NavButton onClick={() => navigate(nextPage)} title={`Go to ${nextPage === '/' ? 'Auth' : nextPage === '/setup-profile' ? 'Profile Setup' : 'Home'}`}>→</NavButton>
      <NavButton onClick={() => navigate('/home')} title="Go to Home">H</NavButton>
    </NavContainer>
  );
} 