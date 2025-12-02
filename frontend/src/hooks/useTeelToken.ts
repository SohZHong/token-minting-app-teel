import { useState, useEffect, useCallback } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { publicClient } from '@/lib/viem';
import type { Address } from 'viem';
import { useTransaction } from './useTransaction';
import { CONTRACTS, TEEL_ABI } from '@/constants';
import { useWallet } from './useWallet';

export const useTeelToken = () => {
  // Contract address (depends on current chain)
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(
    null
  );
  // Chain Id
  const [chainId, setChainId] = useState<number | null>(null);

  // User
  const { address, isConnected } = useWallet();

  // Token info
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [threshold, setThreshold] = useState<bigint>(0n);
  const [balance, setBalance] = useState<bigint>(0n);

  // Transaction hook
  const { hash, isPending, isConfirmed, error, sendTx } = useTransaction(
    contractAddress ?? '0x0000000000000000000000000000000000000000',
    TEEL_ABI
  );

  // Set contract address based on current chain
  useEffect(() => {
    // Set contract address only after connection
    if (!isConnected) return;
    const fetchContractAddress = async () => {
      const chainId = await publicClient.getChainId();
      setChainId(chainId);
      const addr = CONTRACTS[chainId]?.TEEL_TOKEN;
      if (!addr) throw new Error(`No TEEL_TOKEN deployed on chain ${chainId}`);
      setContractAddress(addr);
    };
    fetchContractAddress();
  }, [isConnected]);

  // Fetch token info
  const fetchTokenInfo = useCallback(async () => {
    if (!address || !contractAddress) return;
    // Read all token information from contract 1 by 1
    const [n, s, supply, th] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: TEEL_ABI,
        functionName: 'threshold',
      }),
    ]);
    setName(n as string);
    setSymbol(s as string);
    setTotalSupply(supply as bigint);
    setThreshold(th as bigint);
  }, [contractAddress]);

  const fetchBalance = useCallback(async () => {
    if (!contractAddress) return;
    const bal = await publicClient.readContract({
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
