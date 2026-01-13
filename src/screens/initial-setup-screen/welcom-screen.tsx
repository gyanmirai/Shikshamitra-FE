import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Stack, Button, Avatar, Container, Typography } from '@mui/material';

interface WelcomeScreenProps {
  onNext?: () => void;
  // formik prop is no longer needed but keeping it optional to avoid breaking if passed
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const theme = useTheme();

  return (
    <Container
      maxWidth="lg"
      sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Grid container spacing={6} sx={{ alignItems: 'center' }}>
        {/* Left side - School Illustration */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            sx={{
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Box
              component="img"
              src="/assets/illustrations/welcome_setup.png"
              alt="Welcome Illustration"
              sx={{
                width: '100%',
                maxWidth: 480,
                filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.15))',
              }}
            />

            {/* Floating Elements Animation */}
            <Box
              component={motion.div}
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              sx={{
                position: 'absolute',
                top: '10%',
                right: '-5%',
                zIndex: 3,
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 2,
                boxShadow: theme.customShadows.z24,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 40, height: 40 }}
                >
                  <Iconify icon="solar:chart-2-bold" width={24} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">Analytics Ready</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Real-time insights
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Back Glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, ${theme.palette.primary.lighter} 0%, transparent 70%)`,
              opacity: 0.6,
              zIndex: 0,
            }}
          />
        </Grid>

        {/* Right side - Welcome Text and Information */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ pl: { md: 4 } }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: 'primary.lighter',
                    borderRadius: 1.5,
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="solar:stars-minimalistic-bold" width={24} />
                </Box>
                <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
                  Premium School ERP
                </Typography>
              </Stack>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 2,
                  background: `linear-gradient(to right, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome to <br /> Shiksha Mitra
              </Typography>

              <Typography
                variant="h6"
                sx={{ color: 'text.secondary', mb: 4, fontWeight: 400, maxWidth: 480 }}
              >
                Empower your institution with an AI-driven platform designed to revolutionize
                education management.
              </Typography>

              <Stack spacing={3} sx={{ mb: 5 }}>
                {[
                  {
                    title: 'Smart Analytics',
                    desc: 'Data-driven decisions for better student outcomes.',
                    icon: 'solar:graph-up-bold',
                  },
                  {
                    title: 'Seamless Management',
                    desc: 'Effortless administration of academics and finance.',
                    icon: 'solar:settings-minimalistic-bold-duotone',
                  },
                ].map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={2}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <Box sx={{ color: 'primary.main' }}>
                      <Iconify icon={item.icon} width={28} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Button
                variant="contained"
                size="large"
                onClick={onNext}
                endIcon={<Iconify icon="solar:arrow-right-linear" />}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  boxShadow: theme.customShadows.primary,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WelcomeScreen;
