import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthState } from './auth-context';

export const RequireAuth = (): React.JSX.Element => {
  const { isAuthenticated } = useAuthState();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
