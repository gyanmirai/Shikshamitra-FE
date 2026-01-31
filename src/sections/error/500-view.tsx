'use client';

import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { SimpleLayout } from 'src/layouts/simple';
import { RouterLink } from 'src/routes/components';
import { ServerErrorIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function View500() {
  return (
    <SimpleLayout content={{ compact: true }}>
      <Container component={MotionContainer}>
        <motion.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            500 Internal server error
          </Typography>
        </motion.div>

        <motion.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            There was an error, please try again later.
          </Typography>
        </motion.div>

        <motion.div variants={varBounce().in}>
          <ServerErrorIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </motion.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to home
        </Button>
      </Container>
    </SimpleLayout>
  );
}
