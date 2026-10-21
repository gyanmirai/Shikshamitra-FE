'use client';

import { useDispatch } from 'react-redux';
import { signOut } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { retrySessionInitialization } from 'src/redux/auth/authSlice';
import { Box, Stack, Button, Container, Typography } from '@mui/material';
import { AccountAccessIllustration } from 'src/assets/illustrations/account-access-illustration';

export default function SessionInitializationError({ message }: { message: string }) {
  const dispatch = useDispatch();

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
      }}
    >
      <Stack alignItems="center" sx={{ width: 1, textAlign: 'center' }}>
        <AccountAccessIllustration sx={{ maxWidth: { xs: 208, sm: 260 }, mb: 2 }} />
        <Box role="alert" sx={{ width: 1, maxWidth: 440 }}>
          <Typography component="h1" variant="h4" sx={{ textWrap: 'balance' }}>
            Account access could not be verified
          </Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary', overflowWrap: 'anywhere' }}>
            {message}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mt: 3, width: { xs: 1, sm: 'auto' }, maxWidth: { xs: 280, sm: 'none' } }}
        >
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
            onClick={() => dispatch(retrySessionInitialization())}
            sx={{ minHeight: 44 }}
          >
            Try again
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => signOut({ callbackUrl: '/login' })}
            sx={{ minHeight: 44 }}
          >
            Sign out
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 4, maxWidth: 360, color: 'text.secondary' }}>
          If this keeps happening, sign out and sign in again.
        </Typography>
      </Stack>
    </Container>
  );
}
