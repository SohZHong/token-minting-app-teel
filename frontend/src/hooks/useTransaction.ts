'use client';

import { useState, useCallback, useRef } from 'react';
import { encodeFunctionData, type Abi, type WalletClient } from 'viem';
import { getPublicClient, getWalletClient } from '@/lib/viem';
import type { TxState } from '@/types/transaction';
import { useWalletContext } from '@/context/WalletContext';
import type { SupportedChain } from '@/configs/chain';
import { CHAINS } from '@/configs/chain';

// Generalized transaction hook for interacting with contracts
export const useTransaction = (contractAddress: `0x${string}`, abi: any) => {
  const { chainId, networkMismatch } = useWalletContext();

  // Store wallet client in a ref to avoid multiple calls
  const walletClientRef = useRef<WalletClient>(null);

  const [state, setState] = useState<TxState>({
    hash: undefined,
    isPending: false,
    isConfirmed: false,
    error: null,
  });

  // Helper to update state for pending transactions
  const setPending = () =>
    setState({
      hash: undefined,
      isPending: true,
      isConfirmed: false,
      error: null,
    });

  // Helper to update state for confirmed transactions
  const setConfirmed = (hash: `0x${string}`) =>
    setState({ hash, isPending: false, isConfirmed: true, error: null });

  // Helper to update state for errors
  const setError = (err: Error) =>
    setState((prev) => ({ ...prev, isPending: false, error: err }));

  // Send a single transaction to the contract
  const sendTx = useCallback(
    async (functionName: string, args: any[] = [], value?: bigint) => {
      if (!chainId) throw new Error('Wallet not connected');
      if (networkMismatch)
        throw new Error('Wrong network: cannot send transaction');
      if (!contractAddress) throw new Error('Contract address not set');

      try {
        setPending();

        // Initialize wallet client only once
        if (!walletClientRef.current) {
          const client = getWalletClient();
          if (!client) throw new Error('Wallet not found');
          walletClientRef.current = client;
        }
        const walletClient = walletClientRef.current;

        const [account] = await walletClient.requestAddresses();

        // Encode the function call
        const data = encodeFunctionData({ abi, functionName, args });

        // Get chain object
        const chainObj = CHAINS[chainId as keyof typeof CHAINS];

        // Send transaction
        const hash = await walletClient.sendTransaction({
          account,
          to: contractAddress,
          data,
          value: value ?? 0n,
          chain: chainObj,
        });

        // Wait for confirmation
        const client = getPublicClient(chainId as SupportedChain);
        await client.waitForTransactionReceipt({ hash });

        setConfirmed(hash);

        return { hash, isPending: false, isConfirmed: true, error: null };
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [abi, contractAddress, chainId, networkMismatch]
  );

  return { ...state, sendTx };
};
