import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getConnections, getPendingConnections, acceptConnectionRequest, rejectConnectionRequest, removeConnection } from '../services/connections';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #222;
  margin: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e6eaf1;
  padding-bottom: 8px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#007aff' : '#666'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#007aff' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: #007aff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ConnectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  object-fit: cover;
  margin-bottom: 16px;
`;

const Name = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
`;

const Job = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.$danger ? '#ff3b30' : 
    props.$primary ? '#007aff' : '#e6eaf1'
  };
  color: ${props => props.$danger || props.$primary ? 'white' : '#333'};
  
  &:hover {
    background: ${props => 
      props.$danger ? '#ff2d55' : 
      props.$primary ? '#0056b3' : '#d1d5db'
    };
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #666;
  font-size: 1.1rem;
`;

const ConnectionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'connections' | 'pending'>('connections');
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingConnections, setPendingConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const [connectionsList, pendingList] = await Promise.all([
          getConnections(currentUser.uid),
          getPendingConnections(currentUser.uid)
        ]);

        // Fetch user details for each connection
        const connectionsWithDetails = await Promise.all(
          connectionsList.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
          })
        );

        const pendingWithDetails = await Promise.all(
          pendingList.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
          })
        );

        setConnections(connectionsWithDetails.filter(Boolean));
        setPendingConnections(pendingWithDetails.filter(Boolean));
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [currentUser]);

  const handleAcceptConnection = async (userId: string) => {
    try {
      await acceptConnectionRequest(userId, currentUser!.uid);
      // Update the lists
      setPendingConnections(pending => pending.filter(c => c.id !== userId));
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setConnections(prev => [...prev, { id: userId, ...userDoc.data() }]);
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleRejectConnection = async (userId: string) => {
    try {
      await rejectConnectionRequest(userId, currentUser!.uid);
      setPendingConnections(pending => pending.filter(c => c.id !== userId));
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  const handleRemoveConnection = async (userId: string) => {
    try {
      await removeConnection(currentUser!.uid, userId);
      setConnections(connections => connections.filter(c => c.id !== userId));
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Container>
      <Header>
        <Title>My Network</Title>
      </Header>

      <Tabs>
        <Tab 
          $active={activeTab === 'connections'} 
          onClick={() => setActiveTab('connections')}
        >
          Connections ({connections.length})
        </Tab>
        <Tab 
          $active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingConnections.length})
        </Tab>
      </Tabs>

      {loading ? (
        <EmptyState>Loading...</EmptyState>
      ) : activeTab === 'connections' ? (
        connections.length > 0 ? (
          <Grid>
            {connections.map((connection) => (
              <ConnectionCard key={connection.id}>
                <ProfileImage 
                  src={connection.photoURL || '/default-avatar.png'} 
                  alt={connection.displayName}
                />
                <Name>{connection.displayName}</Name>
                <Job>{connection.job || 'No job title'}</Job>
                <ButtonGroup>
                  <Button $primary onClick={() => handleViewProfile(connection.id)}>
                    View Profile
                  </Button>
                  <Button $danger onClick={() => handleRemoveConnection(connection.id)}>
                    Remove
                  </Button>
                </ButtonGroup>
              </ConnectionCard>
            ))}
          </Grid>
        ) : (
          <EmptyState>No connections yet</EmptyState>
        )
      ) : (
        pendingConnections.length > 0 ? (
          <Grid>
            {pendingConnections.map((connection) => (
              <ConnectionCard key={connection.id}>
                <ProfileImage 
                  src={connection.photoURL || '/default-avatar.png'} 
                  alt={connection.displayName}
                />
                <Name>{connection.displayName}</Name>
                <Job>{connection.job || 'No job title'}</Job>
                <ButtonGroup>
                  <Button $primary onClick={() => handleAcceptConnection(connection.id)}>
                    Accept
                  </Button>
                  <Button onClick={() => handleRejectConnection(connection.id)}>
                    Decline
                  </Button>
                </ButtonGroup>
              </ConnectionCard>
            ))}
          </Grid>
        ) : (
          <EmptyState>No pending connection requests</EmptyState>
        )
      )}
    </Container>
  );
};

export default ConnectionsPage; 