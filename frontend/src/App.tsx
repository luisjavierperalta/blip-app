import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import MapPage from './components/MapPage';
import MessagesPage from './components/MessagesPage';
import DevNavigation from './components/DevNavigation';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
        <DevNavigation />
      </Router>
    </AuthProvider>
  );
}
