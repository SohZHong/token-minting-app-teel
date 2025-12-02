import { useState, useEffect, useCallback } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { getPublicClient } from '@/lib/viem';
import type { Address } from 'viem';
import { useTransaction } from './useTransaction';
import { CONTRACTS, TEEL_ABI } from '@/constants';
import { useWalletContext } from '@/context/WalletContext';
import { CHAINS, type SupportedChain } from '@/configs/chain';

export const useTeelToken = () => {
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

  // Only create the transaction hook once the contract exists
  const { hash, isPending, isConfirmed, error, sendTx } = useTransaction(
    contractAddress ?? '0x0000000000000000000000000000000000000000',
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
      const addr = CONTRACTS[chainId]?.TEEL_TOKEN;
      if (!addr) {
        console.warn(`No TeelToken deployed on chain ${chainId}`);
        return;
      }
      setContractAddress(addr);
    };

    loadContract();
  }, [isConnected, chainId, networkMismatch]);

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
  }, [address, contractAddress]);

  useEffect(() => {
    fetchTokenInfo();
    fetchBalance();
  }, [fetchTokenInfo, fetchBalance]);

  // Mint tokens (Owner only)
  const mint = useCallback(
    async (to: Address, amountHuman: string) => {
      if (!contractAddress) return;
      const amount = parseUnits(amountHuman, 18);
      await sendTx('mint', [to, amount]);
      fetchTokenInfo();
      fetchBalance();
    },
    [sendTx, fetchTokenInfo, fetchBalance, contractAddress]
  );

  // Transfer tokens
  const transfer = useCallback(
    async (to: Address, amountHuman: string) => {
      if (!contractAddress) return;
      const amount = parseUnits(amountHuman, 18);
      await sendTx('transfer', [to, amount]);
      fetchBalance();
    },
    [sendTx, fetchBalance, contractAddress]
  );

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

    // Transactions
    mint,
    transfer,
    hash,
    isPending,
    isConfirmed,
    error,
  };
};
