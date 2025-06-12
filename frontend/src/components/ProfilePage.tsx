import React from 'react';
import styled from 'styled-components';
import verifiedBadge from '../verified.png';
import icon from '../icon.png';
import { useNavigate, useLocation } from 'react-router-dom';

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
`;

const GreenDot = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  background: #00e676;
  border-radius: 50%;
  margin-left: 4px;
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
  width: 94%;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(30,40,80,0.10);
  margin: 18px 0 0 0;
  padding: 0 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border: 1.5px solid #e6eaf1;
`;

const ProfileImageWrapper = styled.div`
  width: 92%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -36px;
`;

const ProfileImage = styled.img`
  width: 100%;
  max-width: 260px;
  aspect-ratio: 0.85/1;
  object-fit: cover;
  border-radius: 22px;
  box-shadow: 0 2px 16px rgba(30,40,80,0.10);
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 7px;
  margin: 10px 0 0 0;
`;
const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e6eaf1;
  &.active { background: #222; }
`;

const IconStack = styled.div`
  position: absolute;
  top: 38px;
  right: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 2;
`;

const IconButton = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  box-shadow: 0 2px 8px rgba(30,40,80,0.08);
  margin-bottom: 0;
  cursor: pointer;
  color: #111;
  position: relative;
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
  padding: 18px 18px 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Location = styled.div`
  color: #1ecb83;
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 2px;
`;

const NameAge = styled.div`
  font-size: 1.18rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 2px;
`;

const Job = styled.div`
  color: #222;
  font-size: 1.08rem;
  margin-bottom: 2px;
`;

const Label = styled.span`
  color: #111;
  font-weight: 700;
`;

const Value = styled.span`
  color: #222;
  font-weight: 500;
`;

const Website = styled.a`
  color: #1e90ff;
  font-size: 1.05rem;
  text-decoration: underline;
  margin-top: 2px;
  font-weight: 700;
`;

const MyNetwork = styled.div`
  color: #1e90ff;
  font-size: 1.25rem;
  font-weight: 800;
  margin: 18px 0 0 0;
  cursor: pointer;
  text-align: center;
  width: 100%;
  padding: 10px 0 10px 0;
  border-top: 2px solid #e6eaf1;
`;

const CreateActivityBtn = styled.button`
  width: 98%;
  margin: 18px auto 0 auto;
  background: #111;
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  border: none;
  border-radius: 18px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(30,40,80,0.10);
  cursor: pointer;
  position: relative;
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
    verified: true,
  };

  return (
    <ProfileBg>
      <Header>
        <BackArrow onClick={() => navigate(-1)}>&larr;</BackArrow>
        <NameRow>
          <span style={{fontWeight:700, fontSize:'1.18rem'}}>Luis</span>
          <GreenDot />
        </NameRow>
      </Header>
      <Card>
        <ProfileImageWrapper>
          <ProfileImage src={user.photoURL} alt={user.name} />
          <Dots>
            <Dot className="active" />
            <Dot />
            <Dot />
          </Dots>
        </ProfileImageWrapper>
        <IconStack>
          <IconButton title="Add">+</IconButton>
          <IconButton title="Settings" style={{position:'relative'}}>
            <span role="img" aria-label="settings">⚙️</span>
            <GearBadge>16</GearBadge>
          </IconButton>
          <IconButton title="Bio">BIO</IconButton>
          <IconButton title="Grid">
            <span role="img" aria-label="grid">☰</span>
          </IconButton>
        </IconStack>
        <InfoSection>
          <Location>{user.location}</Location>
          <NameAge>
            <span style={{fontWeight:800}}>{user.name}</span>, {user.age}
            {user.verified && <img src={verifiedBadge} alt="verified" style={{width:22, height:22, marginLeft:6, verticalAlign:'middle'}} />}
          </NameAge>
          <Job>{user.job}</Job>
          <div><Label>Lifestyle</Label>: <Value>{user.lifestyle}</Value></div>
          <div><Label>Cool points</Label>: <Value>{user.coolPoints} <span style={{color:'#1ecb83'}}>✔️</span></Value></div>
          <div><Label>Looking for</Label>: <Value>{user.lookingFor}</Value></div>
          <Website href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">{user.website}</Website>
        </InfoSection>
        <MyNetwork>My network</MyNetwork>
      </Card>
      <CreateActivityBtn>
        <img src={icon} alt="blip" style={{width:32, height:32, borderRadius:8}} />
        Create new activity
        <GreenDotBtn />
      </CreateActivityBtn>
    </ProfileBg>
  );
};

export default ProfilePage; 