import { sepolia, anvil } from 'viem/chains';

export const CHAINS = {
  11155111: sepolia,
  31337: anvil,
};

export type SupportedChain = keyof typeof CHAINS;
