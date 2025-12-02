# ERC-20 Teel Token Minting DApp

## Overview

This is a take-home project for a simple ERC-20 token minting dApp.  
The app allows users to:

- Deploy or interact with a custom ERC-20 token.
- Mint tokens (owner-only).
- View token balances and total supply.
- Transfer tokens between addresses.
- Pause and unpause token minting.

## Tech Stack

- **Smart Contract:** Solidity, Foundry
- **Frontend:** React (Vite), TailwindCSS, viem
- **Blockchain:** Local Anvil network and Ethereum testnet (Sepolia)
- **Wallet Integration:** MetaMask and other EVM-compatible wallets

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

```sh
forge install
```

### Run Tests

```sh
forge test
```

### Deploy Contract

The deployment script is designed to automatically select the network based on your `.env` configuration.

You **do not need to manually specify an RPC URL** in the command, as the script reads the `NETWORK` environment variable and deploys accordingly:

```sh
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

}
// ... else
```

This allows you to call the deployment command without any changes to deploy on celo alfajores.

> [!IMPORTANT]
> If the network is not defined in `foundry.toml`, the script will default to deploying locally.
