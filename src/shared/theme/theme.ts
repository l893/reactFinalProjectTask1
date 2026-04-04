import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    h1: {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontWeight: 400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Georgia';
          src:
            url('/fonts/Georgia/Georgia-Italic.woff2') format('woff2'),
            url('/fonts/Georgia/Georgia-Italic.woff') format('woff'),
            url('/fonts/Georgia/Georgia-Italic.ttf') format('truetype');
          font-weight: 400;
          font-style: italic;
          font-display: swap;
        }

        h1,
        h1.MuiTypography-root {
          font-family: 'Georgia', serif;
          font-style: italic;
          font-weight: 400;
        }
      `,
    },
  },
});
