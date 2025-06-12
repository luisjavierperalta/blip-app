import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SettingsBg = styled.div`
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

const SettingsCard = styled.div`
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

const SectionTitle = styled.div`
  font-weight: 700;
  font-size: 1.18rem;
  color: #222;
  margin-bottom: 12px;
  margin-top: 18px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  max-width: 340px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1.5px solid #e6eaf1;
  font-size: 1.05rem;
  background: #f8fafc;
`;

const TextArea = styled.textarea`
  width: 100%;
  max-width: 340px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1.5px solid #e6eaf1;
  font-size: 1.05rem;
  background: #f8fafc;
  min-height: 60px;
`;

const GalleryPreview = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const GalleryMedia = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e6eaf1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GalleryImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GalleryVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 18px;
`;

const SaveBtn = styled.button<{disabled?: boolean}>`
  background: #1ecb83;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  padding: 10px 28px;
  font-size: 1.08rem;
  cursor: pointer;
  opacity: ${p => p.disabled ? 0.6 : 1};
`;

const CancelBtn = styled.button`
  background: #eee;
  color: #222;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  padding: 10px 28px;
  font-size: 1.08rem;
  cursor: pointer;
`;

const TagInput = styled.input`
  width: 100%;
  max-width: 340px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1.5px solid #e6eaf1;
  font-size: 1.05rem;
  background: #f8fafc;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.div`
  background: #e6f4ff;
  color: #007aff;
  font-size: 0.98rem;
  font-weight: 600;
  border-radius: 16px;
  padding: 6px 16px;
  border: 1.5px solid #b3e0ff;
  box-shadow: 0 1px 4px rgba(30,40,80,0.04);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RemoveTagBtn = styled.button`
  background: none;
  border: none;
  color: #007aff;
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 2px;
`;

const Message = styled.div`
  width: 100%;
  text-align: center;
  margin: 12px 0;
  font-size: 1.05rem;
  color: #1ecb83;
`;
const ErrorMsg = styled(Message)`
  color: #ff3b30;
`;
const LoadingMsg = styled(Message)`
  color: #888;
`;

const BackArrow = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #222;
  cursor: pointer;
  margin-right: 8px;
`;

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Profile state
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [coolPoints, setCoolPoints] = useState(0);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    if (!currentUser) {
      // Mock data for testing if not logged in
      setProfileImages(['/IMG_20250315_193341(1)(1).png']);
      setGallery([
        '/gallery_placeholder_1.jpg',
        '/gallery_placeholder_2.jpg',
        '/gallery_placeholder_3.jpg',
      ]);
      setLocation('Milan, Italy');
      setProfession('Oracle Certified Junior Software Engineer');
      setLifestyle('Stakhanovist');
      setLookingFor('Cinema night!');
      setCoolPoints(5467);
      setBio("Passionate about tech, hiking, and cinema. Always up for a new adventure or a deep conversation. Let's connect and make something awesome happen! 🚀");
      setInterests(['🎾 Tennis', '☕ Coffee', '🎬 Movies', '🏃‍♂️ Running', '🎨 Art']);
      setWebsite('luisjavierperalta.com');
      setTwitter('twitter.com/charlotteHuang');
      setInstagram('instagram.com/CharlotteHuang');
      setFacebook('facebook.com/CharlotteHuang');
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, 'users', currentUser.uid)).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileImages(data.profileImages || []);
        setGallery(data.gallery || []);
        setLocation(data.location || '');
        setProfession(data.profession || '');
        setLifestyle(data.lifestyle || '');
        setLookingFor(data.lookingFor || '');
        setCoolPoints(data.coolPoints || 0);
        setBio(data.bio || '');
        setInterests(data.interests || []);
        setWebsite(data.website || '');
        setTwitter(data.twitter || '');
        setInstagram(data.instagram || '');
        setFacebook(data.facebook || '');
      }
      setLoading(false);
    });
  }, [currentUser]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `users/${currentUser.uid}/profileImages/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileImages(prev => [...prev, url]);
    }
  };

  // Gallery upload handler (images/videos, max 10)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentUser) return;
    const files = Array.from(e.target.files).slice(0, 10 - gallery.length);
    const uploaded: string[] = [];
    for (const file of files) {
      const storageRef = ref(storage, `users/${currentUser.uid}/gallery/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploaded.push(url);
    }
    setGallery(prev => [...prev, ...uploaded].slice(0, 10));
  };

  // Remove image
  const handleRemoveImage = (idx: number) => {
    setProfileImages(profileImages.filter((_, i) => i !== idx));
  };

  // Remove gallery item
  const handleRemoveGallery = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  // Interests
  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && interestInput.trim()) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
      e.preventDefault();
    }
  };
  const handleRemoveInterest = (idx: number) => {
    setInterests(interests.filter((_, i) => i !== idx));
  };

  // Save handler
  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    // Validation
    if (!location || !profession || !bio) {
      setError('Location, Profession, and About me are required.');
      setSaving(false);
      return;
    }
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profileImages,
        gallery,
        location,
        profession,
        lifestyle,
        lookingFor,
        coolPoints,
        bio,
        interests,
        links
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (e) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingMsg>Loading profile...</LoadingMsg>;

  return (
    <>
      <BackArrow onClick={() => navigate(-1)}>&larr;</BackArrow>
      <SettingsBg>
        <SettingsCard>
          <SectionTitle>Profile Images</SectionTitle>
          <GalleryPreview>
            {profileImages.map((img, i) => (
              <div key={i} style={{position:'relative'}}>
                <GalleryImg src={img} alt={`Profile ${i+1}`} />
                <RemoveTagBtn style={{position:'absolute',top:2,right:2}} onClick={()=>handleRemoveImage(i)} title="Remove">×</RemoveTagBtn>
              </div>
            ))}
            <label style={{cursor:'pointer'}}>
              <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
              <span style={{fontSize: '2rem', color: '#1ecb83', marginLeft: 6}}>+</span>
            </label>
          </GalleryPreview>
          <SectionTitle>Gallery (Photos & Videos, max 10)</SectionTitle>
          <GalleryPreview>
            {gallery.map((media, i) => (
              <GalleryMedia key={i}>
                {media.match(/\.(mp4|webm|ogg)$/i)
                  ? <GalleryVideo src={media} controls />
                  : <GalleryImg src={media} alt={`Gallery ${i+1}`} />}
                <RemoveTagBtn style={{position:'absolute',top:2,right:2}} onClick={()=>handleRemoveGallery(i)} title="Remove">×</RemoveTagBtn>
              </GalleryMedia>
            ))}
            {gallery.length < 10 && (
              <label style={{cursor:'pointer',width:90,height:90,display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px dashed #b3e0ff',borderRadius:12,background:'#f8fafc'}}>
                <input type="file" accept="image/*,video/*" style={{display:'none'}} multiple onChange={handleGalleryUpload} />
                <span style={{fontSize: '2rem', color: '#1ecb83'}}>+</span>
              </label>
            )}
          </GalleryPreview>
          <SectionTitle>Intro / Location</SectionTitle>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" required />
          <SectionTitle>Profession</SectionTitle>
          <Input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Profession" required />
          <SectionTitle>Lifestyle</SectionTitle>
          <Input value={lifestyle} onChange={e => setLifestyle(e.target.value)} placeholder="Lifestyle" />
          <SectionTitle>Looking for</SectionTitle>
          <Input value={lookingFor} onChange={e => setLookingFor(e.target.value)} placeholder="Looking for" />
          <SectionTitle>Cool Points</SectionTitle>
          <Input type="number" value={coolPoints} onChange={e => setCoolPoints(Number(e.target.value))} placeholder="Cool Points" />
          <SectionTitle>About me</SectionTitle>
          <TextArea value={bio} onChange={e => setBio(e.target.value)} maxLength={160} placeholder="About me (max 160 chars)" required />
          <SectionTitle>Interests</SectionTitle>
          <TagInput
            type="text"
            value={interestInput}
            onChange={e => setInterestInput(e.target.value)}
            onKeyDown={handleAddInterest}
            placeholder="Add interest or emoji and press Enter (e.g. 🎾 Tennis)"
          />
          <TagList>
            {interests.map((tag, idx) => (
              <Tag key={idx}>
                {tag}
                <RemoveTagBtn onClick={() => handleRemoveInterest(idx)} title="Remove">×</RemoveTagBtn>
              </Tag>
            ))}
          </TagList>
          <SectionTitle>Links</SectionTitle>
          <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Personal website URL" />
          <Input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="Twitter URL" />
          <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" />
          <Input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          {!currentUser && <ErrorMsg>Test mode: Saving is disabled when not logged in.</ErrorMsg>}
          {success && <Message>Profile saved!</Message>}
          <ButtonRow>
            <SaveBtn onClick={handleSave} disabled={saving || !currentUser}>{saving ? 'Saving...' : 'Save'}</SaveBtn>
            <CancelBtn onClick={() => navigate(-1)}>Cancel</CancelBtn>
          </ButtonRow>
        </SettingsCard>
      </SettingsBg>
    </>
  );
} 