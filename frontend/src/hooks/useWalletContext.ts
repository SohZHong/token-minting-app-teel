import { WalletContext } from '@/context/WalletContext';
import { useContext } from 'react';

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('WalletContext is not available');
  return ctx;
}
