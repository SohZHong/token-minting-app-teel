import { createContext } from 'react';
import type { WalletContextType } from '@/types/context';

export const WalletContext = createContext<WalletContextType | null>(null);
