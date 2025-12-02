# ERC-20 Teel Token Minting DApp

## Overview

This is a take-home project for a simple ERC-20 token minting dApp.  
The app allows users to:

- Deploy or interact with a custom ERC-20 token.
- Mint tokens (owner-only).
- View token balances and total supply.
- Transfer tokens between addresses.
- Pause and unpause token minting.

The project is structured as a monorepo with `contract/` for smart contracts and `frontend/` for the web app.

## Tech Stack & Main Libraries

- **Smart Contracts**

  - Solidity (v0.8.20)
  - Foundry (forge, forge-std\_
  - Oppenzeppelin

- **Frontend**

  - React (Vite)
  - TailwindCSS for styling
  - viem for blockchain interaction
  - MetaMask / EVM wallet support

- **Blockchain / Networks**
  - Local Anvil (Hardhat/Foundry)
  - Sepolia Testnet
  - Easily configurable for additional networks

## Repository Structure

```bash
token-minting-app-teel/
├─ contract/ # Foundry smart contract project
├─ frontend/ # Vite React frontend
└─ README.md
```

## Smart Contract Setup

### Environment Variables

Create a `.env` file inside `contract/`:

```bash
export NETWORK="local" # or sepolia
export SEPOLIA_RPC_URL=<your_sepolia_rpc_url>
export PRIVATE_KEY=<your_wallet_private_key>
export ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

### Install Dependencies

Ensure Foundry is installed. Then in `contract/`:

```bash
cd contract
forge install
```

### Run Tests

```bash
forge test
```

### Deploy Contract

The deployment script is designed to automatically select the network based on your `.env` configuration.

You **do not need to manually specify an RPC URL** in the command, as the script reads the `NETWORK` environment variable and deploys accordingly:

```bash
source .env
forge script script/TeelToken.s.sol --private-key $PRIVATE_KEY --verify --broadcast

```

The script logic is as follows:

```solidity
string memory network = vm.envString("NETWORK");

if (keccak256(bytes(network)) == keccak256(bytes("sepolia"))) {
    vm.createSelectFork("sepolia");
    console.log("Deploying to Sepolia testnet...");
} else {
    vm.createSelectFork("local");
    console.log("No network specified in env. Deploying locally...");
}
```

After broadcasting, it deploys the TeelToken contract and prints the deployed address.

#### Adding a New Network

If you want to deploy to a network other than `Sepolia` or `local`, you will need to:

> [!NOTE]
> I will be using `celo-alfajores` testnet as example

1. Add the RPC URL in `.env`:

```bash
export ALFAJORES_RPC_URL="https://celo-alfajores.drpc.org"
```

2. Update `foundry.toml` to include the new network under `[rpc_endpoints]` and `[etherscan]`:

```toml
[rpc_endpoints]
alfajores = "${ALFAJORES_RPC_URL}"

[etherscan]
alfajores = { key = "${ETHERSCAN_API_KEY}", chain = 44787 }
```

3. Set `NETWORK` in `.env` to the new network name:

```bash
export NETWORK="alfajores"
```

This allows the deployment script to pick up the new network automatically.

4. Add new network fork into the deployment script `TeelToken.s.sol`:

```solidity
if (keccak256(bytes(network)) == keccak256(bytes("sepolia"))) {
    vm.createSelectFork("sepolia");
    console.log("Deploying to Sepolia testnet...");
}
// Add on alfajores here with else if
else if (keccak256(bytes(network)) == keccak256(bytes("alfajores"))){
    vm.createSelectFork("alfajores");
    console.log("Deploying to Alfajores testnet...");
}
// ... else
```

This allows you to call the deployment command without any changes to deploy on celo alfajores.

> [!IMPORTANT]
> If the network is not defined in `foundry.toml`, the script will default to deploying locally.
> Remember to reload `.env` using `source .env` command.

## Frontend Setup

The frontend is a simple React app built with Vite (React) and styled with TailwindCSS. It connects to the deployed `TeelToken` contract using `viem`.

### Install Dependencies

This project uses `bun` for package management.

```bash
cd frontend
bun install
```

### Connecting Frontend to Deployed Contract

You do **not** need to manually configure the contract address or ABI.  
A helper script `scripts/buildContracts.ts` in the frontend folder will handle this automatically.

#### Usage

```bash
bun run scripts/buildContracts.ts <ContractName> <FoundryOutFolder> <NetworkId> <DeployedAddress>
```

**Example**:

```bash
bun run scripts/buildContracts.ts TeelToken ../contract/out 11155111 0xc5eab97d5ea9fa16a32b937516
```

This script will automatically:

1. **Generate the ABI**

   - Writes `src/abis/TeelToken.json` from the compiled artifact in the Foundry `out` folder.

2. **Update deployed addresses**
   - Modifies `src/deployments/contracts.json` to include the deployed address for the given network ID.
   - If the network or contract entry does not exist, it will be created; if it exists, it will be updated.

**Sample `contracts.json` after running the script:**

```json
{
  "31337": {
    "TEELTOKEN": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  },
  "11155111": {
    "TEELTOKEN": "0xc5EAB97d5Ea9fA16A32b9375169022488a8AE5Cf"
  }
}
```

After running this script, the frontend is fully configured to interact with the deployed contract and ABI so no manual edits are required.

### Frontend Network Configuration

The frontend uses the following files to map supported networks and their explorers:

1. **`frontend/src/configs/chain.ts`**  
   Maps network IDs to Viem chain objects:

   ```ts
   import { sepolia, anvil } from 'viem/chains';

   export const CHAINS = {
     11155111: sepolia,
     31337: anvil,
   };

   export type SupportedChain = keyof typeof CHAINS;
   ```

2. **`frontend/src/constants/chain.ts`**  
    Maps network IDs to their corresponding blockchain explorers:

   ```ts
   export const CHAIN_EXPLORERS: Record<number, string | null> = {
     11155111: 'https://sepolia.etherscan.io/tx/', // Sepolia
     31337: null, // Localhost (no explorer)
   };
   ```

#### Adding a New Network

If you deploy your contract to a new chain, you must update **both** files:

> [!NOTE]
> Once again, I will be using `celo-alfajores` testnet as example

1. Add the new network to `CHAINS` in `configs/chain.ts` using the Viem chain object for that network (or define a custom chain object).

```ts
import { sepolia, anvil, alfajores } from 'viem/chains';

export const CHAINS = {
  11155111: sepolia,
  31337: anvil,
  44787: alfajores, // Celo Alfajores Addon
};
```

2. Add the corresponding explorer URL in `CHAIN_EXPLORERS` in `constants/chain.ts`:

```ts
export const CHAIN_EXPLORERS: Record<number, string | null> = {
  11155111: 'https://sepolia.etherscan.io/tx/',
  31337: null,
  44787: 'https://alfajores.celoscan.io/tx/', // Alfajores explorer
};
```

> [!NOTE]
> Both mappings are required for the frontend to display transaction links and interact properly with the new network.

### Running the project

After everything is setup properly, you can run the project using:

```bash
bun run dev
```

And access http://localhost:5173
