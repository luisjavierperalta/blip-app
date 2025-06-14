import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import verifiedBadge from '../verified.png';
import icon from '../icon.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { subscribeToUserStatus } from '../services/presence';
import WalletModal from './WalletModal';

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
  font-size: 2.5rem;
  font-weight: 950;
  color: #222;
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
  &.active { background: #222; }
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

const NetworkIcon = styled.span`
  font-size: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const CreateActivityBtn = styled.button`
  width: 98%;
  margin: 24px auto 0 auto;
  background: linear-gradient(90deg, #007aff 0%, #1ecb83 100%);
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
    background: linear-gradient(90deg, #1ecb83 0%, #007aff 100%);
    box-shadow: 0 4px 24px rgba(30,40,80,0.13);
  }
`;
const GreenDotBtn = styled.span`
  width: 16px;
  height: 16px;
  background: #1ecb83;
  border-radius: 50%;
  display: inline-block;
  margin-left: -8px;
  border: 2px solid #fff;
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
  text-decoration: underline;
  transition: color 0.18s;
  &:hover {
    color: #007aff;
  }
`;

const LinkIcon = styled.span`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LinkUrl = styled.span`
  font-weight: 300;
  font-family: 'Interstate', Arial, sans-serif;
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
  gap: 10px;
  margin: 12px 0 0 0;
  font-size: 1.22rem;
  font-weight: 700;
  color: #007aff;
`;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Mock user data
  const user = {
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
    ], // up to 3 profile pictures
    verified: true,
    gallery: [
      '/gallery_placeholder_1.jpg',
      '/gallery_placeholder_2.jpg',
      '/gallery_placeholder_3.jpg',
    ], // TODO: Replace with real data from Firestore
  };

  const [showMyActivities, setShowMyActivities] = useState(true);
  const [showJoinedActivities, setShowJoinedActivities] = useState(true);
  const [openGalleryIdx, setOpenGalleryIdx] = useState<number|null>(null);
  const [editActivities, setEditActivities] = useState(false);
  // Mock user id for demo; replace with real user id from context
  const userId = 'demoUserId';
  // Mock activities; in real app, fetch from backend
  const [myActivities, setMyActivities] = useState([
    { id: '1', title: '🎾 Tennis Match @ Central Park', date: '2024-06-10, 18:00' },
    { id: '2', title: '☕ Coffee Meetup @ Blue Bottle', date: '2024-06-09, 10:30' },
    { id: '3', title: '🎬 Movie Night: Inception', date: '2024-06-08, 21:00' },
  ]);
  const [isOnline, setIsOnline] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const profilePictures = (user.profilePictures && user.profilePictures.length > 0 ? user.profilePictures : [user.photoURL]).slice(0, 3);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      const unsubscribe = subscribeToUserStatus(userId, (status) => {
        setIsOnline(status);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleRemoveActivity = async (activityId: string) => {
    setMyActivities(myActivities.filter(a => a.id !== activityId));
    // Backend: remove from Firestore (replace 'activities' with your collection)
    try {
      await updateDoc(doc(db, 'users', userId), {
        myActivities: arrayRemove(activityId)
      });
    } catch (e) {
      // Optionally show error
    }
  };

  // Handler for navigating to profile settings
  const handleSettingsClick = () => {
    navigate('/profile/settings');
  };

  const gallery = user.gallery && user.gallery.length > 0
    ? user.gallery
    : [...Array(10)].map((_, i) => `/gallery_placeholder_${(i%3)+1}.jpg`);

  // Handle scroll to update dot
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.offsetWidth;
    const idx = Math.round(scrollLeft / width);
    setCarouselIdx(idx);
  };

  // In the ProfilePage component, after the first LinkRow in LinksSection
  const isMan = /luis|john|mike|ryan|lucas|elija/i.test(user.name);
  const coolIcon = isMan ? '/coolboy.png' : '/coolgirl.png';

  return (
    <ProfileBg>
      <Header>
        <BackArrow onClick={() => navigate(-1)}>&larr;</BackArrow>
        <NameRow>
          <span style={{fontWeight:700, fontSize:'1.18rem'}}>{user.name}</span>
          <GreenDot isOnline={isOnline} />
        </NameRow>
      </Header>
      <Card>
        <ProfileImageCarousel ref={carouselRef} onScroll={handleCarouselScroll}>
          {profilePictures.map((img, idx) => (
            <CarouselImage key={idx} src={img} alt={user.name + ' profile ' + (idx+1)} />
          ))}
        </ProfileImageCarousel>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
          {profilePictures.map((_, idx) => (
            <div key={idx} style={{ width: 12, height: 12, borderRadius: '50%', background: carouselIdx === idx ? '#222' : '#e6eaf1', transition: 'background 0.2s' }} />
          ))}
        </div>
        <IconStack>
          <AppleIconButton title="Settings" style={{position:'relative'}} onClick={handleSettingsClick}>
            <span role="img" aria-label="settings">⚙️</span>
            <GearBadge>16</GearBadge>
          </AppleIconButton>
          <AppleIconButton title="Wallet" onClick={() => setWalletOpen(true)}>
            <img src="/digital-wallet.png" alt="wallet" style={{width:32, height:32}} />
          </AppleIconButton>
        </IconStack>
        <WalletModal
          open={walletOpen}
          onClose={() => setWalletOpen(false)}
          userId={userId}
          coolPointsBalance={user.coolPoints}
          onSend={() => alert('Send Cool Points (coming soon!)')}
          onBuy={() => alert('Buy Cool Points (coming soon!)')}
        />
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
            <img src={coolIcon} alt="cool" style={{width:32,height:32,verticalAlign:'middle'}} />
            {user.coolPoints.toLocaleString()} Cool Points
          </CoolPointsRow>
          <Website href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website}</Website>
        </InfoSection>
        <MyNetworkBtn onClick={() => navigate('/my-network')}>
          <NetworkIcon>🌐</NetworkIcon>
          My network
        </MyNetworkBtn>
        <CreateActivityBtn>
          <img src={icon} alt="blip" style={{width:32, height:32, borderRadius:8}} />
          Create new activity
        </CreateActivityBtn>
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
        <SectionCard>
          <SectionHeader>
            <SectionTitle>Joined Activities</SectionTitle>
            <ChevronBtn
              aria-label={showJoinedActivities ? 'Collapse' : 'Expand'}
              onClick={() => setShowJoinedActivities(v => !v)}
              style={{ transform: showJoinedActivities ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            >
              ▼
            </ChevronBtn>
          </SectionHeader>
          {showJoinedActivities && (
            <ActivityList>
              <ActivityItem>
                🏃‍♂️ 5K Run with Milan Runners
                <ActivityDate>2024-06-07, 07:00</ActivityDate>
                <ActivityOwner>by @milan_runner</ActivityOwner>
              </ActivityItem>
              <ActivityItem>
                🍕 Pizza Night @ Luigi's
                <ActivityDate>2024-06-06, 20:00</ActivityDate>
                <ActivityOwner>by @luigi</ActivityOwner>
              </ActivityItem>
              <ActivityItem>
                🎨 Art Jam Session
                <ActivityDate>2024-06-05, 16:00</ActivityDate>
                <ActivityOwner>by @artlover</ActivityOwner>
              </ActivityItem>
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
            <InterestTag>Hiking</InterestTag>
            <InterestTag>Mountains</InterestTag>
            <InterestTag>Running</InterestTag>
            <InterestTag>Fashion Design</InterestTag>
            <InterestTag>Photography</InterestTag>
            <InterestTag>Travel</InterestTag>
            <InterestTag>Tech</InterestTag>
          </InterestsList>
        </InterestsSection>
        <LinksSection>
          <LinksTitle>Links</LinksTitle>
          <LinkList>
            <LinkRow href="https://luisjavierperalta.com" target="_blank" rel="noopener noreferrer">
              <LinkIcon>🌐</LinkIcon>
              <LinkUrl>luisjavierperalta.com</LinkUrl>
            </LinkRow>
            <LinkRow href="https://twitter.com/charlotteHuang" target="_blank" rel="noopener noreferrer">
              <LinkIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1da1f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.5 0c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.95 3.65A4.48 4.48 0 0 1 .96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.72 2.16 2.97 4.07 3A9.05 9.05 0 0 1 0 19.54 12.8 12.8 0 0 0 6.92 22c8.28 0 12.81-6.86 12.81-12.81 0-.2 0-.39-.01-.58A9.22 9.22 0 0 0 24 4.59a9.1 9.1 0 0 1-2.6.71A4.48 4.48 0 0 0 23 3z"/></svg>
              </LinkIcon>
              <LinkUrl>twitter.com/charlotteHuang</LinkUrl>
            </LinkRow>
            <LinkRow href="https://instagram.com/CharlotteHuang" target="_blank" rel="noopener noreferrer">
              <LinkIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
              </LinkIcon>
              <LinkUrl>instagram.com/CharlotteHuang</LinkUrl>
            </LinkRow>
            <LinkRow href="https://facebook.com/CharlotteHuang" target="_blank" rel="noopener noreferrer">
              <LinkIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </LinkIcon>
              <LinkUrl>facebook.com/CharlotteHuang</LinkUrl>
            </LinkRow>
          </LinkList>
        </LinksSection>
      </Card>
    </ProfileBg>
  );
};

export default ProfilePage; 