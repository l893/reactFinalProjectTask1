import type { ErrorInfo } from 'react';
import { Component } from 'react';
import { Button, Typography } from '@mui/material';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, errorMessage };
  }

  public override componentDidCatch(
    error: unknown,
    errorInfo: ErrorInfo,
  ): void {
    console.error('[ErrorBoundary] Unhandled error:', error, errorInfo);
  }

  private handleReloadClick = (): void => {
    window.location.reload();
  };

  public override render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <Typography variant="h5" component="h1" sx={{ marginBottom: 1 }}>
          Something went wrong
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 2 }}
        >
          {this.state.errorMessage}
        </Typography>
        <Button variant="contained" onClick={this.handleReloadClick}>
          Reload
        </Button>
      </div>
    );
  }
}
