import { useTeelToken } from '@/hooks/useTeelToken';
import { useWalletContext } from '@/context/WalletContext';

export default function TokenInfo() {
  const { name, symbol, totalSupply, threshold } = useTeelToken();
  const { networkMismatch } = useWalletContext();

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>2. Token Info</h2>

      {networkMismatch ? (
        <p className='my-2 text-red-600 font-medium text-center'>
          You are on the wrong network! Please switch to a supported network.
        </p>
      ) : (
        <div className='space-y-1 mb-4'>
          <p>
            Name: <span className='font-medium'>{name}</span>
          </p>
          <p>
            Symbol: <span className='font-medium'>{symbol}</span>
          </p>
          <p>
            Total Supply: <span className='font-medium'>{totalSupply}</span>
          </p>
          <p>
            Threshold: <span className='font-medium'>{threshold}</span>
          </p>
        </div>
      )}
    </section>
  );
}
