import './App.css';
import { WalletProvider } from '@/context/WalletContext';
import Dashboard from '@/pages/Dashboard';
import { TxProvider } from './context/TxContext';

function App() {
  return (
    <WalletProvider>
      <TxProvider>
        <Dashboard />
      </TxProvider>
    </WalletProvider>
  );
}

export default App;
