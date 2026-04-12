import { createContext, use } from 'react';

import type { AuthActions, AuthState } from './auth.types';

export const AuthStateContext = createContext<AuthState | undefined>(undefined);
AuthStateContext.displayName = 'AuthStateContext';

export const AuthActionsContext = createContext<AuthActions | undefined>(
  undefined,
);
AuthActionsContext.displayName = 'AuthActionsContext';

export function useAuthState(): AuthState {
  const authState = use(AuthStateContext);

  if (!authState) {
    throw new Error('useAuthState must be used within <AuthProvider>.');
  }

  return authState;
}

export function useAuthActions(): AuthActions {
  const authActions = use(AuthActionsContext);

  if (!authActions) {
    throw new Error('useAuthActions must be used within <AuthProvider>.');
  }

  return authActions;
}
