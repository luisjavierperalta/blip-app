import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import verifiedBadge from '../verified.png';
import photoIcon from '../photo.png';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const interestOptions = [
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'art', label: 'Art' },
  { value: 'tech', label: 'Tech' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
];

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
  padding: 20px 0;
  margin: 0 auto;
  box-sizing: border-box;
`;

const TopSpace = styled.div`
  height: 20px;
`;

const UploadCircle = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #ff6600;
  border-radius: 50%;
  width: 140px;
  height: 140px;
  margin: 0 auto 8px auto;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const UploadIcon = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const UploadText = styled.div`
  color: #ff6600;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
  padding: 0 8px;
  box-sizing: border-box;
`;

const Label = styled.label`
  color: #222;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 2px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #bbb;
  background: #fafafa;
  color: #222;
  font-size: 1rem;
  margin-bottom: 0;
  font-family: 'Interstate', sans-serif;
  font-weight: 300;
  box-sizing: border-box;
  text-align: center;

  &::placeholder {
    color: #bbb;
    text-align: center;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: none;
  background: #ff6600;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;
  font-family: 'Interstate', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: #e65c00;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SelectWrapper = styled.div`
  width: 100%;
  .react-select__control {
    min-height: 38px;
    border-radius: 4px;
    border: 1px solid #bbb;
    background: #fafafa;
    font-family: 'Interstate', sans-serif;
    font-weight: 300;
    box-sizing: border-box;
  }
  .react-select__value-container {
    padding: 2px 8px;
  }
  .react-select__input {
    font-size: 1rem;
    font-family: 'Interstate', sans-serif;
    font-weight: 300;
  }
  .react-select__placeholder {
    font-family: 'Interstate', sans-serif;
    font-weight: 300;
    text-align: center;
  }
`;

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-size: 1.3rem;
  color: #34c759;
  font-weight: 700;
  text-align: center;
`;

export default function ProfileSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState(false);
  const [legalName, setLegalName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState<any>(null);
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const countryOptions = countryList().getData();

  useEffect(() => {
    const checkUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.verified) {
            setIsVerified(true);
            // If user is already verified, redirect to home
            navigate('/home');
          }
        }
      } catch (err) {
        console.error('Error checking user profile:', err);
      }
    };

    checkUserProfile();
  }, [navigate]);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageSizeError'));
        return;
      }
      setProfilePicFile(file);
      setPhotoUploadLoading(true);
      setPhotoUploadSuccess(false);
      setError('');
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target?.result as string);
      reader.readAsDataURL(file);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error(t('notAuthenticated'));
        const storageRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfilePicUrl(url);
        setPhotoUploadSuccess(true);
      } catch (err: any) {
        setError(err.message || t('photoUploadError'));
        setPhotoUploadSuccess(false);
      } finally {
        setPhotoUploadLoading(false);
      }
    }
  };

  const handleCountryChange = (selected: any) => {
    setCountry(selected);
    setCity('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleInterestsChange = (selected: any) => {
    if (selected.length <= 3) setInterests(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error(t('notAuthenticated'));

      // Validate required fields
      if (!legalName || !age || !country || !city || !profession || interests.length === 0) {
        throw new Error(t('fillAllFields'));
      }

      if (!profilePicUrl) {
        throw new Error(t('uploadProfilePicture'));
      }

      const userData = {
        legalName,
        age: parseInt(age),
        country: country.label,
        city,
        profession,
        interests: interests.map((i: any) => i.label),
        profilePic: profilePicUrl,
        verified: true,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setSuccess(true);
      setIsVerified(true);
      
      // Redirect to home after successful profile setup
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('profileSaveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <TopSpace />
      <LanguageSelector style={{ alignSelf: 'flex-end', marginRight: 24, marginBottom: 8 }} />
      {/* Success overlay after account creation */}
      {success && (
        <SuccessOverlay>
          <div>🎉 {t('profileSaved')}</div>
          <div style={{ color: '#222', fontWeight: 400, fontSize: '1rem', marginTop: 8 }}>{t('redirectingHome')}</div>
        </SuccessOverlay>
      )}
      <UploadCircle htmlFor="profile-pic">
        {profilePic ? (
          <ProfileImage src={profilePic} alt="Profile" />
        ) : (
          <UploadIcon src={photoIcon} alt={t('uploadProfilePicture')} />
        )}
        <input
          id="profile-pic"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
        />
        {isVerified && <img src={verifiedBadge} alt={t('verified')} style={{ position: 'absolute', bottom: -5, right: -5, width: 24, height: 24 }} />}
      </UploadCircle>
      {photoUploadLoading && <div style={{ color: '#ff6600', fontWeight: 500, marginBottom: 8 }}>{t('uploadingPhoto')}</div>}
      {photoUploadSuccess && <div style={{ color: '#34c759', fontWeight: 500, marginBottom: 8 }}>{t('photoUploaded')}</div>}
      <UploadText>{t('uploadProfilePicture')}</UploadText>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="legalName">{t('legalName')}</Label>
        <Input
          id="legalName"
          type="text"
          placeholder={t('enterLegalName')}
          value={legalName}
          onChange={e => setLegalName(e.target.value)}
          required
        />
        <Label htmlFor="age">{t('age')}</Label>
        <Input
          id="age"
          type="number"
          placeholder={t('enterAge')}
          value={age}
          onChange={e => setAge(e.target.value)}
          min={1}
          max={120}
          required
        />
        <Label>{t('location')}</Label>
        <SelectWrapper>
          <Select
            classNamePrefix="react-select"
            placeholder={t('selectCountry')}
            options={countryOptions}
            value={country}
            onChange={handleCountryChange}
          />
        </SelectWrapper>
        <Input
          type="text"
          placeholder={t('enterCity')}
          value={city}
          onChange={handleCityChange}
          disabled={!country}
          required
        />
        <Label htmlFor="profession">{t('profession')}</Label>
        <Input
          id="profession"
          type="text"
          placeholder={t('enterProfession')}
          value={profession}
          onChange={e => setProfession(e.target.value)}
          required
        />
        <Label>{t('interests')}</Label>
        <SelectWrapper>
          <Select
            classNamePrefix="react-select"
            placeholder={t('selectInterests')}
            options={interestOptions}
            value={interests}
            onChange={handleInterestsChange}
            isMulti
            closeMenuOnSelect={false}
            isOptionDisabled={() => interests.length >= 3}
          />
        </SelectWrapper>
        <Button type="submit" disabled={loading}>{loading ? t('savingProfile') : t('getStarted')}</Button>
        {error && <div style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
      </Form>
    </Container>
  );
} 