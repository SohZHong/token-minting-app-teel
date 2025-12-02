import './App.css';
import Dashboard from '@/pages/Dashboard';
import { AppProvider } from './components/AppProvider';

function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

export default App;
