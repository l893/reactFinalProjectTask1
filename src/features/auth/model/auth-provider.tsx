import { useCallback, useEffect, useMemo, useState } from 'react';

import { AuthActionsContext, AuthStateContext } from './auth-context';
import type {
  AuthActions,
  AuthCredentials,
  AuthState,
  AuthUser,
} from './auth.types';
import {
  signInWithEmail,
  signOutFromFirebase,
  subscribeToAuthState,
} from '@shared/lib/firebase/firebase-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps): React.JSX.Element => {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    isAuthReady: false,
    user: null,
  }));

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      const user: AuthUser | null = firebaseUser
        ? { uid: firebaseUser.uid, email: firebaseUser.email }
        : null;

      setAuthState({
        user,
        isAuthenticated: Boolean(firebaseUser),
        isAuthReady: true,
      });
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback<AuthActions['signIn']>(
    async (credentials: AuthCredentials) => {
      await signInWithEmail(credentials);
    },
    [],
  );

  const signOut = useCallback<AuthActions['signOut']>(async () => {
    await signOutFromFirebase();
  }, []);

  const authActions: AuthActions = useMemo(() => {
    return { signIn, signOut };
  }, [signIn, signOut]);

  return (
    <AuthStateContext value={authState}>
      <AuthActionsContext value={authActions}>{children}</AuthActionsContext>
    </AuthStateContext>
  );
};
