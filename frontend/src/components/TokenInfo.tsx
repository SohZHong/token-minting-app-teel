import { useTeelToken } from '@/hooks/useTeelToken';

export default function TokenInfo() {
  const { name, symbol, totalSupply, threshold } = useTeelToken();

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>2. Token Info</h2>

      <div className='space-y-1'>
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
    </section>
  );
}
