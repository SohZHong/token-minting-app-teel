import WalletConnection from '@/components/WalletConnection';
import TokenInfo from '@/components/TokenInfo';
import UserBalance from '@/components/UserBalance';
import MintToken from '@/components/MintToken';
import TransferToken from '@/components/TransferToken';
import TxStatus from '@/components/TxStatus';
import NetworkSwitcher from '@/components/NetworkSwitcher';
import PauseControls from '@/components/PauseControls';
import UpdateThreshold from '@/components/UpdateThreshold';

export default function Dashboard() {
  return (
    <div className='mx-auto max-w-xl p-6 space-y-8'>
      <h1 className='text-3xl font-bold text-center'>TeelToken Dashboard</h1>

      <WalletConnection />
      <NetworkSwitcher />
      <TokenInfo />
      <UserBalance />
      <MintToken />
      <TransferToken />
      <UpdateThreshold />
      <PauseControls />
      <TxStatus />
    </div>
  );
}
