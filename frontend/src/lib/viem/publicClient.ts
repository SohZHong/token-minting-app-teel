import { createPublicClient, http } from 'viem';
import { CHAINS, type SupportedChain } from '@/configs';

// For read operations
export const getPublicClient = (chainId: SupportedChain) => {
  const chain = CHAINS[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  return createPublicClient({
    chain,
    transport: http(),
  });
};
