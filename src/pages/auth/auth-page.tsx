import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import { useAuthState, SignInForm } from '@features/auth';

import { getRedirectPath } from '@features/auth';

export const AuthPage = (): React.JSX.Element => {
  const { isAuthenticated, isAuthReady } = useAuthState();

  const navigate = useNavigate();
  const location = useLocation();

  const redirectToPath = getRedirectPath(location.state);

  function handleSignedIn(): void {
    navigate(redirectToPath, { replace: true });
  }

  if (!isAuthReady) {
    return (
      <Box
        sx={{
          maxWidth: 420,
          margin: '64px auto',
          padding: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectToPath} replace />;
  }

  return (
    <Box sx={{ maxWidth: 420, margin: '64px auto', padding: 2 }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: 2 }}>
        Sign in
      </Typography>

      <SignInForm onSignedIn={handleSignedIn} />
    </Box>
  );
};
