'use client';

import { useState } from 'react';
import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import YearSetup from 'src/components/academic-setup/year-setup';
import { Box, Stack, Button, Typography, useMediaQuery } from '@mui/material';

// Components
import WelcomeScreen from './welcom-screen';
import { BasicInformationForm } from '../setting/basicInformationForm';

// ----------------------------------------------------------------------

const STEPS = [
  { label: 'Welcome', icon: 'solar:home-smile-bold' },
  { label: 'Institute Profile', icon: 'solar:buildings-bold' },
  { label: 'Academic Setup', icon: 'solar:calendar-bold' },
];

export default function InitialSetupScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const pageVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -20, scale: 0.98 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  } as const;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 3,
        position: 'relative',
        background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.lighter, 0.4)} 0%, ${theme.palette.background.default} 60%)`,
      }}
    >
      {/* Header / Wizard Progress */}
      <Box
        maxWidth="xl"
        sx={{
          position: 'sticky',
          top: 0,
          pt: { xs: 2.5, md: 3 },
          pb: { xs: 2.5, md: 3 },
          zIndex: 1100,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          transition: 'all 0.3s ease',
          mx: -3,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={3}
          sx={{
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          {/* Logo / Brand Area */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* <Logo /> You can uncomment if you export Logo */}
            <Logo width={44} height={44} disableLink />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Setup Wizard
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Start your journey with Shiksha Mitra
              </Typography>
            </Box>
          </Stack>

          {/* Custom Stepper - Minimal */}
          {!isMobile && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                bgcolor: alpha(theme.palette.background.neutral, 0.6),
                p: 0.5,
                borderRadius: 3,
                backdropFilter: 'blur(6px)',
              }}
            >
              {STEPS.map((step, index) => {
                const isActive = activeStep === index;
                const isCompleted = activeStep > index;

                return (
                  <Box
                    key={index}
                    onClick={() => {
                      // Optional: Allow clicking previous steps
                      if (index < activeStep) setActiveStep(index);
                    }}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      px: 2,
                      py: 0.75,
                      borderRadius: 2.5,
                      cursor: index < activeStep ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      ...(isActive && {
                        bgcolor: 'background.paper',
                        boxShadow: theme.customShadows.z1,
                      }),
                      ...(isCompleted && {
                        opacity: 0.7,
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isActive
                          ? 'primary.main'
                          : isCompleted
                            ? 'success.main'
                            : 'action.disabledBackground',
                        color: isActive || isCompleted ? 'white' : 'text.disabled',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isCompleted ? (
                        <Iconify icon="solar:check-read-bold" width={16} />
                      ) : (
                        <Iconify icon={step.icon} width={16} />
                      )}
                    </Box>
                    <Stack>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: isActive ? 'text.primary' : 'text.secondary',
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        {step.label}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: 4,
          pt: 2,
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStep}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: theme.customShadows?.z20 || '0 0 20px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(activeStep === 0 && {
                    background: 'transparent',
                    boxShadow: 'none',
                  }),
                }}
              >
                {activeStep === 0 && <WelcomeScreen onNext={handleNext} />}
                {activeStep === 1 && (
                  <Box sx={{ height: '100%', overflow: 'hidden' }}>
                    {/* BasicInfoForm internal scrollbar handles scrolling. 
                                    We pass handleNext to handleClose so when they save, it moves next 
                                */}
                    <BasicInformationForm
                      handleClose={handleNext}
                      // editData is intentionally undefined for new setup
                    />
                  </Box>
                )}
                {activeStep === 2 && (
                  <Box
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
                  >
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                      <YearSetup />
                    </Box>
                    <Box
                      sx={{
                        position: 'sticky',
                        bottom: 0,
                        flexShrink: 0,
                        p: 2,
                        borderTop: `1px dashed ${theme.palette.divider}`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        bgcolor: 'background.paper',
                        zIndex: 10,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        startIcon={<Iconify icon="eva:arrow-back-fill" />}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        endIcon={<Iconify icon="solar:confetti-bold" />}
                        onClick={() => {
                          // Handle Finish Action - redirect or show completion modal
                          // For now just console log
                          // You might want to redirect to dashboard
                          window.location.href = '/dashboard';
                        }}
                      >
                        Complete Setup
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
