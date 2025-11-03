import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/slice/authSlice';

// Define the root reducer shape
const rootReducer = {
  auth: authReducer,
};

// Create the makeStore function without preloadedState type to avoid circular reference
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
