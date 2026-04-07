import { AppRouter } from './router';
import { AuthProvider } from '@features/auth';

export const App = (): React.JSX.Element => {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </>
  );
};
