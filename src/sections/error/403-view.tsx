'use client';

import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function View403() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Container component={MotionContainer}>
        <motion.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            No permission
          </Typography>
        </motion.div>

        <motion.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            The page you’re trying to access has restricted access. Please refer to your system
            administrator.
          </Typography>
        </motion.div>

        <motion.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </motion.div>

        {/* <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to home
        </Button> */}
      </Container>
    </Box>
  );
}
