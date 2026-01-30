import React from 'react';
import { motion } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Stack, Avatar, Button, Container, Typography } from '@mui/material';

interface WelcomeScreenProps {
  onNext?: () => void;
  // formik prop is no longer needed but keeping it optional to avoid breaking if passed
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const theme = useTheme();

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, md: 3 },
        px: { xs: 2, sm: 3 },
        maxWidth: '1400px !important',
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 4 }}
        sx={{ alignItems: 'center', maxWidth: '100%', m: 0 }}
      >
        {/* Left side - School Illustration */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            order: { xs: 2, md: 1 },
            pl: { md: '0 !important' },
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
            sx={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="/assets/illustrations/welcome_setup_v2.png"
              alt="Welcome Illustration"
              sx={{
                width: '100%',
                maxWidth: { xs: 240, sm: 300, md: 540 },
                height: 'auto',
                filter: 'drop-shadow(0px 16px 32px rgba(0,0,0,0.1))',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />

            {/* Floating Analytics Card */}
            <Box
              component={motion.div}
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              sx={{
                position: 'absolute',
                top: { xs: '5%', md: '10%' },
                right: { xs: '-2%', md: '5%' },
                zIndex: 3,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Card
                sx={{
                  p: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  boxShadow: theme.customShadows.z20,
                  backdropFilter: 'blur(8px)',
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  minWidth: { xs: 140, md: 160 },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.12),
                      color: 'success.main',
                      width: { xs: 32, md: 36 },
                      height: { xs: 32, md: 36 },
                    }}
                  >
                    <Iconify icon="solar:chart-2-bold" width={20} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                    >
                      Analytics
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}
                    >
                      Real-time
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Box>

            {/* Floating Achievement Badge */}
            <Box
              component={motion.div}
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              sx={{
                position: 'absolute',
                bottom: { xs: '8%', md: '12%' },
                left: { xs: '-2%', md: '5%' },
                zIndex: 3,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Card
                sx={{
                  p: { xs: 1, md: 1.25 },
                  borderRadius: 2,
                  boxShadow: theme.customShadows.z16,
                  backdropFilter: 'blur(8px)',
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.08)}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.12),
                      color: 'warning.main',
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 },
                    }}
                  >
                    <Iconify icon="solar:medal-star-bold" width={16} />
                  </Avatar>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
                  >
                    Premium ERP
                  </Typography>
                </Stack>
              </Card>
            </Box>
          </Box>

          {/* Enhanced Background Glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 60%)`,
              opacity: 0.8,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        </Grid>

        {/* Right side - Welcome Text and Information */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            order: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ pl: { md: 6 } }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Premium Badge */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, md: 1 }}
                sx={{ mb: { xs: 1.5, md: 2 } }}
              >
                <Box
                  sx={{
                    p: 0.75,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 1.5,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:stars-minimalistic-bold" width={16} />
                </Box>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  Premium School ERP
                </Typography>
              </Stack>

              {/* Main Heading */}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Welcome to <br /> Shiksha Mitra
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: { xs: 2, md: 3 },
                  fontWeight: 400,
                  maxWidth: 480,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.925rem' },
                }}
              >
                Empower your institution with an AI-driven platform designed to revolutionize
                education management.
              </Typography>

              {/* Feature Cards */}
              <Stack spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
                {[
                  {
                    title: 'Smart Analytics',
                    desc: 'Data-driven decisions for better outcomes.',
                    icon: 'solar:graph-up-bold',
                    color: 'primary',
                  },
                  {
                    title: 'Seamless Management',
                    desc: 'Effortless administration of academics.',
                    icon: 'solar:settings-minimalistic-bold-duotone',
                    color: 'info',
                  },
                  {
                    title: 'Secure & Reliable',
                    desc: 'Enterprise-grade security with 99.9% uptime.',
                    icon: 'solar:shield-check-bold',
                    color: 'success',
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    component={motion.div}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Card
                      sx={{
                        p: { xs: 1.5, md: 1.75 },
                        borderRadius: { xs: 2, md: 2 },
                        border: `1px solid ${alpha(theme.palette[item.color as 'primary' | 'info' | 'success'].main, 0.08)}`,
                        bgcolor: alpha(
                          theme.palette[item.color as 'primary' | 'info' | 'success'].main,
                          0.02
                        ),
                        boxShadow: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          boxShadow: theme.customShadows.z8,
                          transform: 'translateY(-2px)',
                          bgcolor: alpha(
                            theme.palette[item.color as 'primary' | 'info' | 'success'].main,
                            0.04
                          ),
                          borderColor: alpha(
                            theme.palette[item.color as 'primary' | 'info' | 'success'].main,
                            0.16
                          ),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 36, md: 40 },
                          height: { xs: 36, md: 40 },
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(
                            theme.palette[item.color as 'primary' | 'info' | 'success'].main,
                            0.12
                          ),
                          color: `${item.color}.main`,
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={item.icon} width={20} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{
                            mb: 0.25,
                            lineHeight: 1.3,
                            fontSize: { xs: '0.8125rem', md: '0.925rem' },
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.4,
                            fontSize: { xs: '0.7rem', md: '0.8rem' },
                            display: 'block',
                          }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </Stack>

              {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                onClick={onNext}
                endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  fontWeight: 700,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  bgcolor: 'primary.main',
                  color: 'white',
                  textTransform: 'none',
                  letterSpacing: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
                    transform: 'translateY(-1px)',
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
