import { useWalletContext } from '@/context/WalletContext';

export default function WalletConnection() {
  const { connect, address, isConnected } = useWalletContext();

  return (
    <section className='p-4 rounded-lg border shadow-sm'>
      <h2 className='text-xl font-semibold mb-3'>1. Wallet Connection</h2>

      {!isConnected ? (
        <button
          onClick={connect}
          className='w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className='text-gray-600'>Connected:</p>
          <p className='font-mono mt-1 break-all'>{address}</p>
        </div>
      )}
    </section>
  );
}
