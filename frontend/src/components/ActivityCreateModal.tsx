import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: #111;
  color: #fff;
  border-radius: 32px;
  width: 95vw;
  max-width: 400px;
  padding: 32px 18px 24px 18px;
  box-shadow: 0 8px 32px 0 rgba(30,40,80,0.18);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`;

const Logo = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 10px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
`;

const Steps = styled.div`
  font-size: 1.1rem;
  margin-bottom: 18px;
  font-weight: 600;
`;

const FieldLabel = styled.label`
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
`;

const TextInput = styled.input`
  width: 100%;
  border-radius: 10px;
  border: none;
  padding: 10px;
  font-size: 1.1rem;
  margin-bottom: 12px;
`;

const Select = styled.select`
  width: 100%;
  border-radius: 10px;
  border: none;
  padding: 10px;
  font-size: 1.1rem;
  margin-bottom: 12px;
`;

const CountrySelect = styled.select`
  width: 100%;
  border-radius: 10px;
  border: none;
  padding: 10px;
  font-size: 1.1rem;
  margin-bottom: 12px;
`;

const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #222;
  border-radius: 18px;
  padding: 32px 0 18px 0;
  margin: 0 auto 18px auto;
  width: 90%;
  cursor: pointer;
  border: 2px dashed #1ecb83;
  position: relative;
  min-height: 140px;
`;

const UploadOverlayIcon = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  opacity: 0.25;
  pointer-events: none;
`;

const UploadText = styled.div`
  color: #ff9500;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 8px;
`;

const PreviewRow = styled.div`
  display: flex;
  gap: 8px;
  margin: 10px 0 18px 0;
`;

const PreviewImg = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #1ecb83;
`;

const DescInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  border-radius: 12px;
  border: none;
  padding: 12px;
  font-size: 1.1rem;
  margin-bottom: 18px;
  resize: vertical;
  font-weight: 300;
`;

const PreviewOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewModal = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Carousel = styled.div`
  width: 100vw;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const CarouselImg = styled.img`
  max-width: 90vw;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 24px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.18);
  background: #fff;
`;

const CarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 18px 0 0 0;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? '#1ecb83' : '#fff'};
  border: 2px solid #1ecb83;
  cursor: pointer;
`;

const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 2rem;
  cursor: pointer;
  z-index: 2;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0 32px 0;
`;

const PublishBtn = styled.button`
  background: linear-gradient(90deg, #1ecb83 0%, #007aff 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  border: none;
  border-radius: 16px;
  padding: 16px 48px;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #007aff 0%, #1ecb83 100%);
  }
`;

const BackBtn = styled.button`
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 2rem;
  cursor: pointer;
  z-index: 3;
`;

const GpsBtn = styled.button`
  margin-left: 8px;
  padding: 4px 10px;
  font-size: 0.95rem;
  background: #1ecb83;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.18s;
  &:hover {
    background: #007aff;
  }
`;

const GpsDesc = styled.div`
  font-size: 0.95rem;
  color: #b3e0ff;
  margin-bottom: 8px;
  margin-top: -6px;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
`;

const PreviewImgWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const activityTypes = [
  'Running',
  'Watching Film',
  'Studying',
  'Drinking',
  'Partying',
  'Dining',
  'Gaming',
  'Working Out',
  'Reading',
  'Shopping',
  'Exploring',
  'Networking',
  'Dancing',
  'Cooking',
  'Chilling'
];

const countryOptions = [
  'United States',
  'Italy',
  'United Kingdom',
  'France',
  'Germany',
  'Spain',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'Brazil',
  'India',
  'Mexico',
  'Netherlands',
  'Other',
];

const activityTypeIcons: Record<string, string> = {
  'Running': '🏃‍♂️',
  'Watching Film': '🎬',
  'Studying': '📚',
  'Drinking': '🍻',
  'Partying': '🎉',
  'Dining': '🍽️',
  'Gaming': '🎮',
  'Working Out': '🏋️',
  'Reading': '📖',
  'Shopping': '🛍️',
  'Exploring': '🧭',
  'Networking': '🤝',
  'Dancing': '💃',
  'Cooking': '👩‍🍳',
  'Chilling': '🧘',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onPublish: (activity: {
    name: string;
    type: string;
    location: string;
    desc: string;
    files: File[];
  }) => void;
}

const ActivityCreateModal: React.FC<Props> = ({ open, onClose, onPublish }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const { currentUser } = useAuth();
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [lat, setLat] = useState<number|null>(null);
  const [lng, setLng] = useState<number|null>(null);

  const getGpsLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const latVal = pos.coords.latitude;
        const lngVal = pos.coords.longitude;
        setLat(latVal);
        setLng(lngVal);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latVal}&lon=${lngVal}&format=json`);
          const data = await res.json();
          setCountry(data.address.country || '');
          setCity(data.address.city || data.address.town || data.address.village || data.address.state || data.address.county || '');
        } catch {
          setCountry('');
          setCity('');
        }
        setLoadingLoc(false);
      }, () => setLoadingLoc(false), { enableHighAccuracy: false });
    } else {
      setLoadingLoc(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setLat(null);
    setLng(null);
    getGpsLocation();
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files).slice(0, 3);
    setFiles(arr);
  };

  const handlePreview = () => {
    if (!name || !type || !country || !city || files.length === 0) {
      alert('Please fill all required fields and upload at least one photo.');
      return;
    }
    setShowPreview(true);
    setPreviewIdx(0);
  };

  const handlePublish = async () => {
    if (!currentUser) {
      alert('You must be logged in to publish an activity.');
      return;
    }
    setLoadingPublish(true);
    try {
      // 1. Upload images to Firebase Storage
      const photoUrls: string[] = [];
      for (const file of files) {
        const storageRef = ref(storage, `activities/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        photoUrls.push(url);
      }
      // 2. Save activity to Firestore
      const activityData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        name,
        type,
        icon: activityTypeIcons[type] || '',
        country,
        city,
        location: `${city}, ${country}`,
        desc,
        photos: photoUrls,
        lat,
        lng,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
        isActive: true,
        openToJoin: true
      };
      await addDoc(collection(db, 'activities'), activityData);
      setName('');
      setType('');
      setCountry('');
      setCity('');
      setLat(null);
      setLng(null);
      setDesc('');
      setFiles([]);
      setShowPreview(false);
      setLoadingPublish(false);
      onClose();
      onPublish(activityData);
    } catch (err) {
      setLoadingPublish(false);
      alert('Failed to publish activity. Please try again.');
    }
  };

  return (
    <>
      <Overlay>
        <Modal>
          <CloseBtn onClick={onClose}>×</CloseBtn>
          <LogoRow>
            <Logo src="/iconAct.png" alt="blip logo" />
            <Title>Create Activity</Title>
          </LogoRow>
          <Steps>
            Create a new activity in 3 steps<br/>
            1 Photo/s uploading<br/>
            2 Activity information<br/>
            3 Preview & Publish!
          </Steps>
          <FieldLabel htmlFor="activity-name">Activity Name*</FieldLabel>
          <TextInput
            id="activity-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Jogging in Central Park"
            maxLength={40}
          />
          <FieldLabel htmlFor="activity-type">Activity Type*</FieldLabel>
          <Select
            id="activity-type"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="" disabled>Select type</option>
            {activityTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </Select>
          <FieldLabel htmlFor="activity-country">Country*</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <CountrySelect
              id="activity-country"
              value={loadingLoc ? 'Detecting location...' : country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="" disabled>Select country</option>
              {countryOptions.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </CountrySelect>
            <GpsBtn type="button" onClick={getGpsLocation} disabled={loadingLoc}>
              {loadingLoc ? 'Locating...' : 'Real-Time GPS (75% accurate)'}
            </GpsBtn>
          </div>
          <GpsDesc>
            For privacy, only your city/zone is used. Location is approximate and not precise.<br/>
            The app considers users 'nearby' if within 300m.
          </GpsDesc>
          <FieldLabel htmlFor="activity-city">City*</FieldLabel>
          <TextInput
            id="activity-city"
            value={loadingLoc ? 'Detecting location...' : city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter city or zone"
            maxLength={40}
          />
          <UploadBox>
            <UploadOverlayIcon src="/activity-upload.png" alt="upload" />
            <span style={{ fontSize: '2.2rem', marginBottom: 4, zIndex: 2 }}>🍏</span>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
              data-testid="activity-upload-input"
            />
            <UploadText>Photo uploading<br/>Max. 3</UploadText>
          </UploadBox>
          {files.length > 0 && (
            <PreviewRow>
              {files.map((file, idx) => (
                <PreviewImgWrapper key={idx}>
                  <PreviewImg src={URL.createObjectURL(file)} alt={`preview ${idx+1}`} />
                  <RemoveBtn type="button" title="Remove photo" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>×</RemoveBtn>
                </PreviewImgWrapper>
              ))}
            </PreviewRow>
          )}
          <FieldLabel htmlFor="activity-desc">Description</FieldLabel>
          <DescInput
            id="activity-desc"
            placeholder="Describe your activity..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={200}
          />
          <PublishBtn as="button" type="button" onClick={handlePreview}>Preview</PublishBtn>
        </Modal>
      </Overlay>
      {showPreview && (
        <PreviewOverlay>
          <PreviewModal>
            <BackBtn onClick={() => setShowPreview(false)} title="Back">←</BackBtn>
            <ArrowBtn style={{ left: 10 }} onClick={() => setPreviewIdx(i => (i > 0 ? i - 1 : files.length - 1))}>&lt;</ArrowBtn>
            <Carousel>
              {files.length > 0 && (
                <CarouselImg src={URL.createObjectURL(files[previewIdx])} alt={`preview ${previewIdx+1}`} />
              )}
            </Carousel>
            <ArrowBtn style={{ right: 10 }} onClick={() => setPreviewIdx(i => (i < files.length - 1 ? i + 1 : 0))}>&gt;</ArrowBtn>
            <CarouselDots>
              {files.map((_, idx) => (
                <Dot key={idx} $active={idx === previewIdx} onClick={() => setPreviewIdx(idx)} />
              ))}
            </CarouselDots>
            <Footer>
              <PublishBtn onClick={handlePublish} disabled={loadingPublish}>
                {loadingPublish ? 'Publishing...' : 'Publish'}
              </PublishBtn>
            </Footer>
          </PreviewModal>
        </PreviewOverlay>
      )}
    </>
  );
};

export default ActivityCreateModal; 