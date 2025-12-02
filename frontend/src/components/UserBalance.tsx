import { useTeelToken } from '@/hooks/useTeelToken';

export default function MyBalance() {
  const { balance, symbol } = useTeelToken();

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>3. My Balance</h2>

      <p className='text-lg font-medium'>
        {balance} <span className='text-gray-600'>{symbol}</span>
      </p>
    </section>
  );
}
