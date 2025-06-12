import styled, { createGlobalStyle } from 'styled-components';
import React, { useState } from 'react';
import logo from './logo.png';
import background from './background.png';
import { signUp, signIn, sendOtpToPhone, verifyOtp } from './services/auth';
import PhoneVerification from './components/PhoneVerification';
import NavigationArrows from './components/NavigationArrows';
import './i18n';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';
import { useNavigate } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/InterstateBoldCondensed.otf') format('opentype');
    font-weight: bold;
  }

  @font-face {
    font-family: 'Interstate';
    src: url('/fonts/InterstateLightCondensed.otf') format('opentype');
    font-weight: 300;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Interstate', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: #000;
    color: #fff;
    min-height: 100vh;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* For mobile browsers */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: url(${background}) no-repeat center center;
  background-size: cover;
  position: relative;
  padding: 40px 20px;
  padding-top: 15vh;

  @media (max-width: 428px) {
    padding: 32px 16px;
    padding-top: 12vh;
    background-position: center;
    background-attachment: fixed;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: -8vh;

  @media (max-width: 428px) {
    gap: 14px;
    margin-top: -6vh;
  }
`;

const Logo = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 4px;

  @media (max-width: 428px) {
    width: 150px;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: 0.5px;
  margin: 0;

  @media (max-width: 428px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.p`
  color: #FFD700;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 700;
  margin: 0;

  @media (max-width: 428px) {
    font-size: 1.3rem;
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
  max-width: 320px;

  @media (max-width: 428px) {
    font-size: 1.1rem;
  }
`;

const Tagline = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
  max-width: 320px;

  @media (max-width: 428px) {
    font-size: 1.1rem;
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.1rem;
  background: transparent;
  color: #fff;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  }

  @media (max-width: 428px) {
    padding: 12px 0;
    font-size: 1rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin: 8px 0;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 0;
  background: #fff;
  color: #000;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 428px) {
    padding: 12px 0;
    font-size: 1rem;
  }
`;

const Footer = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-align: center;
  font-weight: 300;
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0 20px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);

  @media (max-width: 428px) {
    font-size: 1rem;
    bottom: 20px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const LanguageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #f8f8f8;
  color: #222;
  font-size: 1rem;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: border 0.2s;
  cursor: pointer;
`;

const GlobalIcon = styled.span`
  font-size: 1.2rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LanguageSelect = styled.select`
  border: none;
  background: transparent;
  color: #222;
  font-size: 1rem;
  font-family: inherit;
  appearance: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const LanguageOption = styled.option`
  color: #222;
  background: #fff;
`;

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [legalFullName, setLegalFullName] = useState('');
  let navigate: (path: string) => void = () => {};
  try {
    navigate = useNavigate();
  } catch {
    navigate = (path: string) => { window.location.href = path; };
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !username || !legalFullName) {
        throw new Error('Please fill in all required fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create user account
      await signUp(email, password, username, legalFullName);
      
      // Show verification page
      setShowVerification(true);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Handle successful sign in (e.g., redirect to dashboard)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    // Handle successful verification (e.g., redirect to dashboard)
    console.log('Verification completed');
  };

  const handleBackToSignUp = () => {
    setShowVerification(false);
  };

  const handleNext = () => {
    setShowVerification(true);
  };

  const handlePrev = () => {
    setShowVerification(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  if (showVerification) {
    return (
      <>
        <PhoneVerification 
          phoneNumber={phoneNumber}
          onVerificationComplete={handleVerificationComplete}
          onBack={handleBackToSignUp}
        />
        <NavigationArrows 
          onPrev={handlePrev}
          onNext={() => {}}
          showNext={false}
        />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        <Content>
          <Logo src={logo} alt="Blip Logo" />
          <TextContainer>
            <Title>{t('welcome')}</Title>
            <Subtitle>{t('cityPlayground')}</Subtitle>
            <Description>{t('meetPeople')}</Description>
            <Tagline>{t('noPlans')}</Tagline>
          </TextContainer>
          <Form onSubmit={handleSignUp}>
            <Input
              type="text"
              placeholder="Full Legal Name"
              value={legalFullName}
              onChange={(e) => setLegalFullName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder={t('username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? t('creatingAccount') : t('signup')}
            </Button>
          </Form>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonContainer>
            <Button type="button" onClick={() => navigate('/login')}>
              {t('signin')}
            </Button>
          </ButtonContainer>
          <LanguageContainer>
            <GlobalIcon>🌐</GlobalIcon>
            <LanguageSelect value={language} onChange={handleLanguageChange}>
              {languageOptions.map(option => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </LanguageSelect>
          </LanguageContainer>
          <Footer>Mediaair Brands Limited</Footer>
        </Content>
        <NavigationArrows 
          onPrev={() => {}}
          onNext={handleNext}
          showPrev={false}
        />
      </Container>
    </>
  );
}