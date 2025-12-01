import { createWalletClient, custom } from 'viem';
import { CHAINS } from '@/configs/chain';
import { DEFAULT_CHAIN } from '@/configs/rpc';

// Write interactions
export const walletClient = createWalletClient({
  chain: CHAINS[DEFAULT_CHAIN],
  transport: custom(window.ethereum),
});
