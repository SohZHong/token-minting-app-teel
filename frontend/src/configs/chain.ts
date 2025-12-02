import { sepolia, localhost } from 'viem/chains';

export const CHAINS = {
  11155111: sepolia,
  31337: localhost,
};

export type SupportedChain = keyof typeof CHAINS;
