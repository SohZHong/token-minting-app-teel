'use client';

import { useState, useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { getWalletClient, publicClient } from '@/lib/viem';
import type { TxState } from '@/types/transaction';

// Generalized transaction hook for interacting with contracts
export const useTransaction = (contractAddress: `0x${string}`, abi: any) => {
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
    async (
      functionName: string,
      args: any[] = [],
      value?: bigint
    ): Promise<TxState> => {
      try {
        setPending();

        // Get address from wallet client
        const walletClient = getWalletClient();
        if (!walletClient) throw new Error('No wallet detected');

        const [account] = await walletClient.requestAddresses();
        // Function data
        const data = encodeFunctionData({
          abi,
          functionName,
          args,
        });

        // Send transaction to obtain hash
        const hash = await walletClient!.sendTransaction({
          account,
          to: contractAddress,
          data,
          value: value ?? 0n,
        });

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setConfirmed(hash);

        return { hash, isPending: false, isConfirmed: true, error: null };
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [contractAddress, abi]
  );

  return { ...state, sendTx };
};
