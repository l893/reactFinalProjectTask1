export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
}

export interface AuthActions {
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  user: AuthUser | null;
}
