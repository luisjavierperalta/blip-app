import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MessageButton from './MessageButton';
import { FiX, FiSearch } from 'react-icons/fi';

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
  body {
    font-family: 'Interstate', Arial, Helvetica, sans-serif;
    background: #e6eaf1;
  }
`;

const SearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  padding: 16px;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 430px;
  height: 90vh;
  max-height: 700px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-radius: 36px;
  box-shadow: 0 8px 40px 0 rgba(30,40,80,0.10), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  border: 1.5px solid rgba(255,255,255,0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  position: relative;
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @media (max-width: 375px) {
    height: 95vh;
    border-radius: 28px;
  }
  @media (max-width: 320px) {
    height: 98vh;
    border-radius: 24px;
  }
`;

const SearchHeader = styled.div`
  padding: 16px;
  background: rgba(255,255,255,0.45);
  border-bottom: 1.5px solid #eee;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  @media (max-width: 375px) {
    padding: 14px;
    font-size: 1.25rem;
  }
  @media (max-width: 320px) {
    padding: 12px;
    font-size: 1.15rem;
  }
`;

const SearchTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.5px;
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
  @media (max-width: 375px) {
    font-size: 1.25rem;
  }
  @media (max-width: 320px) {
    font-size: 1.15rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255,255,255,0.45);
  border: 1.5px solid #eee;
  color: #111;
  cursor: pointer;
  padding: 8px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 700;
  width: 36px;
  height: 36px;
  &:hover {
    background: rgba(255,255,255,0.65);
    transform: scale(1.05);
  }
  @media (max-width: 375px) {
    width: 32px;
    height: 32px;
    padding: 6px;
  }
  @media (max-width: 320px) {
    width: 30px;
    height: 30px;
    padding: 5px;
  }
`;

const SearchInputWrapper = styled.div`
  padding: 12px 16px;
  position: relative;
  background: rgba(255,255,255,0.45);
  border-bottom: 1.5px solid #eee;
  @media (max-width: 375px) {
    padding: 10px 14px;
  }
  @media (max-width: 320px) {
    padding: 8px 12px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1.5px solid #eee;
  border-radius: 18px;
  background: rgba(255,255,255,0.85);
  font-size: 1.08rem;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(30,40,80,0.06);
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
  
  &:focus {
    border-color: #007aff;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 4px 12px rgba(0,122,255,0.08);
  }
  @media (max-width: 375px) {
    padding: 10px 14px 10px 36px;
    font-size: 1rem;
    border-radius: 16px;
  }
  @media (max-width: 320px) {
    padding: 8px 12px 8px 32px;
    font-size: 0.95rem;
    border-radius: 14px;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  @media (max-width: 375px) {
    left: 26px;
  }
  @media (max-width: 320px) {
    left: 24px;
  }
`;

const ResultsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  background: #f5f6fa;
  @media (max-width: 375px) {
    padding: 6px 14px;
  }
  @media (max-width: 320px) {
    padding: 4px 12px;
  }
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 8px 0;
  background: rgba(255,255,255,0.65);
  border-radius: 22px;
  box-shadow: 0 4px 16px rgba(30,40,80,0.10);
  border: 1.2px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: rgba(255,255,255,0.85);
  }
  @media (max-width: 375px) {
    padding: 14px;
    margin: 6px 0;
    border-radius: 18px;
  }
  @media (max-width: 320px) {
    padding: 12px;
    margin: 4px 0;
    border-radius: 16px;
  }
`;

const UserAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  object-fit: cover;
  margin-right: 16px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  @media (max-width: 375px) {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 14px;
  }
  @media (max-width: 320px) {
    width: 45px;
    height: 45px;
    border-radius: 22.5px;
    margin-right: 12px;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 1.15rem;
  color: #222;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
  @media (max-width: 375px) {
    font-size: 1.08rem;
  }
  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const UserUsername = styled.div`
  font-size: 0.97rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
  @media (max-width: 375px) {
    font-size: 0.92rem;
  }
  @media (max-width: 320px) {
    font-size: 0.88rem;
  }
`;

const NoResults = styled.div`
  padding: 32px;
  text-align: center;
  color: #888;
  font-size: 1.08rem;
  background: rgba(255,255,255,0.65);
  border-radius: 22px;
  margin: 16px 0;
  box-shadow: 0 4px 16px rgba(30,40,80,0.10);
  border: 1.2px solid rgba(255,255,255,0.25);
  font-family: 'Interstate', Arial, Helvetica, sans-serif;
  @media (max-width: 375px) {
    padding: 24px;
    font-size: 1rem;
    margin: 12px 0;
  }
  @media (max-width: 320px) {
    padding: 20px;
    font-size: 0.95rem;
    margin: 8px 0;
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 8px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 12px;
  color: #ff3b30;
  font-size: 0.95rem;
  text-align: center;
`;

const RetryButton = styled.button`
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 59, 48, 0.15);
  }
`;

const SearchPage = ({ onClose }: { onClose: () => void }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchUsers = async (term: string, isNewSearch: boolean = true) => {
    if (!term.trim()) {
      setSearchResults([]);
      setHasMore(true);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const usersRef = collection(db, 'users');
      let q;

      if (isNewSearch) {
        q = query(
          usersRef,
          where('searchTerms', 'array-contains', term.toLowerCase()),
          orderBy('displayName'),
          limit(20)
        );
      } else {
        q = query(
          usersRef,
          where('searchTerms', 'array-contains', term.toLowerCase()),
          orderBy('displayName'),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser?.uid);

      if (isNewSearch) {
        setSearchResults(results);
      } else {
        setSearchResults(prev => [...prev, ...results]);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 20);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setLastDoc(null);
      setHasMore(true);
      searchUsers(searchTerm, true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!searchContainerRef.current || isLoading || !hasMore || error) return;

    const { scrollTop, scrollHeight, clientHeight } = searchContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      searchUsers(searchTerm, false);
    }
  }, [isLoading, hasMore, searchTerm, error]);

  useEffect(() => {
    const container = searchContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleRetry = () => {
    setError(null);
    searchUsers(searchTerm, true);
  };

  return (
    <SearchOverlay onClick={onClose}>
      <GlobalStyle />
      <SearchContainer onClick={e => e.stopPropagation()}>
        <SearchHeader>
          <SearchTitle>Search Users</SearchTitle>
          <CloseButton onClick={onClose}>
            <FiX size={24} />
          </CloseButton>
        </SearchHeader>
        <SearchInputWrapper>
          <SearchInput
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon size={20} />
        </SearchInputWrapper>
        <ResultsContainer ref={searchContainerRef}>
          {error ? (
            <ErrorMessage>
              {error}
              <RetryButton onClick={handleRetry}>Retry</RetryButton>
            </ErrorMessage>
          ) : (
            <>
              {searchResults.map((user) => (
                <UserCard key={user.uid}>
                  <UserAvatar src={user.photoURL || 'https://via.placeholder.com/150'} alt={user.displayName} />
                  <UserInfo>
                    <UserName>{user.displayName}</UserName>
                    <UserUsername>@{user.username || user.displayName.toLowerCase().replace(/\s+/g, '')}</UserUsername>
                  </UserInfo>
                  <MessageButton 
                    targetUserId={user.uid} 
                    targetUserName={user.displayName}
                  />
                </UserCard>
              ))}
              {isLoading && (
                <NoResults>Loading...</NoResults>
              )}
              {!isLoading && searchTerm && searchResults.length === 0 && (
                <NoResults>No users found</NoResults>
              )}
              {!isLoading && !searchTerm && (
                <NoResults>Start typing to search users</NoResults>
              )}
            </>
          )}
        </ResultsContainer>
      </SearchContainer>
    </SearchOverlay>
  );
};

export default SearchPage; 