import { useConnect } from './useConnect';

// Simple wrapper for useConnect hook
export function useWallet() {
  const { connect, address } = useConnect();
  const isConnected = Boolean(address);

  return { connect, address, isConnected };
}
