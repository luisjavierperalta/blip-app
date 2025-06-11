import './i18n';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AuthPage from './AuthPage';
import ProfileSetupPage from './components/ProfileSetupPage';
import HomePage from './components/HomePage';
import DevNavigation from './components/DevNavigation';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/setup-profile" element={<ProfileSetupPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
        <DevNavigation />
      </Router>
    </I18nextProvider>
  );
}

export default App;