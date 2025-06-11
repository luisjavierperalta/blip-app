import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
  z-index: 1000;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  showPrev?: boolean;
  showNext?: boolean;
}

export default function NavigationArrows({ 
  onPrev, 
  onNext, 
  showPrev = true, 
  showNext = true 
}: NavigationArrowsProps) {
  return (
    <NavContainer>
      <NavButton onClick={onPrev} disabled={!showPrev}>
        ←
      </NavButton>
      <NavButton onClick={onNext} disabled={!showNext}>
        →
      </NavButton>
    </NavContainer>
  );
} 