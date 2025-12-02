import type { TxInfo } from '@/types/transaction';
import { createContext, useContext, useState } from 'react';

type TxContextType = {
  latestTx: TxInfo | null;
  addTx: (tx: TxInfo) => void;
};

const TxContext = createContext<TxContextType | undefined>(undefined);

export const TxProvider = ({ children }: { children: React.ReactNode }) => {
  const [latestTx, setLatestTx] = useState<TxInfo | null>(null);

  const addTx = (tx: TxInfo) => setLatestTx(tx);

  return (
    <TxContext.Provider value={{ latestTx, addTx }}>
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => {
  const context = useContext(TxContext);
  if (!context) throw new Error('useTxContext must be used inside TxProvider');
  return context;
};
