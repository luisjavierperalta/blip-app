import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import icon from '../icon.png';
import verifiedBadge from '../verified.png';

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

const GlassHeader = styled.div`
  width: 96%;
  max-width: 430px;
  margin: 32px auto 0 auto;
  padding: 0 28px;
  height: 80px;
  background: rgba(30, 32, 40, 0.55);
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(30,40,80,0.13);
  border: 1.5px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 20;
`;

const HeaderLogo = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-left: 0;
  @media (max-width: 430px) {
    width: 48px;
    height: 48px;
  }
`;

const HeaderProfilePic = styled.img`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  margin-right: 0;
  @media (max-width: 430px) {
    width: 54px;
    height: 54px;
  }
`;

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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
`;

const CardStatus = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
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

const HubSection = styled(GlassSection)`
  width: 96%;
  margin: 10px auto 100px auto;
  background: rgba(255,255,255,0.38);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 2px 8px rgba(30,40,80,0.08);
  border: 1.2px solid rgba(255,255,255,0.22);
  padding: 20px 0 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.18rem;
  font-weight: 700;
  color: #222;
  position: relative;
`;

const UpArrow = styled.span`
  color: #00b894;
  font-size: 1.3rem;
  margin-left: 8px;
`;

const BottomNav = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
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
  z-index: 100;
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
const HomeIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6600' : '#888'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M4 10v8a2 2 0 0 0 2 2h3m6 0h3a2 2 0 0 0 2-2v-8"/><path d="M9 22V12h6v10"/></svg>
);
const MapIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6600' : '#888'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
);
const SearchIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6600' : '#888'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const MessageIcon = ({active}: {active?: boolean}) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6600' : '#888'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export default function HomePage() {
  const [filter, setFilter] = React.useState('300m');
  return (
    <>
      <GlobalStyle />
      <GlassContainer>
        <GlassMain>
          <GlassHeader>
            <HeaderLogo src={icon} alt="blip" />
            <HeaderProfilePic src="https://randomuser.me/api/portraits/men/32.jpg" alt="profile" />
          </GlassHeader>
          <GlassSection style={{marginTop: 18}}>
            <WelcomeTitle>Welcome, Luis Javier Peralta</WelcomeTitle>
            <WelcomeSub>Find new friends now, in real-time</WelcomeSub>
            <SectionTitleRow>
              <SectionTitle>Live Activity Feed</SectionTitle>
              <GreenDot />
            </SectionTitleRow>
            <FilterRow>
              <FilterBtn active={filter==='300m'} onClick={()=>setFilter('300m')}>Within 300m</FilterBtn>
              <FilterBtn active={filter==='5km'} onClick={()=>setFilter('5km')}>Within 5km</FilterBtn>
            </FilterRow>
            <CardGrid>
              {users.map((u, i) => (
                <UserCard key={i}>
                  <CardPic src={u.img} alt={u.name} />
                  <CardBadge><img src={verifiedBadge} alt="verified" style={{width:22,height:22}} /></CardBadge>
                  <CardStatus>{u.status==='video' ? '🎥' : '📞'}</CardStatus>
                  <CardName>{u.name}, {u.age}</CardName>
                  <CardMeta>{u.distance}</CardMeta>
                  <CardActivity>Activity: {u.activity}</CardActivity>
                </UserCard>
              ))}
            </CardGrid>
          </GlassSection>
          <HubSection>
            My Central Hub <UpArrow>▲</UpArrow>
          </HubSection>
          <BottomNav>
            <NavBtn active><HomeIcon active /><NavLabel>Home</NavLabel></NavBtn>
            <NavBtn><MapIcon /><NavLabel>Map</NavLabel></NavBtn>
            <NavBtn><SearchIcon /><NavLabel>Search</NavLabel></NavBtn>
            <NavBtn><MessageIcon /><NavLabel>Messages</NavLabel></NavBtn>
          </BottomNav>
        </GlassMain>
      </GlassContainer>
    </>
  );
} 