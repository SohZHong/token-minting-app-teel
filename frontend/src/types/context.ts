import type { SupportedChain } from '@/configs';
import type { TxInfo } from './transaction';

export type TxContextType = {
  latestTx: TxInfo | null;
  addTx: (tx: TxInfo) => void;
};

export type WalletContextType = {
  address: `0x${string}` | null;
  isConnected: boolean;
  chainId: number | null;
  networkMismatch: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork?: (targetChainId?: SupportedChain) => Promise<void>;
};
