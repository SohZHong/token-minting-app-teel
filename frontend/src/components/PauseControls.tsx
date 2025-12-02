import { useState } from 'react';
import { useTeelToken } from '@/hooks/useTeelToken';

export default function PauseControls() {
  const { paused, pause, unpause } = useTeelToken();
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isUnpauseLoading, setIsUnpauseLoading] = useState(false);

  const handlePause = async () => {
    setIsPauseLoading(true);
    try {
      await pause();
    } finally {
      setIsPauseLoading(false);
    }
  };

  const handleUnpause = async () => {
    setIsUnpauseLoading(true);
    try {
      await unpause();
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
