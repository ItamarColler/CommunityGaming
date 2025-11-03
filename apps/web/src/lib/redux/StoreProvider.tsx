'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './store';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Store Provider for Next.js App Router
 * Creates a new store instance per request to avoid state sharing between users
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore>();

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
