import { CHAINS, type SupportedChain } from '@/configs';
import { useWalletContext } from '@/hooks/useWalletContext';
import toast from 'react-hot-toast';

export default function NetworkSwitcher() {
  const { chainId, switchNetwork } = useWalletContext();

  // Get current chain using id as key
  const currentChainName = chainId
    ? CHAINS[chainId as keyof typeof CHAINS]?.name
    : 'Not connected';

  // Get the supported chains for select
  const supportedChains = Object.entries(CHAINS) as [
    string,
    { name: string }
  ][];

  const handleSwitch = async (chain: SupportedChain) => {
    const toastId = toast.loading('Switching network...');

    try {
      await switchNetwork?.(chain);
      toast.success(`Switched to ${CHAINS[chain].name}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to switch: ${err?.message || err}`, { id: toastId });
    }
  };

  return (
    <div className='flex justify-between items-center p-3 mb-4 rounded-lg border'>
      <span>
        <strong>Current Network:</strong> {currentChainName}
      </span>

      {switchNetwork && (
        <select
          onChange={(e) =>
            handleSwitch(Number(e.target.value) as SupportedChain)
          }
          className='ml-2 px-3 py-2 border rounded-lg'
          value=''
        >
          <option value='' disabled>
            Switch network
          </option>
          {supportedChains.map(([id, chain]) => (
            <option key={id} value={id}>
              {chain.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
