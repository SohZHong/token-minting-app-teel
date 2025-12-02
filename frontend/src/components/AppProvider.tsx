import { Toaster } from 'react-hot-toast';
import { TxProvider } from './TxProvider';
import { WalletProvider } from './WalletProvider';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <TxProvider>
        <Toaster position='bottom-right' />
        {children}
      </TxProvider>
    </WalletProvider>
  );
};
