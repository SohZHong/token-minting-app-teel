import { createWalletClient, custom } from 'viem';
import { DEFAULT_CHAIN, CHAINS } from '@/configs';

// Get wallet client when user has a wallet available
export const getWalletClient = () => {
  if (typeof window === 'undefined') return null;

  const provider = (window as any).ethereum;
  if (!provider) return null;

  return createWalletClient({
    chain: CHAINS[DEFAULT_CHAIN],
    transport: custom(provider),
  });
};
