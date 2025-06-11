import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import icon from '../icon.png';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

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
    font-family: 'Interstate', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
  padding: 0 20px;
  font-family: 'Interstate', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 8px;
`;

const BackArrow = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 2.2rem;
  cursor: pointer;
  margin-right: 8px;
  margin-left: 0;
`;

const Logo = styled.img`
  display: block;
  margin: 0 auto 0 auto;
  width: 80px;
  height: auto;
  margin-bottom: 8px;
`;

const Tagline = styled.div`
  color: #ff6600;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 24px;
  font-weight: 600;
  font-family: 'Interstate', sans-serif;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin: 24px 0 12px 0;
  font-family: 'Interstate', sans-serif;
`;

const Explanation = styled.p`
  color: #222;
  font-size: 1.1rem;
  text-align: center;
  margin: 0 0 24px 0;
  font-weight: 400;
  font-family: 'Interstate', sans-serif;
`;

const OtpLabel = styled.div`
  color: #0057ff;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
  text-align: left;
  font-family: 'Interstate', sans-serif;
`;

const OtpInstruction = styled.div`
  color: #0057ff;
  font-size: 1rem;
  margin-bottom: 16px;
  text-align: left;
  font-family: 'Interstate', sans-serif;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 auto;
`;

const Label = styled.label`
  color: #222;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 4px;
  font-family: 'Interstate', sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #bbb;
  background: #fafafa;
  color: #222;
  font-size: 1.1rem;
  margin-bottom: 8px;
  font-family: 'Interstate', sans-serif;

  &::placeholder {
    color: #bbb;
  }
`;

const OtpInput = styled(Input)`
  text-align: center;
  font-size: 2rem;
  width: 40px;
  padding: 0;
  margin-bottom: 0;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 4px;
  border: none;
  background: #ff6600;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  font-family: 'Interstate', sans-serif;

  &:hover {
    background: #e65c00;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff3b30;
  text-align: center;
  margin: 8px 0;
  font-size: 1rem;
  font-family: 'Interstate', sans-serif;
`;

const SuccessMessage = styled.p`
  color: #34c759;
  text-align: center;
  margin: 8px 0;
  font-size: 1rem;
  font-family: 'Interstate', sans-serif;
`;

const OtpInputRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

interface PhoneVerificationProps {
  phoneNumber?: string;
  onVerificationComplete: () => void;
  onBack: () => void;
}

export default function PhoneVerification({ phoneNumber: initialPhone, onVerificationComplete, onBack }: PhoneVerificationProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!phoneNumber.match(/^\+?\d{10,15}$/)) {
        throw new Error(t('enterValidPhoneNumber'));
      }
      setTimeout(() => {
        setStep('otp');
        setLoading(false);
        setSuccess(t('verificationCodeSent'));
      }, 800);
    } catch (err: any) {
      setError(err.message || t('sendCodeError'));
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs[5].current?.focus();
      e.preventDefault();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const code = otp.join('');
    try {
      if (code.length !== 6) {
        throw new Error(t('enter6DigitCode'));
      }
      setTimeout(() => {
        setSuccess(t('phoneVerified'));
        setLoading(false);
        onVerificationComplete();
        navigate('/setup-profile');
      }, 1000);
    } catch (err: any) {
      setError(err.message || t('verifyPhoneError'));
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <LanguageSelector style={{ alignSelf: 'flex-end', marginRight: 24, marginBottom: 8 }} />
        <TopBar>
          <BackArrow onClick={onBack} aria-label={t('back')}>&#8592;</BackArrow>
        </TopBar>
        <Logo src={icon} alt="blip logo" />
        <Tagline>300m, Real-Time Vibes.</Tagline>
        <Heading>{t('verifyYourID')}</Heading>
        <Explanation>{t('phoneVerificationExplanation')}</Explanation>
        {step === 'phone' ? (
          <Form onSubmit={handleSendCode}>
            <Label htmlFor="phone">{t('phoneNumber')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('enterPhoneNumber')}
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={loading}>{loading ? t('sending') : t('sendCode')}</Button>
          </Form>
        ) : (
          <Form onSubmit={handleVerifyOtp}>
            <OtpLabel>{t('otpVerification')}</OtpLabel>
            <OtpInstruction>{t('enterOtp')}</OtpInstruction>
            <OtpInputRow>
              {otp.map((digit, idx) => (
                <OtpInput
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  autoFocus={idx === 0}
                  aria-label={t('digit', { number: idx + 1 })}
                />
              ))}
            </OtpInputRow>
            <Button type="submit" disabled={loading}>{loading ? t('verifying') : t('verify')}</Button>
          </Form>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Container>
    </>
  );
} 