import { useState } from 'react';
import { useTeelToken } from '@/hooks/useTeelToken';
import type { Address } from 'viem';

export default function TransferTokens() {
  const { transfer, symbol } = useTeelToken();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      await transfer(to as Address, amount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>5. Transfer Tokens</h2>

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
          placeholder={`Amount (${symbol})`}
          className='w-full p-2 border rounded-md focus:ring focus:ring-blue-200'
        />

        <button
          onClick={handleTransfer}
          disabled={!to || !amount || isLoading} // disable while loading
          className={`w-full py-2 text-white rounded-lg transition
            ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Transferring...' : 'Transfer Tokens'}
        </button>
      </div>
    </section>
  );
}
