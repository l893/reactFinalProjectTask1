import { AppRouter } from './router';
import { AuthProvider } from '@features/auth';

import styles from './app.module.css';

export const App = (): React.JSX.Element => {
  return (
    <>
      <div className={styles.app}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </div>
    </>
  );
};
