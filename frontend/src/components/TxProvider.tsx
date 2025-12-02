import { TxContext } from '@/context/TxContext';
import type { TxInfo } from '@/types/transaction';
import { useState } from 'react';

export const TxProvider = ({ children }: { children: React.ReactNode }) => {
  const [latestTx, setLatestTx] = useState<TxInfo | null>(null);

  const addTx = (tx: TxInfo) => setLatestTx(tx);

  return (
    <TxContext.Provider value={{ latestTx, addTx }}>
      {children}
    </TxContext.Provider>
  );
};
