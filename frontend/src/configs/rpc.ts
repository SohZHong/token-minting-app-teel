export const RPC_URLS = {
  sepolia: import.meta.env.VITE_SEPOLIA_RPC || 'https://0xrpc.io/sep',
  localhost: import.meta.env.VITE_LOCALHOST_RPC || 'http://127.0.0.1:8545',
};

export const DEFAULT_CHAIN = 'sepolia';
