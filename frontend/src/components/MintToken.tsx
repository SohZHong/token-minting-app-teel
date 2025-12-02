import { useState } from 'react';
import { useTeelToken } from '@/hooks/useTeelToken';
import type { Address } from 'viem';
import toast from 'react-hot-toast';

export default function MintTokens() {
  const { mint, symbol } = useTeelToken();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    if (!to || !amount) return;

    setIsLoading(true);
    const toastId = toast.loading('Minting tokens...');

    try {
      await mint(to as Address, amount);
      toast.success('Tokens minted successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(`Mint failed: ${err.message || err}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>
        4. Mint Tokens (Owner Only)
      </h2>

      <div className='space-y-3'>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder='Recipient address'
          className='w-full p-2 border rounded-md focus:ring focus:ring-blue-200'
        />

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount to mint (${symbol})`}
          className='w-full p-2 border rounded-md focus:ring focus:ring-blue-200'
        />

        <button
          onClick={handleMint}
          disabled={!to || !amount || isLoading} // disable while loading
          className={`w-full py-2 text-white rounded-lg transition
            ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isLoading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </div>
    </section>
  );
}
