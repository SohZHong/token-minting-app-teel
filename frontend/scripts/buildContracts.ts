#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';

/**
 * Usage:
 * bun run scripts/buildContracts.ts <ContractName> <FoundryOutFolder> <NetworkId> <DeployedAddress>
 */
const args = process.argv.slice(2);
if (args.length < 4) {
  console.error(
    'Usage: bun run scripts/buildContracts.ts <ContractName> <FoundryOutFolder> <NetworkId> <DeployedAddress>'
  );
  process.exit(1);
}

const [contractName, foundryOut, networkIdStr, deployedAddress] = args;
const networkId = Number(networkIdStr);

// Paths relative to frontend folder
const frontendSrc = path.join(process.cwd(), 'src');
const abisFolder = path.join(frontendSrc, 'abis'); // ABI output
const contractsJsonFile = path.join(
  frontendSrc,
  'deployments',
  'contracts.json'
); // contracts.json output

// Read artifact
const artifactPath = path.join(
  foundryOut,
  `${contractName}.sol`,
  `${contractName}.json`
);
if (!fs.existsSync(artifactPath)) {
  console.error('Artifact not found:', artifactPath);
  process.exit(1);
}
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));

// Write ABI and create the abis folder if not exist
fs.mkdirSync(abisFolder, { recursive: true });
const abiOutput = path.join(abisFolder, `${contractName}.json`);
fs.writeFileSync(abiOutput, JSON.stringify(artifact.abi, null, 2));
console.log(`ABI written to ${abiOutput}`);

// Update deployed addresses JSON and create the deployments folder if not exist
fs.mkdirSync(path.dirname(contractsJsonFile), { recursive: true });
let contracts: Record<number, Record<string, `0x${string}`>> = {};

if (fs.existsSync(contractsJsonFile)) {
  contracts = JSON.parse(fs.readFileSync(contractsJsonFile, 'utf-8'));
}

if (!contracts[networkId]) {
  contracts[networkId] = {} as Record<string, `0x${string}`>;
}

// Make contract name that work as keys in the json file to all be uppercases
contracts[networkId][contractName.toUpperCase()] =
  deployedAddress as `0x${string}`;

// Write contracts.json
fs.writeFileSync(contractsJsonFile, JSON.stringify(contracts, null, 2));
console.log(`Contracts updated in ${contractsJsonFile}`);
