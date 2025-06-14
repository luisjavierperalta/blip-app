import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import verifiedBadge from '../verified.png';
import icon from '../icon.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../config/firebase';
import { 
  doc, 
  updateDoc, 
  arrayRemove, 
  getDoc, 
  query, 
  collection, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { subscribeToUserStatus } from '../services/presence';
import { giftCoolPoint } from '../services/coolPoints';
import { useAuth } from '../contexts/AuthContext';
import WelcomeCoolPoints from './WelcomeCoolPoints';
import CoolPointsNotification from './CoolPointsNotification';
import { sendConnectionRequest, getConnectionStatus, getConnectionCount, acceptConnectionRequest, removeConnection } from '../services/connections';
import ConnectionNotification from './ConnectionNotification';
import MessageButton from './MessageButton';

const ProfileBg = styled.div`
  min-height: 100vh;
  width: 100vw;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Interstate', Arial, sans-serif;
  position: relative;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 18px 18px 0 18px;
  position: relative;
`;

const BackArrow = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #222;
  cursor: pointer;
  margin-right: 8px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.8rem;
  font-weight: 950;
  color: #222;
`;

interface GreenDotProps {
  $isOnline: boolean;
}

const GreenDot = styled.span<GreenDotProps>`
  display: inline-block;
  width: 12px;
  height: 12px;
  background: ${props => props.$isOnline ? '#00e676' : '#ff3b30'};
  border-radius: 50%;
  margin-left: 4px;
  animation: pulse 1.5s infinite;
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 24px;
  background: #FF3B30;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  min-width: 26px;
  height: 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Card = styled.div`
  width: 94vw;
  max-width: 390px;
  margin: 32px auto 0 auto;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(30,40,80,0.13), 0 1.5px 0 0 rgba(255,255,255,0.18) inset;
  border: 1.5px solid #e6eaf1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 18px 32px 18px;
  position: relative;
`;

const ProfileImageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
`;

const ProfileImage = styled.img`
  width: 240px;
  height: 280px;
  object-fit: cover;
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(30,40,80,0.10);
  border: 3px solid #e6eaf1;
  background: #f8fafc;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 14px 0 18px 0;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e6eaf1;
  transition: background-color 0.3s ease;
  &.active { 
    background: #222;
    transform: scale(1.2);
  }
`;

const IconStack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24px;
  margin: 18px 0 18px 0;
`;

const AppleIconButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff 70%, #f3f6fa 100%);
  border: 1.5px solid #e6eaf1;
  box-shadow: 0 4px 18px rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.18) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1rem;
  color: #222;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.18s, background 0.18s, border 0.18s, color 0.18s;
  &:before {
    content: '';
    position: absolute;
    top: 7px;
    left: 12px;
    width: 40px;
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 100%);
    border-radius: 50%;
    pointer-events: none;
    filter: blur(0.5px);
  }
  &:hover {
    background: linear-gradient(180deg, #fff 80%, #e6f0ff 100%);
    box-shadow: 0 8px 32px 0 #007aff33, 0 1.5px 0 0 #fff inset;
    border: 1.5px solid #007aff;
    color: #007aff;
  }
`;

const GearBadge = styled(NotificationBadge)`
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  font-size: 0.8rem;
  border-radius: 10px;
`;

const InfoSection = styled.div`
  width: 100%;
  padding: 0 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
`;

const Location = styled.div`
  color: #1ecb83;
  font-size: 1.55rem;
  font-weight: 800;
  margin-bottom: 2px;
`;

const NameAge = styled.div`
  font-size: 1.38rem;
  font-weight: 850;
  color: #222;
  margin-bottom: 2px;
`;

const Job = styled.div`
  color: #222;
  font-size: 1.22rem;
  margin-bottom: 2px;
`;

const Label = styled.span`
  color: #111;
  font-weight: 700;
  font-size: 1.18rem;
`;

const Value = styled.span`
  color: #222;
  font-weight: 500;
  font-size: 1.18rem;
`;

const Website = styled.a`
  color: #1e90ff;
  font-size: 1.32rem;
  text-decoration: underline;
  margin-top: 2px;
  font-weight: 700;
`;

const MyNetworkBtn = styled.button`
  width: 98%;
  margin: 24px auto 0 auto;
  background: linear-gradient(90deg, #007aff 0%, #00b8ff 100%);
  color: #fff;
  font-size: 1.28rem;
  font-weight: 700;
  border: none;
  border-radius: 18px;
  padding: 18px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 2px 18px rgba(30,40,80,0.10);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.18s, background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #00b8ff 0%, #007aff 100%);
    box-shadow: 0 4px 24px rgba(30,40,80,0.13);
  }
`;

const ActionButton = styled(MyNetworkBtn)`
  width: 48%;
  margin: 24px 0 0 0;
  padding: 14px 0;
  font-size: 1.1rem;
`;

const ActionButtonsContainer = styled.div`
  width: 98%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const NetworkIcon = styled.span`
  font-size: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SectionCard = styled.div`
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid #e6eaf1;
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
  margin: 18px auto 0 auto;
  padding: 16px 18px 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ChevronBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #888;
  transition: transform 0.18s;
`;

const SectionTitle = styled.div`
  font-weight: 800;
  font-size: 1.22rem;
  color: #222;
  margin-bottom: 8px;
`;

const ActivityList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActivityItem = styled.div`
  background: #f5f6fa;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 1.12rem;
  color: #333;
  border: 1px solid #e6eaf1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const ActivityDate = styled.div`
  font-size: 1.05rem;
  color: #888;
  margin-top: 2px;
  font-weight: 500;
`;

const ActivityOwner = styled.div`
  font-size: 1.05rem;
  color: #007aff;
  margin-top: 1px;
  font-weight: 600;
`;

const GalleryScroll = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 22px auto 0 auto;
  padding: 8px 0 18px 0;
  display: flex;
  flex-direction: row;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #e6eaf1 #fff;
  white-space: nowrap;
  &::-webkit-scrollbar {
    height: 8px;
    background: #fff;
  }
  &::-webkit-scrollbar-thumb {
    background: #e6eaf1;
    border-radius: 8px;
  }
`;

const GalleryImage = styled.img`
  width: 150px;
  height: 180px;
  object-fit: cover;
  border-radius: 18px;
  border: 1.5px solid #e6eaf1;
  background: #f5f6fa;
  flex-shrink: 0;
  display: inline-block;
`;

const GalleryModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GalleryModalImage = styled.img`
  max-width: 92vw;
  max-height: 80vh;
  border-radius: 24px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.18);
  background: #fff;
`;

const InterestsSection = styled.div`
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid #e6eaf1;
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
  margin: 22px auto 0 auto;
  padding: 16px 18px 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InterestsTitle = styled.div`
  font-weight: 800;
  font-size: 1.22rem;
  color: #222;
  margin-bottom: 8px;
`;

const InterestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const InterestTag = styled.div`
  background: #e6f4ff;
  color: #007aff;
  font-size: 1.12rem;
  font-weight: 700;
  border-radius: 16px;
  padding: 8px 18px;
  border: 1.5px solid #b3e0ff;
  box-shadow: 0 1px 4px rgba(30,40,80,0.04);
`;

const LinksSection = styled.div`
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid #e6eaf1;
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
  margin: 22px auto 0 auto;
  padding: 16px 18px 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LinksTitle = styled.div`
  font-weight: 800;
  font-size: 1.22rem;
  color: #222;
  margin-bottom: 8px;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const LinkRow = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e90ff;
  font-size: 1.12rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.18s;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 1.5px solid #e6eaf1;
  width: 100%;
  &:hover {
    color: #007aff;
    background: #f0f7ff;
    border-color: #007aff;
  }
`;

const LinkIcon = styled.span`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const LinkUrl = styled.span`
  font-weight: 500;
  font-family: 'Interstate', Arial, sans-serif;
  color: #007aff;
`;

const EditIconBtn = styled.button`
  background: none;
  border: none;
  padding: 0 4px;
  margin-left: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #888;
  transition: color 0.18s;
  &:hover { color: #007aff; }
`;

const TrashIconBtn = styled.button`
  background: none;
  border: none;
  padding: 0 4px;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #ff3b30;
  transition: color 0.18s;
  &:hover { color: #b71c1c; }
`;

// Add new styled component for multiple profile images
const MultiProfileImageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 18px;
`;

const MultiProfileImage = styled.img`
  width: 120px;
  height: 140px;
  object-fit: cover;
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(30,40,80,0.10);
  border: 3px solid #e6eaf1;
  background: #f8fafc;
`;

// Add a scrollable wrapper for up to 3 profile pictures
const ProfileImageCarousel = styled.div`
  width: 240px;
  height: 280px;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 0;
  border-radius: 32px;
  box-shadow: 0 4px 24px rgba(30,40,80,0.10);
  border: 3px solid #e6eaf1;
  background: #f8fafc;
  margin-bottom: 18px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CarouselImage = styled.img`
  width: 240px;
  height: 280px;
  object-fit: cover;
  border-radius: 32px;
  scroll-snap-align: center;
  flex-shrink: 0;
`;

// Add styled component for Cool Points row
const CoolPointsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 1.18rem;
  color: #222;
  font-weight: 600;
`;

const SendCoolPointsBtn = styled(MyNetworkBtn)`
  width: 98%;
  margin: 12px auto 0 auto;
  background: linear-gradient(90deg, #FF9500 0%, #FF2D55 100%);
  padding: 12px 0;
  font-size: 1.1rem;
  &:hover {
    background: linear-gradient(90deg, #FF2D55 0%, #FF9500 100%);
  }
`;

const CoolPointsModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 2001;
  width: 90%;
  max-width: 320px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
`;

const CoolPointsInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e6eaf1;
  border-radius: 12px;
  font-size: 1.1rem;
  margin: 12px 0;
  &:focus {
    outline: none;
    border-color: #007aff;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const ConfirmButton = styled(ModalButton)`
  background: #007aff;
  color: white;
  &:hover {
    background: #0056b3;
  }
`;

const CancelButton = styled(ModalButton)`
  background: #e6eaf1;
  color: #333;
  &:hover {
    background: #d1d5db;
  }
`;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  // All useState hooks
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMyActivities, setShowMyActivities] = useState(true);
  const [openGalleryIdx, setOpenGalleryIdx] = useState<number|null>(null);
  const [editActivities, setEditActivities] = useState(false);
  const [myActivities, setMyActivities] = useState([
    { id: '1', title: '🎾 Tennis Match @ Central Park', date: '2024-06-10, 18:00' },
    { id: '2', title: '☕ Coffee Meetup @ Blue Bottle', date: '2024-06-09, 10:30' },
    { id: '3', title: '🎬 Movie Night: Inception', date: '2024-06-08, 21:00' },
  ]);
  const [isOnline, setIsOnline] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCoolPointsModal, setShowCoolPointsModal] = useState(false);
  const [coolPointsAmount, setCoolPointsAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [notification, setNotification] = useState<{
    amount: number;
    senderName: string;
  } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [connectionCount, setConnectionCount] = useState(0);
  const [showConnNotification, setShowConnNotification] = useState(false);
  const [connNotificationType, setConnNotificationType] = useState<'request' | 'accepted'>('request');

  // Get userId from URL params
  const userId = location.pathname.split('/').pop();

  // Mock data for development
  const mockUser = {
    name: 'Luis Javier Peralta',
    age: 27,
    location: 'Milan, Italy',
    job: 'Oracle Certified Junior Software Engineer',
    lifestyle: 'Stakhanovist',
    coolPoints: 5467,
    lookingFor: 'Cinema night!',
    website: 'luisjavierperalta.com',
    photoURL: '/IMG_20250315_193341(1)(1).png',
    profilePictures: [
      '/IMG_20250315_193341(1)(1).png',
      '/gallery_placeholder_1.jpg',
      '/gallery_placeholder_2.jpg',
    ],
    verified: true,
    gallery: [
      '/gallery_placeholder_1.jpg',
      '/gallery_placeholder_2.jpg',
      '/gallery_placeholder_3.jpg',
    ],
    bio: 'Passionate about tech, hiking, and cinema. Always up for a new adventure or a deep conversation.',
    interests: ['Hiking', 'Mountains', 'Running', 'Fashion Design', 'Photography', 'Travel', 'Tech'],
    twitter: 'twitter.com/luisjperalta',
    instagram: 'instagram.com/luisjperalta',
    facebook: 'facebook.com/luisjperalta',
    linkedin: 'linkedin.com/in/luisjperalta',
    github: 'github.com/luisjperalta'
  };

  // All useEffect hooks
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      // Use mock data in development mode when not authenticated
      if (!currentUser && process.env.NODE_ENV === 'development') {
        setUser(mockUser);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            name: userData.displayName || userData.username || 'Anonymous',
            age: userData.age || 0,
            location: userData.location || 'Location not set',
            job: userData.profession || 'Profession not set',
            lifestyle: userData.lifestyle || 'Lifestyle not set',
            coolPoints: userData.coolPointsPublic || 0,
            lookingFor: userData.lookingFor || 'Not specified',
            website: userData.website || '',
            photoURL: userData.profileImages?.[0] || '/default_profile.png',
            profilePictures: userData.profileImages || [],
            verified: userData.verified || false,
            gallery: userData.gallery || [],
            bio: userData.bio || 'No bio yet',
            interests: userData.interests || [],
            twitter: userData.twitter || '',
            instagram: userData.instagram || '',
            facebook: userData.facebook || '',
            linkedin: userData.linkedin || '',
            github: userData.github || ''
          });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // In development, fall back to mock data on error
        if (process.env.NODE_ENV === 'development') {
          setUser(mockUser);
        } else {
          setError('Error fetching user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  useEffect(() => {
    if (userId) {
      const unsubscribe = subscribeToUserStatus(userId, (status) => {
        setIsOnline(status);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  useEffect(() => {
    const checkNewUser = async () => {
      if (!currentUser) return;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Show welcome message if user has just received their cool points
        if (userData.coolPointsBalance === 500 && !userData.hasSeenWelcome) {
          setShowWelcome(true);
          // Mark welcome as seen
          await updateDoc(doc(db, 'users', currentUser.uid), {
            hasSeenWelcome: true
          });
        }
      }
    };

    checkNewUser();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'coolPointsTransactions'),
      where('to', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestTx = snapshot.docs[0].data();
        // Get sender's name
        getDoc(doc(db, 'users', latestTx.from)).then((senderDoc) => {
          if (senderDoc.exists()) {
            setNotification({
              amount: latestTx.amount || 1,
              senderName: senderDoc.data().username || 'Someone'
            });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !userId) return;
    getConnectionStatus(currentUser.uid, userId).then(setConnectionStatus);
    getConnectionCount(userId).then(setConnectionCount);
  }, [currentUser, userId]);

  if (loading) {
    return (
      <ProfileBg>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading profile...</div>
      </ProfileBg>
    );
  }

  if (error) {
    return (
      <ProfileBg>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff3b30' }}>{error}</div>
      </ProfileBg>
    );
  }

  if (!user) {
    return (
      <ProfileBg>
        <div style={{ textAlign: 'center', padding: '20px' }}>User not found</div>
      </ProfileBg>
    );
  }

  const handleRemoveActivity = async (activityId: string) => {
    setMyActivities(myActivities.filter(a => a.id !== activityId));
    try {
      await updateDoc(doc(db, 'users', userId), {
        myActivities: arrayRemove(activityId)
      });
    } catch (e) {
      // Optionally show error
    }
  };

  const gallery = user.gallery && user.gallery.length > 0
    ? user.gallery
    : [...Array(10)].map((_, i) => `/gallery_placeholder_${(i%3)+1}.jpg`);

  // Handle scroll to update dot
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentImageIndex(index);
  };

  // Handle dot click
  const handleDotClick = (index: number) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    carouselRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  };

  // In the ProfilePage component, after the first LinkRow in LinksSection
  const isMan = /luis|john|mike|ryan|lucas|elija/i.test(user.name);
  const coolIcon = isMan ? '/coolboy.png' : '/coolgirl.png';

  const handleSendCoolPoints = async () => {
    if (!currentUser) {
      alert('Please log in to send cool points');
      return;
    }

    if (!coolPointsAmount || isNaN(Number(coolPointsAmount)) || Number(coolPointsAmount) <= 0) {
      alert('Please enter a valid amount of cool points');
      return;
    }

    setIsSending(true);
    try {
      // Send one cool point at a time
      for (let i = 0; i < Number(coolPointsAmount); i++) {
        await giftCoolPoint(currentUser.uid, userId);
      }
      
      setShowCoolPointsModal(false);
      setCoolPointsAmount('');
      alert('Cool points sent successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to send cool points. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser) {
      alert('Please log in to connect');
      return;
    }
    try {
      if (connectionStatus === 'none') {
        await sendConnectionRequest(currentUser.uid, userId);
        setConnectionStatus('pending');
        setConnNotificationType('request');
        setShowConnNotification(true);
      } else if (connectionStatus === 'pending') {
        await acceptConnectionRequest(userId, currentUser.uid);
        setConnectionStatus('connected');
        setConnNotificationType('accepted');
        setShowConnNotification(true);
        setConnectionCount(c => c + 1);
      } else if (connectionStatus === 'connected') {
        await removeConnection(currentUser.uid, userId);
        setConnectionStatus('none');
        setConnectionCount(c => Math.max(0, c - 1));
      }
    } catch (e: any) {
      alert(e.message || 'Connection action failed');
    }
  };

  return (
    <ProfileBg>
      <Header>
        <BackArrow onClick={() => navigate(-1)}>←</BackArrow>
        <NameRow>
          {user.name}
          <GreenDot $isOnline={isOnline} />
        </NameRow>
      </Header>
      <Card>
        <ProfileImageWrapper>
          <ProfileImageCarousel 
            ref={carouselRef}
            onScroll={handleCarouselScroll}
          >
            {user.profilePictures.map((image: string, index: number) => (
              <CarouselImage
                key={index}
                src={image}
                alt={`Profile ${index + 1}`}
              />
            ))}
          </ProfileImageCarousel>
          <Dots>
            {user.profilePictures.map((_, index: number) => (
              <Dot
                key={index}
                className={index === currentImageIndex ? 'active' : ''}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </Dots>
          <SendCoolPointsBtn onClick={() => setShowCoolPointsModal(true)}>
            Send Cool Points
          </SendCoolPointsBtn>
        </ProfileImageWrapper>
        <InfoSection>
          <Location>{user.location}</Location>
          <NameAge>
            <span style={{fontWeight:800}}>{user.name}</span>, {user.age}
            {user.verified && <img src={verifiedBadge} alt="verified" style={{width:32, height:32, marginLeft:10, verticalAlign:'middle'}} />}
          </NameAge>
          <Job>{user.job}</Job>
          <div><Label>Lifestyle</Label>: <Value>{user.lifestyle}</Value></div>
          <div><Label>Looking for</Label>: <Value>{user.lookingFor}</Value></div>
          <CoolPointsRow>
            <img src={coolIcon} alt="cool points" style={{width: 32, height: 32, verticalAlign: 'middle'}} />
            {user.coolPoints.toLocaleString()} Cool Points
          </CoolPointsRow>
          <div style={{marginTop: 8, fontWeight: 600, color: '#007aff'}}>
            {connectionCount} Connections
          </div>
          {user.website && <Website href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website}</Website>}
        </InfoSection>
        <ActionButtonsContainer>
          <ActionButton onClick={handleConnect}>
            {connectionStatus === 'none' && 'Connect'}
            {connectionStatus === 'pending' && 'Pending'}
            {connectionStatus === 'connected' && 'Connected'}
          </ActionButton>
          <MessageButton targetUserId={userId} targetUserName={user.name} />
        </ActionButtonsContainer>
        <MyNetworkBtn onClick={() => navigate('/my-network')}>
          My network
        </MyNetworkBtn>
        <SectionCard>
          <SectionHeader>
            <SectionTitle>About me</SectionTitle>
          </SectionHeader>
          <div style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.5', 
            color: '#444',
            padding: '20px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap'
          }}>
            {user.bio || 'No bio yet'}
          </div>
        </SectionCard>
        <SectionCard>
          <SectionHeader>
            <SectionTitle>My Activities</SectionTitle>
            <div style={{display:'flex',alignItems:'center'}}>
              <EditIconBtn aria-label="Edit activities" onClick={()=>setEditActivities(e=>!e)} title="Edit">
                <span role="img" aria-label="settings">⚙️</span>
              </EditIconBtn>
              <ChevronBtn
                aria-label={showMyActivities ? 'Collapse' : 'Expand'}
                onClick={() => setShowMyActivities(v => !v)}
                style={{ transform: showMyActivities ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                ▼
              </ChevronBtn>
            </div>
          </SectionHeader>
          {showMyActivities && (
            <ActivityList>
              {myActivities.map(a => (
                <ActivityItem key={a.id}>
                  {a.title}
                  <ActivityDate>{a.date}</ActivityDate>
                  {editActivities && (
                    <TrashIconBtn aria-label="Remove activity" title="Remove" onClick={()=>handleRemoveActivity(a.id)}>
                      <span role="img" aria-label="delete">🗑️</span>
                    </TrashIconBtn>
                  )}
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </SectionCard>
        <GalleryScroll>
          {gallery.map((media, i) =>
            media.match(/\.(mp4|webm|ogg)$/i)
              ? (
                  <div key={i} style={{ width: 150, height: 180, borderRadius: 18, overflow: 'hidden', border: '1.5px solid #e6eaf1', background: '#f5f6fa', flexShrink: 0, display: 'inline-block', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setOpenGalleryIdx(i)}>
                    <video src={media} style={{width:'100%',height:'100%',objectFit:'cover'}} controls={false} />
                  </div>
                )
              : (
                  <GalleryImage
                    key={i}
                    src={media}
                    alt={`Gallery ${i+1}`}
                    onClick={() => setOpenGalleryIdx(i)}
                    style={{ cursor: 'pointer' }}
                  />
                )
          )}
        </GalleryScroll>
        {openGalleryIdx !== null && (
          <GalleryModalOverlay onClick={() => setOpenGalleryIdx(null)}>
            {gallery[openGalleryIdx] && gallery[openGalleryIdx].match(/\.(mp4|webm|ogg)$/i)
              ? <video src={gallery[openGalleryIdx]} style={{maxWidth:'92vw',maxHeight:'80vh',borderRadius:24,background:'#fff',boxShadow:'0 8px 40px 0 rgba(30,40,80,0.18)'}} controls autoPlay onClick={e => e.stopPropagation()} />
              : <GalleryModalImage
                  src={gallery[openGalleryIdx]}
                  alt={`Gallery ${openGalleryIdx+1}`}
                  onClick={e => e.stopPropagation()}
                />
            }
          </GalleryModalOverlay>
        )}
        <InterestsSection>
          <InterestsTitle>Interests</InterestsTitle>
          <InterestsList>
            {user.interests.map((interest: string, index: number) => (
              <InterestTag key={index}>{interest}</InterestTag>
            ))}
          </InterestsList>
        </InterestsSection>
        <LinksSection>
          <LinksTitle>Links</LinksTitle>
          <LinkList>
            {Object.entries(user).map(([key, value]) => {
              if (key.startsWith('https://') && key !== user.website) {
                return (
                  <LinkRow key={key} href={key} target="_blank" rel="noopener noreferrer">
                    <LinkIcon>🌐</LinkIcon>
                    <LinkUrl>{value}</LinkUrl>
                  </LinkRow>
                );
              }
              return null;
            })}
          </LinkList>
        </LinksSection>
      </Card>

      {showCoolPointsModal && (
        <>
          <ModalOverlay onClick={() => setShowCoolPointsModal(false)} />
          <CoolPointsModal>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Send Cool Points</h3>
            <p style={{ margin: '8px 0', color: '#666' }}>Enter the amount of cool points you want to send</p>
            <CoolPointsInput
              type="number"
              value={coolPointsAmount}
              onChange={(e) => setCoolPointsAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
            />
            <ModalButtons>
              <CancelButton onClick={() => setShowCoolPointsModal(false)}>
                Cancel
              </CancelButton>
              <ConfirmButton onClick={handleSendCoolPoints} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </ConfirmButton>
            </ModalButtons>
          </CoolPointsModal>
        </>
      )}

      {showWelcome && (
        <WelcomeCoolPoints
          onClose={() => setShowWelcome(false)}
          isMan={isMan}
        />
      )}

      {notification && (
        <CoolPointsNotification
          amount={notification.amount}
          senderName={notification.senderName}
          onClose={() => setNotification(null)}
          isMan={isMan}
        />
      )}

      {showConnNotification && (
        <ConnectionNotification
          type={connNotificationType}
          userName={user.name}
          onAccept={() => setShowConnNotification(false)}
          onReject={() => setShowConnNotification(false)}
          onClose={() => setShowConnNotification(false)}
        />
      )}
    </ProfileBg>
  );
};

export default ProfilePage; 