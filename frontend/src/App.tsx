import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import MapPage from './components/MapPage';
import MessagesPage from './components/MessagesPage';
import DevNavigation from './components/DevNavigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import ProfilePageOthers from './components/ProfilePageOthers';
import { setupPresence } from './services/presence';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setupPresence();
    }
  }, [currentUser]);

  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        <Route path="/profile/charlotte" element={<ProfilePageOthers />} />
        <Route path="/profile/:userId" element={<ProfilePageOthers />} />
      </Routes>
      {location.pathname === '/search' && (
        <SearchPage onClose={() => navigate(-1)} />
      )}
      <DevNavigation />
    </>
  );
}
