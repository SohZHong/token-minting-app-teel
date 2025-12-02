import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { getWalletClient } from '@/lib/viem';
import { CHAINS, type SupportedChain } from '@/configs/chain';
import type { WalletClient } from 'viem';
import toast from 'react-hot-toast';

type WalletContextType = {
  address: `0x${string}` | null;
  isConnected: boolean;
  chainId: number | null;
  networkMismatch: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork?: (targetChainId?: SupportedChain) => Promise<void>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkMismatch, setNetworkMismatch] = useState(false);

  // Store wallet client in a ref to avoid multiple calls
  const walletClientRef = useRef<WalletClient>(null);

  const connect = useCallback(async () => {
    try {
      // Initialize wallet client only once
      if (!walletClientRef.current) {
        const client = getWalletClient();
        if (!client) throw new Error('No wallet detected');
        walletClientRef.current = client;
      }

      const client = walletClientRef.current;

      // Request addresses
      const [acc] = await client.requestAddresses();
      setAddress(acc);

      // Detect chain
      const id = await client.getChainId();
      setChainId(id);

      // Check network support
      setNetworkMismatch(!(id in CHAINS));
    } catch (err) {
      console.error('Wallet connect failed:', err);
    }
  }, []);

  const switchNetwork = useCallback(async (targetChainId?: SupportedChain) => {
    try {
      // Get wallet client
      const client = walletClientRef.current;
      if (!client) throw new Error('Wallet not connected');

      // Get chain id (defaults to first entry in supported chains if not provided)
      const chainIdToSwitch =
        targetChainId ?? parseInt(Object.keys(CHAINS)[0], 10);

      // Get chain config
      const chainConfig = CHAINS[chainIdToSwitch as SupportedChain];
      if (!chainConfig) throw new Error('Unsupported chain');

      await client.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainIdToSwitch.toString(16)}` }],
      });

      setChainId(chainIdToSwitch);
      setNetworkMismatch(false);

      toast.success(`Switched to ${chainConfig.name}`);
    } catch (switchError: any) {
      // If chain not added in wallet (error 4902)
      if (switchError.code === 4902) {
        try {
          const chainIdToSwitch =
            targetChainId ?? parseInt(Object.keys(CHAINS)[0], 10);
          const chainConfig = CHAINS[chainIdToSwitch as SupportedChain];
          await walletClientRef.current?.addChain({ chain: chainConfig });

          toast.success(
            `${chainConfig.name} added to MetaMask! Switching now...`
          );

          // After adding, switch again
          await walletClientRef.current?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainIdToSwitch.toString(16)}` }],
          });

          setChainId(chainIdToSwitch);
          setNetworkMismatch(false);
        } catch (addError: any) {
          toast.error(`Failed to add network: ${addError.message}`);
        }
      } else {
        toast.error(`Network switch failed: ${switchError.message}`);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    // Reset state
    setAddress(null);
    setChainId(null);
    setNetworkMismatch(false);

    // clear the wallet client ref
    walletClientRef.current = null;

    toast.success('Wallet disconnected');
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: Boolean(address),
        chainId,
        networkMismatch,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('WalletContext is not available');
  return ctx;
}
