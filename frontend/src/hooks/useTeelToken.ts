import { useState, useEffect, useCallback } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { getPublicClient } from '@/lib/viem';
import type { Address } from 'viem';
import { useTransaction } from './useTransaction';
import { CONTRACTS, TEEL_ABI } from '@/constants';
import { CHAINS, type SupportedChain } from '@/configs';
import { useTxContext } from './useTxContext';
import { useWalletContext } from './useWalletContext';

export const useTeelToken = () => {
  const { latestTx, addTx } = useTxContext();
  // Contract address (depends on current chain)
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(
    null
  );
  // User
  const { address, chainId, isConnected, networkMismatch } = useWalletContext();

  // Token info
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [threshold, setThreshold] = useState<bigint>(0n);
  const [balance, setBalance] = useState<bigint>(0n);
  const [paused, setPaused] = useState(false);

  // Only create the transaction hook once the contract exists
  const { hash, isPending, isConfirmed, error, sendTx } = useTransaction(
    contractAddress,
    TEEL_ABI
  );

  // Set contract address based on current chain
  useEffect(() => {
    if (!isConnected || !chainId) return;

    // If the user is on a chain where the contract is not deployed
    if (networkMismatch) {
      console.warn(`Contract not deployed on chain ${chainId}`);
      setContractAddress(null); // Clear any previous contract address
      return;
    }

    const loadContract = async () => {
      const addr = CONTRACTS[chainId]?.TEELTOKEN;
      if (!addr) {
        console.warn(`No TeelToken deployed on chain ${chainId}`);
        return;
      }
      setContractAddress(addr);
    };

    loadContract();
  }, [isConnected, chainId, networkMismatch]);

  // Reset state when switching networks
  useEffect(() => {
    if (!contractAddress) {
      setName('');
      setSymbol('');
      setTotalSupply(0n);
      setThreshold(0n);
      setBalance(0n);
      setPaused(false);
    }
  }, [contractAddress]);

  // Fetch token info
  const fetchTokenInfo = useCallback(async () => {
    if (!address || !contractAddress || networkMismatch || !chainId) return;

    // Ensure chainId is a supported chain
    if (!(chainId in CHAINS)) return;
    const supportedChainId = chainId as SupportedChain;

    const client = getPublicClient(supportedChainId);

    const [n, s, supply, th] = await Promise.all([
      client.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'totalSupply',
      }),
      client.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'threshold',
      }),
    ]);

    setName(n as string);
    setSymbol(s as string);
    setTotalSupply(supply as bigint);
    setThreshold(th as bigint);
  }, [address, contractAddress, networkMismatch, chainId]);

  const fetchBalance = useCallback(async () => {
    if (!address || !contractAddress || networkMismatch || !chainId) return;

    // Ensure chainId is a supported chain
    if (!(chainId in CHAINS)) return;
    const supportedChainId = chainId as SupportedChain;

    const client = getPublicClient(supportedChainId);

    const bal = await client.readContract({
      address: contractAddress,
      abi: TEEL_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    setBalance(bal as bigint);
  }, [address, contractAddress, networkMismatch, chainId]);

  const fetchPausedState = useCallback(async () => {
    if (!contractAddress || networkMismatch || !chainId) return;

    const client = getPublicClient(chainId as SupportedChain);

    const pausedState = await client.readContract({
      address: contractAddress,
      abi: TEEL_ABI,
      functionName: 'paused',
    });

    setPaused(pausedState as boolean);
  }, [contractAddress, networkMismatch, chainId]);

  // Reset old state immediately when network or contract changes
  useEffect(() => {
    setName('');
    setSymbol('');
    setTotalSupply(0n);
    setThreshold(0n);
    setBalance(0n);
    setPaused(false);
  }, [contractAddress, networkMismatch]);

  // Fetch token info only when contractAddress exists and network is correct
  useEffect(() => {
    if (!contractAddress || networkMismatch || !chainId) return;

    const loadTokenData = async () => {
      await fetchTokenInfo();
      await fetchBalance();
      await fetchPausedState();
    };

    loadTokenData();
  }, [
    contractAddress,
    networkMismatch,
    chainId,
    fetchTokenInfo,
    fetchBalance,
    fetchPausedState,
  ]);

  // Whenever a transaction is confirmed, refetch data
  useEffect(() => {
    if (
      !latestTx ||
      !contractAddress ||
      !chainId ||
      !address ||
      networkMismatch
    )
      return;

    // Only refresh if this tx belongs to this contract
    if (latestTx.contract === contractAddress) {
      fetchBalance();
      fetchTokenInfo();
      fetchPausedState();
    }
  }, [
    latestTx,
    contractAddress,
    networkMismatch,
    chainId,
    address,
    fetchBalance,
    fetchPausedState,
    fetchTokenInfo,
  ]);

  // Mint tokens (Owner only)
  const mint = useCallback(
    async (to: Address, amountHuman: string) => {
      if (!contractAddress) {
        return {
          success: false,
          reason: 'Contract not available on this network',
        };
      }
      const amount = parseUnits(amountHuman, 18);

      const result = await sendTx('mint', [to, amount]);

      // Report to global context only if there is a hash
      if (result.hash) {
        addTx({
          hash: result.hash,
          chainId: chainId as SupportedChain,
          contract: contractAddress,
        });
      }

      return result;
    },
    [sendTx, contractAddress, addTx, chainId]
  );

  // Transfer tokens
  const transfer = useCallback(
    async (to: Address, amountHuman: string) => {
      if (!contractAddress) {
        return {
          success: false,
          reason: 'Contract not available on this network',
        };
      }
      const amount = parseUnits(amountHuman, 18);

      const result = await sendTx('transfer', [to, amount]);

      // Report to global context only if there is a hash
      if (result.hash) {
        addTx({
          hash: result.hash,
          chainId: chainId as SupportedChain,
          contract: contractAddress,
        });
      }

      return result;
    },
    [sendTx, contractAddress, addTx, chainId]
  );

  // Pause operations
  const pause = useCallback(async () => {
    if (!contractAddress) {
      return {
        success: false,
        reason: 'Contract not available on this network',
      };
    }
    const result = await sendTx('pauseMinting', []);
    // Report to global context only if there is a hash
    if (result.hash) {
      addTx({
        hash: result.hash,
        chainId: chainId as SupportedChain,
        contract: contractAddress,
      });
    }
    return result;
  }, [sendTx, contractAddress, addTx, chainId]);

  // Unpause operations
  const unpause = useCallback(async () => {
    if (!contractAddress) {
      return {
        success: false,
        reason: 'Contract not available on this network',
      };
    }
    const result = await sendTx('unpauseMinting', []);
    // Report to global context only if there is a hash
    if (result.hash) {
      addTx({
        hash: result.hash,
        chainId: chainId as SupportedChain,
        contract: contractAddress,
      });
    }
    return result;
  }, [sendTx, contractAddress, addTx, chainId]);

  // Human readable values to return to frontend
  const formattedBalance = formatUnits(balance, 18);
  const formattedTotalSupply = formatUnits(totalSupply, 18);
  const formattedThreshold = formatUnits(threshold, 18);

  return {
    // Address
    contractAddress,

    // Chain Id,
    chainId,

    // Token info
    name,
    symbol,
    totalSupply: formattedTotalSupply,
    threshold: formattedThreshold,
    balance: formattedBalance,
    paused,

    // Transactions
    mint,
    transfer,
    pause,
    unpause,
    hash,
    isPending,
    isConfirmed,
    error,
  };
};
