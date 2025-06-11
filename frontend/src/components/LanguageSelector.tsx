import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 16px;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const LanguageSelect = styled.select`
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 0;
  border: 1px solid #888;
  background: #fff;
  color: #222;
  font-size: 1rem;
  font-family: inherit;
  box-shadow: none;
  appearance: auto;
  outline: none;
  transition: none;
  cursor: pointer;
`;

const LanguageOption = styled.option`
  color: #222;
  background: #fff;
`;

export default function LanguageSelector({ style }: { style?: React.CSSProperties }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState(i18n.language || 'en');

  React.useEffect(() => {
    // Keep in sync if language changes elsewhere
    setLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('appLanguage', newLang);
  };

  return (
    <SelectWrapper style={style}>
      <Label htmlFor="language-select">{t('language')}</Label>
      <LanguageSelect
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        aria-label={t('language')}
      >
        {languageOptions.map(opt => (
          <LanguageOption key={opt.code} value={opt.code}>{opt.label}</LanguageOption>
        ))}
      </LanguageSelect>
    </SelectWrapper>
  );
} 