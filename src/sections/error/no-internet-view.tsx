'use client';

import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { SimpleLayout } from 'src/layouts/simple';
import GlobalStyles from '@mui/material/GlobalStyles';
import { shikshaMitraToast } from 'src/components/toast';
import { ServerErrorIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function NoInternetView() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh();
    } else {
      shikshaMitraToast.error({ message: 'Still offline. Please check your connection.' });
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          body: { overflow: 'hidden' },
        }}
      />
      <SimpleLayout content={{ compact: true }}>
        <Container component={MotionContainer}>
          <motion.div variants={varBounce().in}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              No Internet Connection
            </Typography>
          </motion.div>

          <motion.div variants={varBounce().in}>
            <Typography sx={{ color: 'text.secondary' }}>
              It looks like you’re offline. Please check your internet connection and try again.
            </Typography>
          </motion.div>

          <motion.div variants={varBounce().in}>
            <ServerErrorIllustration sx={{ my: { xs: 5, sm: 10 } }} />
          </motion.div>

          <Button size="medium" variant="contained" onClick={handleRetry}>
            Try Again
          </Button>
        </Container>
      </SimpleLayout>
    </>
  );
}
