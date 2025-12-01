import { useState, useCallback } from 'react';
import { walletClient } from '@/lib/viem';

export function useConnect() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const connect = useCallback(async () => {
    if (!walletClient) throw new Error('Wallet client not initialized');

    const [acc] = await walletClient.requestAddresses();
    setAddress(acc);
    return acc;
  }, []);

  return { connect, address };
}
