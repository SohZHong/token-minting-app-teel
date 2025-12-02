import type { SupportedChain } from '@/configs';

export type TxState = {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirmed: boolean;
  error: Error | null;
};

export type TxInfo = {
  hash: string;
  chainId: SupportedChain;
  contract?: string; // to identify contract
};
