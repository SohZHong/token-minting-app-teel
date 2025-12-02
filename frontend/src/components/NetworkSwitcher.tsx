'use client';

import { useWalletContext } from '@/context/WalletContext';
import { CHAINS, type SupportedChain } from '@/configs/chain';

export default function NetworkSwitcher() {
  const { chainId, switchNetwork } = useWalletContext();

  const currentChainName = chainId
    ? CHAINS[chainId as keyof typeof CHAINS]?.name
    : 'Not connected';

  const supportedChains = Object.entries(CHAINS) as [
    string,
    { name: string }
  ][];

  return (
    <div className='flex justify-between items-center p-3 mb-4 rounded-lg border'>
      <span>
        <strong>Current Network:</strong> {currentChainName}
      </span>

      {switchNetwork && (
        <select
          onChange={(e) =>
            switchNetwork(Number(e.target.value) as SupportedChain)
          }
          className='ml-2 px-3 py-2 border rounded-lg'
          value=''
        >
          <option value='' disabled>
            Switch to a supported network
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
