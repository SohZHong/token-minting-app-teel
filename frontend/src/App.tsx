import './App.css';
import { WalletProvider } from '@/context/WalletContext';
import Dashboard from '@/pages/Dashboard';

function App() {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
}

export default App;
