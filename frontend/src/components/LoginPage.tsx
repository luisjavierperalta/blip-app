import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import icon from '../icon.png';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import PhoneVerification from './PhoneVerification';
import { getFirestore, collection as fsCollection, query as fsQuery, where as fsWhere, getDocs } from 'firebase/firestore';

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
  body, input, button, textarea {
    font-family: 'Interstate', Arial, Helvetica, sans-serif;
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
  padding: 0;
`;

const PhoneFrame = styled.div`
  width: 370px;
  max-width: 100vw;
  min-height: 700px;
  background: #fff;
  border-radius: 36px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  margin: 32px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  margin: 38px 0 0 0;
`;

const Tagline = styled.div`
  color: #ff6600;
  font-size: 1.12rem;
  font-weight: 700;
  margin: 18px 0 0 0;
  text-align: center;
`;

const Title = styled.div`
  font-size: 1.45rem;
  font-weight: 800;
  color: #111;
  margin: 18px 0 0 0;
  text-align: center;
`;

const TabRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0 0 0;
  gap: 12px;
`;

const TabBtn = styled.button<{active?: boolean}>`
  background: ${p => p.active ? '#ff6600' : 'rgba(255,255,255,0.85)'};
  color: ${p => p.active ? '#fff' : '#ff6600'};
  border: 1.5px solid #ff6600;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  padding: 7px 22px;
  border-radius: 22px;
  box-shadow: ${p => p.active ? '0 2px 8px rgba(255,102,0,0.08)' : 'none'};
  transition: all 0.2s;
  outline: none;
`;

const Form = styled.form`
  width: 90%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 32px auto 0 auto;
`;

const Label = styled.label`
  color: #222;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 1.08rem;
  background: #fafafa;
  color: #222;
  transition: all 0.3s ease;
  &::placeholder { color: #bbb; }
  &:focus { outline: none; border-color: #ff6600; background: #fff; }
`;

const LoginBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  background: #ff6600;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover { background: #e65c00; }
`;

const ForgotLink = styled.a`
  color: #007aff;
  font-size: 1rem;
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
  text-decoration: underline;
`;

const Beta = styled.div`
  color: #00c800;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  margin: 32px 0 0 0;
`;

const OtpInstructions = styled.div`
  color: #888;
  font-size: 0.92rem;
  font-weight: 400;
  text-align: center;
  margin: 18px 0 0 0;
  line-height: 1.6;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 28px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.18);
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function LoginPage() {
  const [tab, setTab] = useState<'phone'|'password'>('phone');
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const db = getFirestore();

  // Username/password login (for dev/testing)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let loginEmail = email;
      // If not an email, treat as username and look up email in Firestore
      if (!loginEmail.includes('@')) {
        const q = fsQuery(fsCollection(db, 'users'), fsWhere('username', '==', loginEmail));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error('Username not found');
        loginEmail = snap.docs[0].data().email;
      }
      await signInWithEmailAndPassword(auth, loginEmail, password);
      // Redirect to home or dashboard
      window.location.href = '/home';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Phone login: show OTP screen
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtp(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setResetLoading(true);
    try {
      let resetEmail = resetInput;
      if (!resetEmail.includes('@')) {
        const q = fsQuery(fsCollection(db, 'users'), fsWhere('username', '==', resetEmail));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error('Username not found');
        resetEmail = snap.docs[0].data().email;
      }
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setResetMsg(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <PhoneFrame>
          <Logo src={icon} alt="blip" />
          <Tagline>300m, Real-Time Vibes.</Tagline>
          <Title>Login</Title>
          <TabRow>
            <TabBtn active={tab==='phone'} onClick={()=>setTab('phone')}>Phone</TabBtn>
            <TabBtn active={tab==='password'} onClick={()=>setTab('password')}>Username/Password</TabBtn>
          </TabRow>
          {tab === 'phone' && !showOtp && (
            <Form onSubmit={handlePhoneLogin}>
              <Label>Sign in</Label>
              <Input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <LoginBtn type="submit">Continue</LoginBtn>
            </Form>
          )}
          {tab === 'phone' && showOtp && (
            <PhoneVerification phoneNumber={phone} onVerificationComplete={()=>window.location.href='/home'} onBack={()=>setShowOtp(false)} />
          )}
          {tab === 'password' && (
            <Form onSubmit={handlePasswordLogin}>
              <Label>Sign in</Label>
              <Input
                type="text"
                placeholder="Email or username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <LoginBtn type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in & connect'}</LoginBtn>
              {error && <div style={{color:'#ff2d2d',marginTop:8,textAlign:'center'}}>{error}</div>}
            </Form>
          )}
          <ForgotLink href="#" onClick={e => {e.preventDefault();setShowReset(true);}}>Don't know your password?</ForgotLink>
          <Beta>v1.0 BETA</Beta>
          <OtpInstructions>
            <div><b>Get started with OTP Login</b></div>
            <div>1. Enter your phone number<br />We'll send you a one-time code to verify it's really you.</div>
            <div>2. Check your SMS inbox<br />Enter the 6-digit code we just sent.</div>
            <div>3. You're in!<br />Start connecting with real people nearby — in real time.</div>
          </OtpInstructions>
        </PhoneFrame>
        {showReset && (
          <ModalOverlay onClick={()=>setShowReset(false)}>
            <ModalBox onClick={e=>e.stopPropagation()}>
              <h3 style={{marginBottom:12}}>Reset Password</h3>
              <form onSubmit={handlePasswordReset} style={{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:12}}>
                <Input
                  type="text"
                  placeholder="Email or username"
                  value={resetInput}
                  onChange={e => setResetInput(e.target.value)}
                  required
                />
                <LoginBtn type="submit" disabled={resetLoading}>{resetLoading ? 'Sending...' : 'Send Reset Email'}</LoginBtn>
                {resetMsg && <div style={{color:resetMsg.includes('sent')?'#00c800':'#ff2d2d',marginTop:8,textAlign:'center'}}>{resetMsg}</div>}
              </form>
              <button style={{marginTop:18,background:'#007aff',color:'#fff',border:'none',borderRadius:12,padding:'8px 24px',fontWeight:700,cursor:'pointer'}} onClick={()=>setShowReset(false)}>Cancel</button>
            </ModalBox>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
} 