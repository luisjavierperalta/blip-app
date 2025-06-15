import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import icon from '../icon.png';
import verifiedBadge from '../verified.png';
import mealIcon from '../activity-icons/meal.png';
import computerWorkerIcon from '../activity-icons/computer-worker.png';
import bookIcon from '../activity-icons/book.png';
import musicPlayerIcon from '../activity-icons/music-player.png';
import clapperboardIcon from '../activity-icons/clapperboard.png';
import walkingIcon from '../activity-icons/walking.png';
import runningIcon from '../activity-icons/running.png';
import { useNavigate, useLocation } from 'react-router-dom';
import MessageButton from './MessageButton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import SearchPage from './SearchPage';
import { FiBell } from 'react-icons/fi';
import NotificationCenter from './NotificationCenter';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import Modal from 'react-modal';

export const users = [
  {
    uid: '1',
    name: 'John Doe',
    age: 28,
    img: 'https://randomuser.me/api/portraits/men/1.jpg',
    activity: 'Working',
    distance: '2.5 km away',
    verified: true
  },
  {
    uid: '2',
    name: 'Jane Smith',
    age: 25,
    img: 'https://randomuser.me/api/portraits/women/2.jpg',
    activity: 'Reading',
    distance: '1.8 km away',
    verified: true
  },
  {
    uid: '3',
    name: 'Mike Johnson',
    age: 32,
    img: 'https://randomuser.me/api/portraits/men/3.jpg',
    activity: 'Running',
    distance: '3.2 km away',
    verified: false
  },
  {
    uid: '4',
    name: 'Sarah Williams',
    age: 27,
    img: 'https://randomuser.me/api/portraits/women/4.jpg',
    activity: 'Listening to Music',
    distance: '4.1 km away',
    verified: true
  }
];

const mockusers = [
  {
    uid: '1',
    displayName: 'Charlotte Huang',
    age: 27,
    photoURL: 'https://randomuser.me/api/portraits/women/44.jpg',
    activity: 'Running',
    distance: '100m',
    verified: true
  },
  {
    uid: '2',
    displayName: 'Elija Williams',
    age: 30,
    photoURL: 'https://randomuser.me/api/portraits/men/45.jpg',
    activity: 'Music Studio',
    distance: '250m',
    verified: true
  },
  {
    uid: '3',
    displayName: 'Ryan Carter',
    age: 25,
    photoURL: 'https://randomuser.me/api/portraits/men/46.jpg',
    activity: 'Cycling',
    distance: '200m',
    verified: false
  },
  {
    uid: '4',
    displayName: 'Samantha Lee',
    age: 29,
    photoURL: 'https://randomuser.me/api/portraits/women/47.jpg',
    activity: 'Reading',
    distance: '300m',
    verified: true
  },
  {
    uid: '5',
    displayName: 'Lucas Martin',
    age: 31,
    photoURL: 'https://randomuser.me/api/portraits/men/48.jpg',
    activity: 'Gaming',
    distance: '400m',
    verified: false
  },
  {
    uid: '6',
    displayName: 'Emily Turner',
    age: 26,
    photoURL: 'https://randomuser.me/api/portraits/women/49.jpg',
    activity: 'Cooking',
    distance: '150m',
    verified: true
  }
];

const mockActivityPhotos = [
  '/gallery_placeholder_1.jpg',
  '/gallery_placeholder_2.jpg',
  '/gallery_placeholder_3.jpg',
];

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Regular.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Bold.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/Interstate-Light.woff2') format('woff2');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }
  body {
    font-family: 'Interstate', Arial, Helvetica, sans-serif;
    background: #e6eaf1;
  }
`;

const GlassContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: none;
  padding: 0;
`;

const GlassMain = styled.div`
  margin: 32px 0 0 0;
  width: 100vw;
  max-width: 430px;
  min-height: 90vh;
  background: rgba(255,255,255,0.28);
  border-radius: 36px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  border: 1.5px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const PlainHeader = styled.div`
  width: 100%;
  max-width: 430px;
  margin: 32px auto 0 auto;
  padding: 0 12px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  position: relative;
  z-index: 20;
`;

const HeaderLogo = styled.img`
  width: 110px;
  height: 110px;
  object-fit: contain;
  margin-left: 0;
  @media (max-width: 430px) {
    width: 80px;
    height: 80px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 0;
  margin-left: 12px;
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
`;

const HeaderProfilePic = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 3px 14px rgba(0,0,0,0.12);
  margin-right: 0;
  margin-left: 8px;
  margin-top: 0;
  margin-bottom: 0;
  @media (max-width: 430px) {
    width: 90px;
    height: 90px;
    margin-left: 4px;
  }
`;

const BellIcon = styled.span`
  font-size: 2.1rem;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ModernBell = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const GlassSection = styled.div`
  width: 92%;
  margin: 0 auto 18px auto;
  background: rgba(255,255,255,0.45);
  border-radius: 28px;
  box-shadow: 0 2px 16px rgba(30,40,80,0.08);
  border: 1.2px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 24px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const WelcomeTitle = styled.div`
  font-size: 1.85rem;
  font-weight: 900;
  color: #111;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
`;

const WelcomeSub = styled.div`
  color: #888;
  font-size: 1.15rem;
  margin-bottom: 18px;
`;

const SectionTitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const SectionTitle = styled.div`
  font-size: 1.65rem;
  font-weight: 900;
  color: #222;
  margin-right: 8px;
`;

const GreenDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  background: ${props => props.isOnline ? '#00e676' : '#ff3b30'};
  border-radius: 50%;
  margin-left: 4px;
  animation: pulse 1.5s infinite;
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const FilterRow = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  margin: 12px 0 18px 0;
`;

const FilterBtn = styled.button<{active?: boolean}>`
  background: ${p => p.active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)'};
  border: 1.5px solid ${p => p.active ? '#ff6600' : 'rgba(255,255,255,0.25)'};
  color: ${p => p.active ? '#ff6600' : '#888'};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  padding: 7px 22px;
  border-radius: 22px;
  box-shadow: ${p => p.active ? '0 2px 8px rgba(255,102,0,0.08)' : 'none'};
  transition: all 0.2s;
  outline: none;
  backdrop-filter: blur(8px);
`;

const AppleGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const AppleUserCell = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 0.8/1;
  min-height: 260px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(30,40,80,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  background: #fff;
`;

const AppleProfilePic = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  z-index: 1;
`;

const AppleBadgeStack = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
`;

const AppleVerifiedBadge = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
`;

const AppleActivityIcon = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
`;

const AppleInfo = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 14px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
  background: linear-gradient(0deg, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0.0) 100%);
`;

const AppleNameAge = styled.div`
  font-weight: 600;
  font-size: 1.08rem;
  color: #fff;
  margin-bottom: 2px;
  font-family: 'Inter', 'Arial', sans-serif;
`;

const AppleDistance = styled.div`
  color: #eee;
  font-size: 0.97rem;
  margin-bottom: 2px;
  font-family: 'Inter', 'Arial', sans-serif;
`;

const AppleActivity = styled.div`
  color: #1ecb83;
  font-size: 1.01rem;
  font-weight: 500;
  font-family: 'Inter', 'Arial', sans-serif;
`;

const HomeIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M4 10v8a2 2 0 0 0 2 2h3m6 0h3a2 2 0 0 0 2-2v-8"/><path d="M9 22V12h6v10"/></svg>
);
const MapIcon = ({active}: {active?: boolean}) => (
  <img 
    src="/map.png" 
    alt="map" 
    style={{ 
      width: '26px', 
      height: '26px',
      opacity: active ? 1 : 0.7,
      transition: 'opacity 0.2s ease',
      filter: active ? 'hue-rotate(0deg) saturate(2)' : 'hue-rotate(0deg) saturate(1)'
    }} 
  />
);
const SearchIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const MessageIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const NavMenuWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 8px 0 24px 0;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const BottomNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 32px;
  box-shadow: 0 4px 32px rgba(30,40,80,0.18);
  border: 1.5px solid rgba(200,200,200,0.18);
  padding: 8px 18px 8px 18px;
  min-width: 320px;
  max-width: 95vw;
`;

const NavBtn = styled.button<{active?: boolean}>`
  background: ${p => p.active ? 'rgba(255,102,0,0.12)' : 'transparent'};
  border: 2px solid ${p => p.active ? '#ff6600' : 'transparent'};
  color: ${p => p.active ? '#ff6600' : '#888'};
  font-size: 2.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  border-radius: 28px;
  padding: 16px 28px 8px 28px;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s, border 0.18s;
  font-weight: 700;
  box-shadow: ${p => p.active ? '0 2px 8px rgba(255,102,0,0.10)' : 'none'};
  &:hover {
    background: rgba(255,102,0,0.13);
    color: #ff6600;
    border: 2px solid #ff6600;
    box-shadow: 0 4px 16px rgba(255,102,0,0.10);
    transform: scale(1.07);
  }
  &:active {
    background: rgba(255,102,0,0.18);
    color: #ff6600;
    border: 2px solid #ff6600;
    box-shadow: 0 6px 24px rgba(255,102,0,0.13);
    transform: scale(0.97);
  }
`;

const NavLabel = styled.div`
  font-size: 1.25rem;
  margin-top: 6px;
  font-weight: 800;
  text-align: center;
  color: #111;
`;

const ModernActivityIcon = ({ activity }: { activity: string }) => {
  switch (activity) {
    case 'Running':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    case 'Music Studio':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'Cycling':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18l3-3h6l3 3"/></svg>;
    case 'Reading':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case 'Gaming':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15" y2="13"/><line x1="17" y1="11" x2="17" y2="15"/></svg>;
    case 'Cooking':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00b894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
    default:
      return null;
  }
};

const RealisticActivityIcon = ({ activity }: { activity: string }) => {
  const icons = [mealIcon, computerWorkerIcon, bookIcon, musicPlayerIcon, clapperboardIcon, walkingIcon, runningIcon];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  return <img src={randomIcon} alt={activity} style={{ width: 24, height: 24 }} />;
};

// Utility to calculate distance in meters between two lat/lon points
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
}

const Tooltip = styled.div`
  position: absolute;
  background: #222;
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  z-index: 100;
  top: 28px;
  left: 0;
  box-shadow: 0 2px 8px rgba(30,40,80,0.12);
`;

const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<'300m' | '25km' | '1000km'>('300m');
  const [hubOpen, setHubOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLon, setCurrentLon] = useState<number | null>(null);
  const [userCounts, setUserCounts] = useState<{ available: number; active: number }>({ available: 0, active: 0 });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showActivityCarousel, setShowActivityCarousel] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [userDistances, setUserDistances] = useState<{ [uid: string]: number }>({});
  const [showFeedDotTooltip, setShowFeedDotTooltip] = useState(false);

  // Fetch current user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLon(position.coords.longitude);
        },
        (error) => {
          setCurrentLat(null);
          setCurrentLon(null);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch nearby users from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('uid', '!=', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifications) => {
      setUnreadCount(notifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch user counts for map icon
  useEffect(() => {
    const fetchCounts = async () => {
      if (!currentLat || !currentLon) return;
      try {
        const getUserCountsByRange = httpsCallable(functions, 'getUserCountsByRange');
        const res: any = await getUserCountsByRange({ filter, lat: currentLat, lon: currentLon });
        if (res && res.data) setUserCounts(res.data);
      } catch (e) {
        // fallback: don't update
      }
    };
    fetchCounts();
  }, [filter, currentLat, currentLon]);

  // Update distances in real-time as current user moves
  useEffect(() => {
    if (!currentLat || !currentLon) return;
    const newDistances: { [uid: string]: number } = {};
    users.forEach((user: any) => {
      if (user.location && user.location.latitude && user.location.longitude) {
        newDistances[user.uid] = getDistanceFromLatLonInMeters(currentLat, currentLon, user.location.latitude, user.location.longitude);
      }
    });
    setUserDistances(newDistances);
  }, [currentLat, currentLon, users]);

  // Define filter radius in meters
  const filterRadius = filter === '300m' ? 300 : filter === '25km' ? 25000 : 1000000;

  // Filter users by distance if location is available
  const filteredUsers = users.filter((user: any) => {
    if (!currentLat || !currentLon || !user.location) return true;
    const userLat = user.location.latitude;
    const userLon = user.location.longitude;
    const distance = getDistanceFromLatLonInMeters(currentLat, currentLon, userLat, userLon);
    return distance <= filterRadius;
  });

  return (
    <>
      <GlobalStyle />
      <GlassContainer>
        <GlassMain>
          <PlainHeader>
            <HeaderLogo src={icon} alt="blip" />
            <HeaderRight>
              <BellIconWrapper onClick={() => setShowNotifications(true)}>
                <FiBell size={24} />
                {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
              </BellIconWrapper>
              <HeaderProfilePic src={currentUser?.photoURL || "/IMG_20250315_193341(1)(1).png"} alt="profile" onClick={() => navigate('/profile')} />
            </HeaderRight>
          </PlainHeader>
          <GlassSection style={{marginTop: 18}}>
            <WelcomeTitle>Welcome, luisjavierperalta</WelcomeTitle>
            <WelcomeSub>Find new friends now, in real-time</WelcomeSub>
            <SectionTitleRow>
              <SectionTitle>Live Activity Feed</SectionTitle>
              <div style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setShowFeedDotTooltip(true)}
                onMouseLeave={() => setShowFeedDotTooltip(false)}>
                <GreenDot isOnline={currentUser?.isOnline || false} />
                {showFeedDotTooltip && (
                  <Tooltip>
                    {currentUser?.isOnline ? 'Online' : 'Offline'}
                  </Tooltip>
                )}
              </div>
            </SectionTitleRow>
          </GlassSection>
          <FilterRow>
            <FilterBtn active={filter==='300m'} onClick={()=>setFilter('300m')}>Within 300m</FilterBtn>
            <FilterBtn active={filter==='25km'} onClick={()=>setFilter('25km')}>Within 25km</FilterBtn>
            <FilterBtn active={filter==='1000km'} onClick={()=>setFilter('1000km')}>EU-wide (1000km)</FilterBtn>
          </FilterRow>
          <AppleGrid>
            {mockusers.map((user) => {
              // Use real-time distance if available, else fallback to mock
              let realtimeDistance = userDistances[user.uid];
              let distanceStr = realtimeDistance !== undefined
                ? (realtimeDistance < 1000 ? `${Math.round(realtimeDistance)}m` : `${(realtimeDistance/1000).toFixed(1)}km`)
                : (user.distance || 'Unknown distance');
              return (
                <AppleUserCell key={user.uid} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                  <AppleBadgeStack>
                    {user.verified && <AppleVerifiedBadge src={verifiedBadge} alt="verified" />}
                    <GreenDot isOnline={user.verified} />
                    <AppleActivityIcon>
                      {user.icon ? user.icon : (user.activity === 'Running' ? '🏃' : user.activity === 'Music Studio' ? '🎵' : user.activity === 'Cycling' ? '🚴' : user.activity === 'Reading' ? '📚' : '🎯')}
                    </AppleActivityIcon>
                  </AppleBadgeStack>
                  <AppleProfilePic src={user.photoURL || 'https://via.placeholder.com/150'} alt={user.displayName} />
                  <AppleInfo>
                    <AppleNameAge>{user.displayName}, {user.age}</AppleNameAge>
                    <AppleActivity>Activity: {user.activity || 'No activity'}</AppleActivity>
                    <AppleDistance>{distanceStr}</AppleDistance>
                  </AppleInfo>
                </AppleUserCell>
              );
            })}
          </AppleGrid>
          
          <NavMenuWrapper>
            <BottomNav>
              <NavBtn active={location.pathname === '/home'} onClick={() => navigate('/home')} style={{ marginLeft: 8, marginRight: -16 }}>
                <HomeIcon active={location.pathname === '/home'} />
                <NavLabel>Home</NavLabel>
              </NavBtn>
              <NavBtn active={location.pathname === '/map'} onClick={() => navigate('/map')}>
                <div style={{ position: 'relative' }}>
                  <MapIcon active={location.pathname === '/map'} />
                  {(userCounts.available > 0 || userCounts.active > 0) && (
                    <NotificationBadge style={{
                      top: -8,
                      right: -8,
                      background: '#1ecb83',
                      color: 'white',
                      minWidth: 22,
                      height: 22,
                      fontSize: '0.85rem',
                      borderRadius: 11,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      zIndex: 2
                    }}>
                      {userCounts.available}/{userCounts.active}
                    </NotificationBadge>
                  )}
                </div>
                <NavLabel>Map</NavLabel>
              </NavBtn>
              <NavBtn active={location.pathname === '/search'} onClick={() => navigate('/search')}>
                <SearchIcon active={location.pathname === '/search'} />
                <NavLabel>Search</NavLabel>
              </NavBtn>
              <NavBtn active={location.pathname === '/messages'} onClick={() => navigate('/messages')} style={{ marginRight: 8, marginLeft: -16 }}>
                <MessageIcon active={location.pathname === '/messages'} />
                <NavLabel>Messages</NavLabel>
              </NavBtn>
            </BottomNav>
          </NavMenuWrapper>
        </GlassMain>
      </GlassContainer>
      {showSearch && <SearchPage onClose={() => setShowSearch(false)} />}
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}
      {/* Modal for user cell */}
      <Modal
        isOpen={!!selectedUser}
        onRequestClose={() => setSelectedUser(null)}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1000 },
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            borderRadius: '32px', padding: 0, border: 'none', background: 'none',
            maxWidth: 540, width: '98vw', minHeight: 440, overflow: 'visible',
            boxShadow: '0 12px 48px 0 rgba(30,40,80,0.22)',
          }
        }}
        ariaHideApp={false}
      >
        {selectedUser && (
          <div style={{ background: '#222', borderRadius: 32, padding: 0, position: 'relative', boxShadow: '0 12px 48px 0 rgba(30,40,80,0.22)', minWidth: 420 }}>
            {/* Close button */}
            <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: 18, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 2 }}>×</button>
            {/* Preview row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '32px 32px 12px 32px' }}>
              <img src={selectedUser.photoURL} alt={selectedUser.displayName} style={{ width: 80, height: 80, borderRadius: 22, objectFit: 'cover', border: '2.5px solid #fff' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{selectedUser.displayName}, {selectedUser.age}</span>
                  {selectedUser.verified && <img src={verifiedBadge} alt="verified" style={{ width: 28, height: 28, marginLeft: 2 }} />}
                  <GreenDot isOnline={selectedUser.verified} style={{ marginLeft: 6 }} />
                </div>
                <div style={{ color: '#1ecb83', fontWeight: 700, fontSize: 18, marginTop: 2 }}>{selectedUser.activity ? `Activity : ${selectedUser.activity}` : ''}</div>
                {/* Real-time distance below activity (no dot) */}
                <div style={{ color: '#fff', fontWeight: 500, fontSize: 16, marginTop: 4 }}>
                  {userDistances[selectedUser.uid] !== undefined
                    ? (userDistances[selectedUser.uid] < 1000
                        ? `${Math.round(userDistances[selectedUser.uid])}m`
                        : `${(userDistances[selectedUser.uid]/1000).toFixed(1)}km`)
                    : (selectedUser.distance || '100m')}
                </div>
                <div style={{ color: '#fff', fontWeight: 500, fontSize: 15, marginTop: 2 }}>Milan, Italy</div>
              </div>
            </div>
            {/* Cool points row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px 0 32px', marginBottom: 10, marginTop: 8 }}>
              <img src="/coolboy.png" alt="cool" style={{ width: 34, height: 34, borderRadius: 10 }} />
              <span style={{ color: '#1ecb83', fontWeight: 700, fontSize: 22 }}>525 cool points</span>
            </div>
            {/* Buttons row - stretch to fit, symmetrical */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, margin: '28px 0 0 0', padding: '0 32px' }}>
              <button style={{ flex: 1, background: 'linear-gradient(90deg,#007aff 0%,#1ecb83 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 18, padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minWidth: 0, maxWidth: 'none' }}>
                <span role="img" aria-label="Meet Now">👥</span> Meet Now
              </button>
              <button style={{ flex: 1, background: 'linear-gradient(90deg,#1ecb83 0%,#00b8ff 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 18, padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minWidth: 0, maxWidth: 'none' }}>
                <span role="img" aria-label="Send Cool Points">💎</span> Send Cool
              </button>
              <button onClick={() => setShowActivityCarousel(true)} style={{ flex: 1, background: 'linear-gradient(90deg,#ff6600 0%,#ffb300 100%)', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 18, padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minWidth: 0, maxWidth: 'none' }}>
                <img src={icon} alt="activity" style={{ width: 28, height: 28, borderRadius: 7 }} /> Activity
              </button>
            </div>
            {/* Info text */}
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, textAlign: 'center', margin: '28px 0 0 0', padding: '0 32px' }}>
              Click! Meet Now for sending real-time request
            </div>
            <div style={{ color: '#ff3b30', fontWeight: 700, fontSize: 15, textAlign: 'center', margin: '10px 0 24px 0', padding: '0 32px' }}>
              REQUIRED APPROVED REQUEST TO UNLOCK<br />Chat & Messaging locked<br />Joining Activities locked<br />P2P real-time location locked
            </div>
          </div>
        )}
      </Modal>
      {/* Activity carousel overlay */}
      <Modal
        isOpen={showActivityCarousel}
        onRequestClose={() => setShowActivityCarousel(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100 },
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            borderRadius: '24px', padding: 0, border: 'none', background: 'none',
            maxWidth: 340, width: '95vw', minHeight: 340, overflow: 'visible',
          }
        }}
        ariaHideApp={false}
      >
        <div style={{ background: '#fff', borderRadius: 24, padding: 0, position: 'relative', boxShadow: '0 8px 40px 0 rgba(30,40,80,0.18)' }}>
          <button onClick={() => setShowActivityCarousel(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', color: '#222', fontSize: 28, cursor: 'pointer', zIndex: 2 }}>×</button>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 18, margin: '24px 0 0 0' }}>
            <img src={mockActivityPhotos[carouselIdx]} alt={`Activity ${carouselIdx + 1}`} style={{ width: '90%', height: '100%', objectFit: 'cover', borderRadius: 18, boxShadow: '0 2px 12px rgba(30,40,80,0.10)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '18px 0 0 0' }}>
            {mockActivityPhotos.map((_, idx) => (
              <div key={idx} onClick={() => setCarouselIdx(idx)} style={{ width: 12, height: 12, borderRadius: '50%', background: carouselIdx === idx ? '#ff6600' : '#e6eaf1', cursor: 'pointer', transition: 'background 0.2s' }} />
            ))}
          </div>
          <div style={{ color: '#222', fontWeight: 700, fontSize: 15, textAlign: 'center', margin: '18px 0 18px 0' }}>
            Activity Photos
          </div>
        </div>
      </Modal>
    </>
  );
};

const BellIconWrapper = styled.div`  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF3B30;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export default HomePage; 
