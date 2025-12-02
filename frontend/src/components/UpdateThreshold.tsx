import { useState } from 'react';
import { useTeelToken } from '@/hooks/useTeelToken';
import toast from 'react-hot-toast';

export default function UpdateThreshold() {
  const { updateThreshold, symbol } = useTeelToken();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateThreshold = async () => {
    if (!amount) return;

    setIsLoading(true);
    const toastId = toast.loading('Updating threshold...');

    try {
      const result = await updateThreshold(amount);

      // If user rejected the tx in MetaMask
      if (!result.success) {
        toast.error(result.reason, { id: toastId });
        return;
      }

      // Success
      toast.success(result.reason, { id: toastId });
    } catch (err: any) {
      // Unexpected JS errors
      toast.error(`Unexpected error: ${err.message || err}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>
        6. Update Threshold (Owner Only)
      </h2>

      <div className='space-y-3'>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount (${symbol})`}
          className='w-full p-2 border rounded-md focus:ring focus:ring-blue-200'
        />

        <button
          onClick={handleUpdateThreshold}
          disabled={!amount || isLoading} // disable while loading
          className={`w-full py-2 text-white rounded-lg transition
            ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Updating...' : 'Update Threshold'}
        </button>
      </div>
    </section>
  );
}
