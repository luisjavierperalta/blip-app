import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  width: 94vw;
  max-width: 370px;
  background: rgba(255,255,255,0.85);
  border-radius: 32px;
  box-shadow: 0 8px 32px 0 rgba(30,40,80,0.13), 0 1.5px 0 0 rgba(255,255,255,0.18) inset;
  border: 1.5px solid #e6eaf1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 18px 24px 18px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
`;

const Title = styled.div`
  font-size: 1.45rem;
  font-weight: 900;
  color: #222;
  margin-bottom: 18px;
`;

const Balance = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: #007aff;
  margin-bottom: 8px;
`;

const Label = styled.div`
  font-size: 1.08rem;
  color: #888;
  margin-bottom: 18px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin: 18px 0 0 0;
  width: 100%;
  justify-content: center;
`;

const WalletBtn = styled.button`
  background: linear-gradient(90deg, #007aff 0%, #00b8ff 100%);
  color: #fff;
  font-size: 1.18rem;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  padding: 14px 28px;
  box-shadow: 0 2px 12px rgba(30,40,80,0.10);
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s;
  &:hover {
    background: linear-gradient(90deg, #00b8ff 0%, #007aff 100%);
    box-shadow: 0 4px 18px rgba(30,40,80,0.13);
  }
`;

const TxList = styled.div`
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TxItem = styled.div`
  font-size: 1.02rem;
  color: #333;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  coolPointsBalance: number;
  onSend: () => void;
  onBuy: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ open, onClose, userId, coolPointsBalance, onSend, onBuy }) => {
  const [txs, setTxs] = useState<any[]>([]);
  useEffect(() => {
    if (!open) return;
    const q = query(
      collection(db, 'coolPointsTransactions'),
      where('from', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTxs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [open, userId]);
  if (!open) return null;
  return (
    <Overlay>
      <ModalCard>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <Title>Cool Points Wallet</Title>
        <Balance>{coolPointsBalance.toLocaleString()} 🪙</Balance>
        <Label>Private Balance</Label>
        <ButtonRow>
          <WalletBtn onClick={onSend}>Send</WalletBtn>
          <WalletBtn onClick={onBuy}>Buy</WalletBtn>
        </ButtonRow>
        <TxList>
          {txs.length === 0 ? (
            <TxItem>No recent transactions</TxItem>
          ) : txs.map(tx => (
            <TxItem key={tx.id}>
              {tx.type === 'gift' ? `Gifted 1 point to ${tx.to}` : `${tx.type} ${tx.amount}`}
              <span style={{marginLeft:'auto',fontSize:'0.92rem',color:'#888'}}>{tx.timestamp?.toDate?.().toLocaleString?.() || ''}</span>
            </TxItem>
          ))}
        </TxList>
      </ModalCard>
    </Overlay>
  );
};

export default WalletModal; 