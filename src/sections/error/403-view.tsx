'use client';

import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { ForbiddenIllustration } from 'src/assets/illustrations';
import { varFade, varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function View403() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        py: 6,
        px: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="sm">
        <MotionContainer>
          {/* Heading */}
          <motion.div variants={varFade().inUp}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
              No permission
            </Typography>
          </motion.div>

          {/* Illustration */}
          <motion.div variants={varBounce().in}>
            <ForbiddenIllustration sx={{ width: 200, height: 'auto', mb: 3 }} />
          </motion.div>

          {/* Description */}
          <motion.div variants={varFade().inUp}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don&apos;t have access to this page. This is usually because your account role
              doesn&apos;t include this area, or your session has expired.
            </Typography>
          </motion.div>

          {/* Info items */}
          <motion.div variants={varFade().inUp}>
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Iconify
                  icon="mdi:account-outline"
                  width={20}
                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Contact your system administrator to request access.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Iconify
                  icon="mdi:refresh"
                  width={20}
                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Or try signing in again if your session expired.
                </Typography>
              </Box>
            </Stack>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={varFade().inUp}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                href="/dashboard"
                variant="outlined"
                startIcon={<Iconify icon="mdi:arrow-left" />}
              >
                Go back
              </Button>

              <Button
                component={RouterLink}
                href="/dashboard"
                variant="contained"
                startIcon={<Iconify icon="mdi:home-outline" />}
              >
                Home
              </Button>
            </Stack>
          </motion.div>
        </MotionContainer>
      </Container>
    </Box>
  );
}
