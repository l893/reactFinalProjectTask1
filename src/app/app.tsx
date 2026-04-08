import { AppRouter } from './router';
import { AuthProvider } from '@features/auth';
import { useEffect } from 'react';
import { useOnlineStatus } from '@shared/hooks/use-online-status';
import { setFirestoreNetworkEnabled } from '@shared/lib/firebase/firebase-firestore';

export const App = (): React.JSX.Element => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    void setFirestoreNetworkEnabled(isOnline);
  }, [isOnline]);

  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
};
