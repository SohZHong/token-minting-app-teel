import { createContext, useContext, useState, useCallback } from 'react';
import { getWalletClient } from '@/lib/viem';

type WalletContextType = {
  address: `0x${string}` | null;
  isConnected: boolean;
  connect: () => Promise<void>;
};

// Create a global context provider to act as store
const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const connect = useCallback(async () => {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error('No wallet detected');

    const [acc] = await walletClient.requestAddresses();
    setAddress(acc);
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, isConnected: Boolean(address), connect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('WalletContext is not available');
  return ctx;
}
