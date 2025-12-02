import { createContext } from 'react';
import type { TxContextType } from '@/types/context';

export const TxContext = createContext<TxContextType | undefined>(undefined);
