import Box from '@mui/material/Box';

import { LoginForm } from './components/login-form';
import { LoginHeader } from './components/login-header';

export default function MobileLoginScreen() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <LoginHeader />
      <LoginForm />
    </Box>
  );
}
