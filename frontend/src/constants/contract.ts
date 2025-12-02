import contractsJson from '@/deployments/contracts.json';

export const CONTRACTS: Record<number, { TEELTOKEN: `0x${string}` }> =
  contractsJson as unknown as Record<number, { TEELTOKEN: `0x${string}` }>;
