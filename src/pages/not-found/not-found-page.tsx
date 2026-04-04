import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const NotFoundPage = (): React.JSX.Element => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" component="h1">
        Page not found
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 1 }}>
        Go to <Link to="/notes">Notes</Link>
      </Typography>
    </Box>
  );
};
