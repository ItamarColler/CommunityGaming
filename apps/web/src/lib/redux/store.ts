import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authReducer from '@/features/auth/slice/authSlice';
import onboardingReducer from '@/features/onboarding/slice/onboardingSlice';

// Define the root reducer shape
const rootReducer = {
  // API reducer for RTK Query
  [baseApi.reducerPath]: baseApi.reducer,

  // Feature reducers
  auth: authReducer,
  onboarding: onboardingReducer,
};

// Create the makeStore function without preloadedState type to avoid circular reference
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // Enable refetchOnFocus/refetchOnReconnect behaviors
  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
