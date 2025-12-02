import { TxContext } from '@/context/TxContext';
import { useContext } from 'react';

export const useTxContext = () => {
  const context = useContext(TxContext);
  if (!context) throw new Error('useTxContext must be used inside TxProvider');
  return context;
};
