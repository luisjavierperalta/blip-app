import React, { useState } from 'react';
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

const users = [
  {
    name: 'Charlotte Huang', age: 27, distance: '100m', activity: 'Running', img: 'https://randomuser.me/api/portraits/women/44.jpg',
    verified: true, status: 'video',
  },
  {
    name: 'Elija Williams', age: 30, distance: '250m', activity: 'Music Studio', img: 'https://randomuser.me/api/portraits/men/45.jpg',
    verified: true, status: 'phone',
  },
  {
    name: 'Ryan Carter', age: 25, distance: '200m', activity: 'Cycling', img: 'https://randomuser.me/api/portraits/men/46.jpg',
    verified: true, status: 'video',
  },
  {
    name: 'Samantha Lee', age: 29, distance: '300m', activity: 'Reading', img: 'https://randomuser.me/api/portraits/women/47.jpg',
    verified: true, status: 'phone',
  },
  {
    name: 'John Doe', age: 28, distance: '150m', activity: 'Gaming', img: 'https://randomuser.me/api/portraits/men/48.jpg',
    verified: true, status: 'video',
  },
  {
    name: 'Jane Smith', age: 31, distance: '400m', activity: 'Cooking', img: 'https://randomuser.me/api/portraits/women/49.jpg',
    verified: true, status: 'phone',
  },
];

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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  margin-right: 0;
  margin-left: 8px;
  margin-top: 0;
  margin-bottom: 0;
  @media (max-width: 430px) {
    width: 76px;
    height: 76px;
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
  font-size: 1.35rem;
  font-weight: 800;
  color: #111;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
`;

const WelcomeSub = styled.div`
  color: #888;
  font-size: 1.08rem;
  margin-bottom: 18px;
`;

const SectionTitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const SectionTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #222;
  margin-right: 8px;
`;

const GreenDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #00e676;
  border-radius: 50%;
  margin-left: 2px;
  position: relative;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.2);
  }
  &:hover::after {
    content: 'online';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: #00e676;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
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

const CardGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 200px); /* Adjust based on your layout */
`;

const UserCard = styled.div`
  background: rgba(255,255,255,0.65);
  border-radius: 22px;
  box-shadow: 0 4px 16px rgba(30,40,80,0.10);
  padding: 10px 10px 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  transition: box-shadow 0.2s;
  border: 1.2px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const CardPic = styled.img`
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const CardBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: transparent;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
`;

const CardStatus = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: #fff;
  color: #ff6600;
  font-size: 1.15rem;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255,102,0,0.10);
  margin-top: 40px;
`;

const CardName = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
  color: #222;
  margin-top: 10px;
`;

const CardMeta = styled.div`
  font-size: 0.97rem;
  color: #888;
  margin-bottom: 2px;
`;

const CardActivity = styled.div`
  font-size: 0.97rem;
  color: #00b894;
  font-weight: 600;
`;

const HomeIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M4 10v8a2 2 0 0 0 2 2h3m6 0h3a2 2 0 0 0 2-2v-8"/><path d="M9 22V12h6v10"/></svg>
);
const MapIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
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
  border: none;
  color: ${p => p.active ? '#ff6600' : '#888'};
  font-size: 1.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 22px;
  padding: 6px 18px 2px 18px;
  transition: background 0.18s, color 0.18s;
  font-weight: 700;
  &:active {
    background: rgba(255,102,0,0.18);
  }
`;

const NavLabel = styled.div`
  font-size: 0.92rem;
  margin-top: 2px;
  font-weight: 700;
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

export default function HomePage() {
  const [filter, setFilter] = useState('300m');
  const [hubOpen, setHubOpen] = useState(false);
  return (
    <>
      <GlobalStyle />
      <GlassContainer>
        <GlassMain>
          <PlainHeader>
            <HeaderLogo src={icon} alt="blip" />
            <HeaderRight>
              <BellIcon><ModernBell /></BellIcon>
              <HeaderProfilePic src="https://randomuser.me/api/portraits/men/32.jpg" alt="profile" />
            </HeaderRight>
          </PlainHeader>
          <GlassSection style={{marginTop: 18}}>
            <WelcomeTitle>Welcome, Luis Javier Peralta</WelcomeTitle>
            <WelcomeSub>Find new friends now, in real-time</WelcomeSub>
            <SectionTitleRow>
              <SectionTitle>Live Activity Feed</SectionTitle>
              <GreenDot />
            </SectionTitleRow>
          </GlassSection>
          <FilterRow>
            <FilterBtn active={filter==='300m'} onClick={()=>setFilter('300m')}>Within 300m</FilterBtn>
            <FilterBtn active={filter==='5km'} onClick={()=>setFilter('5km')}>Within 5km</FilterBtn>
          </FilterRow>
          <CardGrid>
            {users.map((u, i) => (
              <UserCard key={i}>
                <CardPic src={u.img} alt={u.name} />
                <CardBadge><img src={verifiedBadge} alt="verified" style={{width:28,height:28}} /></CardBadge>
                <CardStatus><RealisticActivityIcon activity={u.activity} /></CardStatus>
                <CardName>{u.name}, {u.age}</CardName>
                <CardMeta>{u.distance}</CardMeta>
                <CardActivity>Activity: {u.activity}</CardActivity>
              </UserCard>
            ))}
          </CardGrid>
          <NavMenuWrapper>
            <BottomNav>
              <NavBtn active><HomeIcon active /><NavLabel>Home</NavLabel></NavBtn>
              <NavBtn><MapIcon /><NavLabel>Map</NavLabel></NavBtn>
              <NavBtn><SearchIcon /><NavLabel>Search</NavLabel></NavBtn>
              <NavBtn><MessageIcon /><NavLabel>Messages</NavLabel></NavBtn>
            </BottomNav>
          </NavMenuWrapper>
        </GlassMain>
      </GlassContainer>
    </>
  );
} 