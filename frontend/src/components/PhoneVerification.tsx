import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import icon from '../icon.png';
import { useTranslation } from 'react-i18next';

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
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
  padding: 40px 24px;
  margin: 0 auto;
  box-sizing: border-box;
  max-width: 480px;
`;

const TopSpace = styled.div`
  height: 40px;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
  object-fit: contain;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #ff6600;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  font-family: 'Interstate', sans-serif;
  line-height: 1.4;
`;

const Subtitle = styled.h2`
  color: #222;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  font-family: 'Interstate', sans-serif;
  line-height: 1.4;
`;

const Description = styled.p`
  color: #666;
  font-size: 1.18rem;
  font-weight: 300;
  margin: 0;
  line-height: 1.5;
  font-family: 'Interstate', sans-serif;
  max-width: 340px;
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

const Tagline = styled.div`
  color: #ff6600;
  font-size: 1.25rem;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 24px;
  font-weight: 600;
  font-family: 'Interstate', sans-serif;
`;

const Heading = styled.h1`
  font-size: 2.3rem;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin: 28px 0 16px 0;
  font-family: 'Interstate', sans-serif;
`;

const Explanation = styled.p`
  color: #222;
  font-size: 1.25rem;
  text-align: center;
  margin: 0 0 28px 0;
  font-weight: 400;
  font-family: 'Interstate', sans-serif;
`;

const OtpLabel = styled.div`
  color: #0057ff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 4px;
  text-align: left;
  font-family: 'Interstate', sans-serif;
`;

const OtpInstruction = styled.div`
  color: #0057ff;
  font-size: 1.18rem;
  margin-bottom: 18px;
  text-align: left;
  font-family: 'Interstate', sans-serif;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 0 auto;
`;

const Label = styled.label`
  color: #222;
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 4px;
  width: 100%;
  text-align: left;
  font-family: 'Interstate', sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
  color: #222;
  font-size: 1.18rem;
  font-family: 'Interstate', sans-serif;
  font-weight: 300;
  box-sizing: border-box;
  text-align: center;

  &::placeholder {
    color: #999;
    text-align: center;
    font-size: 1.18rem;
  }

  &:focus {
    outline: none;
    border-color: #ff6600;
    background: #fff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 18px;
  border-radius: 8px;
  border: none;
  background: #ff6600;
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  cursor: pointer;
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

const OtpInputRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%;
  margin-bottom: 16px;
`;

const OtpInput = styled.input`
  width: 48px;
  height: 56px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fafafa;
  color: #222;
  font-size: 1.55rem;
  font-weight: 700;
  text-align: center;
  font-family: 'Interstate', sans-serif;

  &:focus {
    outline: none;
    border-color: #ff6600;
    background: #fff;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 1.08rem;
  text-align: center;
  margin-top: 10px;
  font-family: 'Interstate', sans-serif;
`;

const SuccessMessage = styled.p`
  color: #34c759;
  text-align: center;
  margin: 10px 0;
  font-size: 1.18rem;
  font-family: 'Interstate', sans-serif;
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
  const [success, setSuccess] = useState<string | boolean>('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (!phoneNumber.match(/^\+?\d{10,15}$/)) {
        throw new Error(t('enterValidPhoneNumber'));
      }
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
        setSuccess(t('verificationCodeSent'));
      }, 800);
    } catch (err: any) {
      setError(err.message || t('sendCodeError'));
      setIsLoading(false);
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

  const handleVerifyOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const otpValue = otp.join('');
      
      if (otpValue.length !== 6) {
        throw new Error(t('invalidOtp'));
      }

      // Verify OTP (mock verification for now)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setError('');
      
      // Redirect to home page after successful verification
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err: any) {
      setError(err.message || t('verificationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <TopSpace />
        <Logo src={icon} alt="Logo" />
        <TextContainer>
          <Title>Join a Community of Verified Users</Title>
          <Subtitle>Verify your ID</Subtitle>
          <Description>Protecting You from Bots, Fakes, and Scams. Phone Verification Required</Description>
        </TextContainer>
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
          <Button type="submit" disabled={isLoading}>{isLoading ? t('sending') : t('sendCode')}</Button>
        </Form>
        {step === 'otp' && (
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
            <Button type="submit" disabled={isLoading}>{isLoading ? t('verifying') : t('verify')}</Button>
          </Form>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Container>
    </>
  );
} 