import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserStatus } from '../utils/userStatus';
import { giftCoolPoint } from '../utils/coolPoints';

interface GreenDotProps {
  isOnline: boolean;
}

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  font-family: 'Interstate', Arial, sans-serif;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled(LoadingSpinner)`
  color: #ff4444;
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  font-family: 'Interstate', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #000;
`;

const ProfileTitle = styled.h1`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1.2rem;
`;

const ProfileSection = styled.div`
  padding: 20px;
  text-align: center;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  object-fit: cover;
  margin-bottom: 15px;
`;

const GreenDot = styled.div<GreenDotProps>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.isOnline ? '#4CAF50' : '#ccc'};
  border-radius: 50%;
  position: absolute;
  top: 20px;
  left: 50%;
  margin-left: 60px;
  border: 2px solid white;
`;

const ProfileName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const InfoItem = styled.span`
  background: #f5f5f5;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
`;

const CoolPoints = styled.div`
  background: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
`;

const CoolPointsLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const CoolPointsValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #007AFF;
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const Section = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

const AboutText = styled.p`
  margin: 0;
  line-height: 1.5;
  color: #333;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const InterestTag = styled.span`
  background: #f0f0f0;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const LinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LinkItem = styled.a`
  color: #007AFF;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const GalleryImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
`;

const GalleryModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const GalleryModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
`;

const GalleryModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
`;

const ProfilePagePublic: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [gifted, setGifted] = useState(false);
  const [error, setError] = useState('');
  const [coolPointsPublic, setCoolPointsPublic] = useState(0);
  const [openGalleryIdx, setOpenGalleryIdx] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // For testing purposes, use mock data if no userId is provided
        if (!userId) {
          const mockUser = {
            name: 'Charlotte Huang',
            age: 28,
            location: 'Shanghai, China',
            job: 'Software Engineer',
            lifestyle: 'Tech Enthusiast',
            coolPointsPublic: 7890,
            lookingFor: 'Tech meetups and cultural exchange',
            website: 'charlottehuang.com',
            photoURL: '/china.png',
            profilePictures: [
              '/china.png',
              '/gallery_placeholder_1.jpg',
              '/gallery_placeholder_2.jpg',
            ],
            verified: true,
            gallery: [
              '/gallery_placeholder_1.jpg',
              '/gallery_placeholder_2.jpg',
              '/gallery_placeholder_3.jpg',
            ],
            interests: ['Technology', 'Travel', 'Photography', 'Chinese Culture'],
            links: [
              { url: 'https://github.com/charlottehuang', label: 'GitHub' },
              { url: 'https://linkedin.com/in/charlottehuang', label: 'LinkedIn' }
            ]
          };
          setUser(mockUser);
          setCoolPointsPublic(mockUser.coolPointsPublic);
          setIsOnline(true);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        setUser({
          ...userData,
          userId: userDoc.id
        });
        setCoolPointsPublic(userData.coolPointsPublic || 0);
        setIsOnline(userData.isOnline || false);

        const unsub = onSnapshot(doc(db, 'users', userId), 
          (docSnap) => {
            if (docSnap.exists()) {
              const updatedData = docSnap.data();
              setUser({
                ...updatedData,
                userId: docSnap.id
              });
              setCoolPointsPublic(updatedData.coolPointsPublic || 0);
              setIsOnline(updatedData.isOnline || false);
            }
          },
          (err) => {
            console.error('Error in real-time listener:', err);
          }
        );

        setLoading(false);
        return () => unsub();
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Error loading user data. Please try again.');
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner>Loading profile...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!user) {
    return <ErrorMessage>No user data available</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <ProfileTitle>Profile</ProfileTitle>
      </Header>

      <ProfileSection>
        <ProfileImage src={user.photoURL || '/default_profile.png'} alt={user.name} />
        {isOnline && <GreenDot isOnline={isOnline} />}
        <ProfileName>{user.name}</ProfileName>
        <ProfileInfo>
          <InfoItem>{user.age} years old</InfoItem>
          <InfoItem>{user.location}</InfoItem>
          <InfoItem>{user.job}</InfoItem>
          <InfoItem>{user.lifestyle}</InfoItem>
        </ProfileInfo>
        <CoolPoints>
          <CoolPointsLabel>Cool Points</CoolPointsLabel>
          <CoolPointsValue>{coolPointsPublic.toLocaleString()}</CoolPointsValue>
        </CoolPoints>
      </ProfileSection>

      <ActionButtons>
        <ActionButton onClick={() => {}}>
          Gift Cool Points
        </ActionButton>
        <ActionButton onClick={() => {}}>
          Message
        </ActionButton>
        <ActionButton onClick={() => {}}>
          Connect
        </ActionButton>
      </ActionButtons>

      <Section>
        <SectionTitle>About</SectionTitle>
        <AboutText>{user.lookingFor}</AboutText>
      </Section>

      <Section>
        <SectionTitle>Interests</SectionTitle>
        <InterestsList>
          {user.interests?.map((interest: string, index: number) => (
            <InterestTag key={index}>{interest}</InterestTag>
          ))}
        </InterestsList>
      </Section>

      <Section>
        <SectionTitle>Links</SectionTitle>
        <LinksList>
          {user.links?.map((link: any, index: number) => (
            <LinkItem key={index} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </LinkItem>
          ))}
        </LinksList>
      </Section>

      <Section>
        <SectionTitle>Gallery</SectionTitle>
        <GalleryGrid>
          {user.gallery?.map((image: string, index: number) => (
            <GalleryImage
              key={index}
              src={image}
              alt={`Gallery image ${index + 1}`}
              onClick={() => setOpenGalleryIdx(index)}
            />
          ))}
        </GalleryGrid>
      </Section>

      {openGalleryIdx !== null && (
        <GalleryModal onClick={() => setOpenGalleryIdx(null)}>
          <GalleryModalContent>
            <GalleryModalImage
              src={user.gallery[openGalleryIdx]}
              alt={`Gallery image ${openGalleryIdx + 1}`}
            />
          </GalleryModalContent>
        </GalleryModal>
      )}
    </Container>
  );
};

export default ProfilePagePublic; 