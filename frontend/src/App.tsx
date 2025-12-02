import './App.css';
import { WalletProvider } from '@/context/WalletContext';
import Dashboard from '@/pages/Dashboard';
import { TxProvider } from './context/TxContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <WalletProvider>
      <TxProvider>
        <Toaster position='bottom-right' />
        <Dashboard />
      </TxProvider>
    </WalletProvider>
  );
}

export default App;
