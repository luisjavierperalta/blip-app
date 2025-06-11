import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 20px;
`;

const Title = styled.h1`
  color: #222;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
`;

export default function HomePage() {
  return (
    <Container>
      <Title>Welcome to Blip!</Title>
    </Container>
  );
} 