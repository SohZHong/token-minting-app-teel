import { useState } from 'react';
import { useTeelToken } from '@/hooks/useTeelToken';
import toast from 'react-hot-toast';

export default function PauseControls() {
  const { paused, pause, unpause } = useTeelToken();
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isUnpauseLoading, setIsUnpauseLoading] = useState(false);

  const handlePause = async () => {
    setIsPauseLoading(true);
    const toastId = toast.loading('Pausing...');
    try {
      await pause();
      toast.success('Contract paused!', { id: toastId });
    } catch (err: any) {
      toast.error(`Pause failed: ${err.message || err}`, { id: toastId });
    } finally {
      setIsPauseLoading(false);
    }
  };

  const handleUnpause = async () => {
    setIsUnpauseLoading(true);
    const toastId = toast.loading('Unpausing...');
    try {
      await unpause();
      toast.success('Contract unpaused!', { id: toastId });
    } catch (err: any) {
      toast.error(`Unpause failed: ${err.message || err}`, { id: toastId });
    } finally {
      setIsUnpauseLoading(false);
    }
  };

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>6. Pause / Unpause</h2>
      <p>Status: {paused ? 'Paused' : 'Active'}</p>
      <div className='mt-3 flex gap-3 justify-center'>
        <button
          onClick={handlePause}
          disabled={paused || isPauseLoading}
          className='px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400'
        >
          {isPauseLoading ? 'Processing...' : 'Pause'}
        </button>
        <button
          onClick={handleUnpause}
          disabled={!paused || isUnpauseLoading}
          className='px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400'
        >
          {isUnpauseLoading ? 'Processing...' : 'Unpause'}
        </button>
      </div>
    </section>
  );
}
