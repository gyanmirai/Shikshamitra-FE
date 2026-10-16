'use client';

import { useDispatch } from 'react-redux';
import { signOut } from 'next-auth/react';
import { retrySessionInitialization } from 'src/redux/auth/authSlice';
import { Alert, Stack, Button, Container, AlertTitle } from '@mui/material';

export default function SessionInitializationError({ message }: { message: string }) {
  const dispatch = useDispatch();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
      <Stack spacing={2}>
        <Alert severity="error">
          <AlertTitle>Account access could not be verified</AlertTitle>
          {message}
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" onClick={() => dispatch(retrySessionInitialization())}>
            Try again
          </Button>
          <Button variant="outlined" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
