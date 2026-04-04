import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import { useAuthActions, useAuthState } from '@features/auth';
import type { AuthCredentials } from '@features/auth';

type LocationState = {
  from?: { pathname: string; search?: string };
};

function getRedirectPath(locationState: unknown): string {
  const typedState = locationState as LocationState | null;
  const from = typedState?.from;
  if (!from?.pathname) return '/notes';
  return `${from.pathname}${from.search ?? ''}`;
}

export const AuthPage = (): React.JSX.Element => {
  const [formValues, setFormValues] = useState<AuthCredentials>({
    email: '',
    password: '',
  });

  const [formErrorMessage, setFormErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { isAuthenticated, isAuthReady } = useAuthState();
  const authActions = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToPath = getRedirectPath(location.state);

  async function submitCredentials(
    credentials: AuthCredentials,
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      await authActions.signIn(credentials);
      navigate(redirectToPath, { replace: true });
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'Sign in failed.';
      setFormErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setFormValues((previousFormValues) => ({
      ...previousFormValues,
      email: event.target.value,
    }));
    setFormErrorMessage('');
  }

  function handlePasswordChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setFormValues((previousFormValues) => ({
      ...previousFormValues,
      password: event.target.value,
    }));
    setFormErrorMessage('');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const emailValue = formValues.email.trim();
    const passwordValue = formValues.password.trim();

    if (!emailValue || !passwordValue) {
      setFormErrorMessage('Email and password are required.');
      return;
    }

    void submitCredentials({ email: emailValue, password: passwordValue });
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'grid', gap: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          value={formValues.email}
          onChange={handleEmailChange}
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={formValues.password}
          onChange={handlePasswordChange}
          autoComplete="current-password"
          required
        />

        {formErrorMessage ? (
          <Typography color="error" variant="body2">
            {formErrorMessage}
          </Typography>
        ) : null}

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Continue'}
        </Button>
      </Box>
    </Box>
  );
};
