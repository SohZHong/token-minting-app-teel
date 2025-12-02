import { useTeelToken } from '@/hooks/useTeelToken';
import { CHAIN_EXPLORERS } from '@/constants/chain';
import { useTxContext } from '@/hooks/useTxContext';

export default function TxStatus() {
  const { chainId } = useTeelToken();
  const { latestTx } = useTxContext();

  if (!latestTx) return null; // no transaction to show

  // Determine explorer URL based on chainId from TeelToken hook
  const explorer = chainId ? CHAIN_EXPLORERS[chainId] : null;

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>Transaction Status</h2>

      <p className='text-green-600'>
        Latest Transaction Confirmed
        <br />
        {explorer ? (
          <a
            href={`${explorer}${latestTx.hash}`}
            target='_blank'
            className='text-blue-600 underline'
          >
            {latestTx.hash}
          </a>
        ) : (
          <span className='font-mono text-sm text-gray-600'>
            {latestTx.hash} (no explorer available on this network)
          </span>
        )}
      </p>

      <p>Contract: {latestTx.contract}</p>
      <p>Chain: {latestTx.chainId}</p>
    </section>
  );
}
