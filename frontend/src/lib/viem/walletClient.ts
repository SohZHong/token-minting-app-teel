import { createWalletClient, custom } from 'viem';
import { CHAINS } from '@/configs/chain';
import { DEFAULT_CHAIN } from '@/configs/rpc';

export const getWalletClient = () => {
  if (typeof window === 'undefined') return null;

  const provider = (window as any).ethereum;
  if (!provider) return null;

  return createWalletClient({
    chain: CHAINS[DEFAULT_CHAIN],
    transport: custom(provider),
  });
};
