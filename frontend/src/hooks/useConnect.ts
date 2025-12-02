import { getWalletClient } from '@/lib/viem';
import { useState, useCallback } from 'react';

export function useConnect() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const connect = useCallback(async () => {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error('No wallet detected');

    const [acc] = await walletClient.requestAddresses();
    setAddress(acc);
    return acc;
  }, []);

  return { address, connect, isConnected: Boolean(address) };
}
