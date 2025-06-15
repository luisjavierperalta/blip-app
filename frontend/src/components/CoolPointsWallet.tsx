import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Modal from 'react-modal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const WalletContainer = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 40px rgba(30,40,80,0.18);
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const WalletIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
`;

const WalletTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
`;

const BalanceContainer = styled.div`
  background: linear-gradient(135deg, #1ecb83 0%, #00b8ff 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const BalanceAmount = styled.div`
  font-size: 2.4rem;
  font-weight: 700;
`;

const SendPointsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #666;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1.5px solid #e6eaf1;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1ecb83;
    box-shadow: 0 0 0 3px rgba(30,203,131,0.1);
  }
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled ? '#e6eaf1' : 'linear-gradient(90deg, #1ecb83 0%, #00b8ff 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(30,203,131,0.2)'};
  }
`;

const BuyPointsButton = styled.button`
  background: #111;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      rgba(255, 51, 102, 0.2) 0%, 
      rgba(255, 107, 61, 0.2) 50%, 
      rgba(255, 179, 0, 0.2) 100%
    );
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
    z-index: 2;
  }

  &:hover::after {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 51, 102, 0.3);
  }

  &:disabled {
    background: #222;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.8;
  }

  > * {
    position: relative;
    z-index: 3;
  }
`;

const InProgressBadge = styled.div`
  background: rgba(255, 51, 102, 0.15);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 51, 102, 0.3);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(255, 51, 102, 0.15);
  position: relative;
  z-index: 3;
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 51, 102, 0.3);
  border-top: 2px solid #ff3366;
  border-right: 2px solid #ff6b3d;
  border-bottom: 2px solid #ffb300;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TransactionHistory = styled.div`
  margin-top: 24px;
`;

const TransactionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionUser = styled.div`
  font-weight: 600;
  color: #222;
`;

const TransactionDate = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const TransactionAmount = styled.div<{ type: 'sent' | 'received' }>`
  font-weight: 700;
  color: ${props => props.type === 'sent' ? '#ff3b30' : '#1ecb83'};
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1;
`;

const SearchResultItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #222;
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const InputWrapper = styled.div`
  position: relative;
`;

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

interface CoolPointsWalletProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  initialRecipient?: {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
  };
}

const CoolPointsWallet: React.FC<CoolPointsWalletProps> = ({ isOpen, onClose, recipientId, initialRecipient }) => {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(recipientId || '');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(initialRecipient || null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      fetchTransactions();
      if (initialRecipient) {
        setSelectedUser(initialRecipient);
      }
    }
  }, [isOpen, initialRecipient]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('displayName', '>=', searchQuery),
          where('displayName', '<=', searchQuery + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
          .map(doc => ({ uid: doc.id, ...doc.data() } as User))
          .filter(user => user.uid !== currentUser?.uid);
        setSearchResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentUser]);

  const fetchBalance = async () => {
    try {
      const getCoolPointsBalance = httpsCallable(functions, 'getCoolPointsBalance');
      const result = await getCoolPointsBalance();
      setBalance(result.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const getCoolPointsTransactions = httpsCallable(functions, 'getCoolPointsTransactions');
      const result = await getCoolPointsTransactions();
      setTransactions(result.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSendPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedUser || isLoading) return;

    setIsLoading(true);
    try {
      const sendCoolPoints = httpsCallable(functions, 'sendCoolPoints');
      await sendCoolPoints({
        recipientId: selectedUser.uid,
        amount: parseInt(amount)
      });

      // Refresh balance and transactions
      await fetchBalance();
      await fetchTransactions();

      // Reset form
      setAmount('');
      setSelectedUser(null);
      setSearchQuery('');
      
      alert('Cool Points sent successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to send Cool Points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1000 },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '24px',
          padding: 0,
          border: 'none',
          background: 'none',
          maxWidth: 400,
          width: '95vw'
        }
      }}
      ariaHideApp={false}
    >
      <WalletContainer>
        <WalletHeader>
          <WalletIcon src="/coin.png" alt="Cool Points" />
          <WalletTitle>Cool Points Wallet</WalletTitle>
        </WalletHeader>

        <BalanceContainer>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>{balance} CP</BalanceAmount>
        </BalanceContainer>

        <SendPointsForm onSubmit={handleSendPoints}>
          <InputGroup>
            <Label>Recipient</Label>
            <InputWrapper>
              <Input
                type="text"
                value={selectedUser ? selectedUser.displayName : searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder="Search by username"
                disabled={!!recipientId}
                required
              />
              {searchQuery && !selectedUser && (
                <SearchResults>
                  {isSearching ? (
                    <SearchResultItem>Searching...</SearchResultItem>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <SearchResultItem
                        key={user.uid}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery('');
                        }}
                      >
                        <UserAvatar src={user.photoURL} alt={user.displayName} />
                        <UserInfo>
                          <UserName>{user.displayName}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                        </UserInfo>
                      </SearchResultItem>
                    ))
                  ) : (
                    <SearchResultItem>No users found</SearchResultItem>
                  )}
                </SearchResults>
              )}
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={balance}
              required
            />
          </InputGroup>

          <SendButton
            type="submit"
            disabled={!amount || !selectedUser || isLoading || parseInt(amount) > balance}
          >
            {isLoading ? 'Sending...' : 'Send Cool Points'}
          </SendButton>
        </SendPointsForm>

        <BuyPointsButton disabled>
          <img src="/coin.png" alt="buy" style={{ width: 24, height: 24, filter: 'drop-shadow(0 2px 4px rgba(255, 51, 102, 0.3))' }} />
          Buy Cool Points
          <InProgressBadge>
            <Spinner />
            In Progress
          </InProgressBadge>
        </BuyPointsButton>

        <TransactionHistory>
          <TransactionTitle>Recent Transactions</TransactionTitle>
          <TransactionList>
            {transactions.map((tx, index) => (
              <TransactionItem key={index}>
                <TransactionInfo>
                  <TransactionUser>
                    {tx.type === 'sent' ? `To: ${tx.recipientName}` : `From: ${tx.senderName}`}
                  </TransactionUser>
                  <TransactionDate>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </TransactionDate>
                </TransactionInfo>
                <TransactionAmount type={tx.type}>
                  {tx.type === 'sent' ? '-' : '+'}{tx.amount} CP
                </TransactionAmount>
              </TransactionItem>
            ))}
          </TransactionList>
        </TransactionHistory>
      </WalletContainer>
    </Modal>
  );
};

export default CoolPointsWallet; 