import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

import type { AuthCredentials } from '../model/auth.types';
import { useAuthActions } from '../model/auth-context';
import { useOnlineStatus } from '@shared/hooks/use-online-status';
import { getErrorMessage } from '@shared/lib/type-guards/get-error-message';

interface SignInFormProps {
  onSignedIn: () => void;
}

export const SignInForm = (props: SignInFormProps): React.JSX.Element => {
  const { onSignedIn } = props;

  const [formValues, setFormValues] = useState<AuthCredentials>({
    email: '',
    password: '',
  });
  const [formErrorMessage, setFormErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const authActions = useAuthActions();
  const isOnline = useOnlineStatus();

  async function submitCredentials(
    credentials: AuthCredentials,
  ): Promise<void> {
    try {
      setIsSubmitting(true);
      setFormErrorMessage('');
      await authActions.signIn(credentials);
      onSignedIn();
    } catch (unknownError) {
      setFormErrorMessage(getErrorMessage(unknownError, 'Sign in failed.'));
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

    if (!isOnline) {
      setFormErrorMessage(
        'You are offline. Sign in requires an internet connection.',
      );
      return;
    }

    const emailValue = formValues.email.trim();
    const passwordValue = formValues.password.trim();

    if (!emailValue || !passwordValue) {
      setFormErrorMessage('Email and password are required.');
      return;
    }

    void submitCredentials({ email: emailValue, password: passwordValue });
  }

  return (
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

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting || !isOnline}
      >
        {isSubmitting ? 'Signing in...' : 'Continue'}
      </Button>

      {!isOnline ? (
        <Typography variant="caption" color="text.secondary">
          Offline mode: authentication is unavailable.
        </Typography>
      ) : null}
    </Box>
  );
};
