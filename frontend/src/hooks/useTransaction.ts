import { useState, useCallback, useRef, useEffect } from 'react';
import { encodeFunctionData, type WalletClient } from 'viem';
import { getPublicClient, getWalletClient } from '@/lib/viem';
import type { TxState } from '@/types/transaction';
import { useWalletContext } from '@/context/WalletContext';
import type { SupportedChain } from '@/configs/chain';
import { CHAINS } from '@/configs/chain';
import { useTxContext } from '@/context/TxContext';

const ZERO = '0x0000000000000000000000000000000000000000';

// Generalized transaction hook for interacting with contracts
export const useTransaction = (
  contractAddress: `0x${string}` | null,
  abi: any
) => {
  const { addTx } = useTxContext();
  const { chainId, networkMismatch } = useWalletContext();

  // Store wallet client in a ref to avoid multiple calls
  const walletClientRef = useRef<WalletClient>(null);

  const [state, setState] = useState<TxState>({
    hash: undefined,
    isPending: false,
    isConfirmed: false,
    error: null,
  });

  // Rerender state when contract or network changes
  useEffect(() => {
    setState({
      hash: undefined,
      isPending: false,
      isConfirmed: false,
      error: null,
    });
  }, [contractAddress, chainId, networkMismatch]);

  // Helper to update state for pending transactions
  const setPending = () =>
    setState({
      hash: undefined,
      isPending: true,
      isConfirmed: false,
      error: null,
    });

  // Send a single transaction to the contract
  const sendTx = useCallback(
    async (functionName: string, args: any[] = [], value?: bigint) => {
      if (!chainId) throw new Error('Wallet not connected');
      if (networkMismatch)
        throw new Error('Wrong network: cannot send transaction');
      if (!contractAddress || contractAddress === ZERO)
        throw new Error('Contract unavailable on this network');

      try {
        setPending();

        // Parse chainId
        const supportedChainId = chainId as SupportedChain;

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
        let hash: `0x${string}`;
        try {
          hash = await walletClient.sendTransaction({
            account,
            to: contractAddress,
            data,
            value: value ?? 0n,
            chain: chainObj,
          });
        } catch (err: any) {
          // User rejected transaction
          if (err?.code === 4001)
            return {
              success: false,
              reason: 'User rejected transaction',
              error: err,
            };

          return {
            success: false,
            reason: err?.message || 'Failed to send transaction',
            error: err,
          };
        }

        // Add to global Tx context
        addTx({ hash, chainId: supportedChainId, contract: contractAddress });

        // Wait for confirmation
        const client = getPublicClient(supportedChainId);
        try {
          const receipt = await client.waitForTransactionReceipt({
            hash,
          });

          // If the receipt has status: "reverted"
          if (receipt.status === 'reverted') {
            return {
              success: false,
              hash,
              reason: 'Transaction reverted on-chain',
              error: receipt,
            };
          }
        } catch (err: any) {
          // Try extracting a readable revert reason
          const reason =
            err?.shortMessage ||
            err?.details ||
            err?.message ||
            'Transaction failed on-chain';

          return { success: false, hash, reason, error: err };
        }
        // Success
        setState({ hash, isPending: false, isConfirmed: true, error: null });
        return { success: true, hash, reason: 'Transaction confirmed!' };
      } catch (err: any) {
        // Unknown internal error
        const msg =
          err?.shortMessage ||
          err?.details ||
          err?.message ||
          'Unexpected transaction error';

        setState((s) => ({ ...s, isPending: false, error: err }));
        return { success: false, reason: msg, error: err };
      }
    },
    [abi, contractAddress, chainId, networkMismatch, addTx]
  );
  return { ...state, sendTx };
};
