import { createPublicClient, http } from 'viem';
import { CHAINS } from '@/configs/chain';
import { DEFAULT_CHAIN, RPC_URLS } from '@/configs/rpc';

// Read interactions
export const publicClient = createPublicClient({
  chain: CHAINS[DEFAULT_CHAIN],
  transport: http(RPC_URLS[DEFAULT_CHAIN]),
});
