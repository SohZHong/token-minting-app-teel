import { useTeelToken } from '@/hooks/useTeelToken';
import { CHAIN_EXPLORERS } from '@/constants/chain';

export default function TxStatus() {
  const { hash, isPending, isConfirmed, error, chainId } = useTeelToken();

  // Determine explorer URL based on chain ID
  const explorer = chainId ? CHAIN_EXPLORERS[chainId] : null;

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>Transaction Status</h2>

      {isPending && (
        <p className='text-yellow-600'>⏳ Transaction pending...</p>
      )}

      {isConfirmed && (
        <p className='text-green-600'>
          Confirmed!
          <br />
          {explorer ? (
            <a
              href={`${explorer}${hash}`}
              target='_blank'
              className='text-blue-600 underline'
            >
              {hash}
            </a>
          ) : (
            <span className='font-mono text-sm text-gray-600'>
              {hash} (no explorer available on this network)
            </span>
          )}
        </p>
      )}

      {error && <p className='text-red-600'>Error: {error.message}</p>}
    </section>
  );
}
