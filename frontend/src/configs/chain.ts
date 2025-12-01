// src/config/chains.ts
import { sepolia, localhost } from 'viem/chains';

export const CHAINS = {
  sepolia,
  localhost,
};

export type SupportedChain = keyof typeof CHAINS;
