import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';

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
      <NavButton onClick={() => navigate('/profile')} title="Profile">P</NavButton>
      <Link to="/profile/charlotte" style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 900,
        color: '#007aff',
        textDecoration: 'none',
        border: '2px solid #e6eaf1',
        transition: 'box-shadow 0.18s, background 0.18s',
        cursor: 'pointer',
        marginLeft: 6
      }}>O</Link>
    </NavContainer>
  );
} 