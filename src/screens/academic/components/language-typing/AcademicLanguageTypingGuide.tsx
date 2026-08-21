'use client';

import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Chip,
  Stack,
  Button,
  Drawer,
  Divider,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useAcademicLanguageTyping } from './AcademicLanguageTypingContext';

const SETUP_STEPS = [
  {
    title: 'Install Google Input Tools',
    description: 'Install Google Input Tools from the official Chrome Web Store.',
    icon: 'mdi:download-box-outline',
    action: 'Open Chrome Web Store',
    duration: '30 sec',
  },
  {
    title: 'Pin the extension',
    description: 'Open the Chrome extensions menu and pin Google Input Tools for quick access.',
    icon: 'mdi:pin-outline',
    duration: '15 sec',
  },
  {
    title: 'Select your language',
    description: 'Open the Google Input Tools extension options and add Gujarati, Hindi or Marathi.',
    icon: 'mdi:web',
    duration: '30 sec',
  },
  {
    title: 'Enable transliteration',
    description: 'Turn on transliteration, then type phonetically to receive regional-language suggestions.',
    icon: 'mdi:keyboard-outline',
    duration: '15 sec',
  },
  {
    title: 'Start Typing',
    description: 'Click any text field and start typing phonetically in English. It will convert to your regional language.',
    icon: 'mdi:keyboard-outline',
    duration: '20 sec',
  },
];

const VIDEO_TUTORIAL_URL =
  'https://www.youtube.com/results?search_query=Google+Input+Tools+regional+language+typing+tutorial';

export function AcademicLanguageTypingSetupAction() {
  const { isSetupComplete, openSetupGuide } = useAcademicLanguageTyping();

  if (isSetupComplete) return null;

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Iconify icon="mdi:translate" width={20} />}
      onClick={openSetupGuide}
      sx={{
        position: 'fixed',
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.snackbar,
        borderRadius: 3,
        minHeight: 44,
        boxShadow: (theme) => theme.shadows[8],
      }}
    >
      Setup Language Typing
    </Button>
  );
}

export function AcademicLanguageTypingGuide() {
  const { setupGuideOpen, closeSetupGuide, completeSetup } = useAcademicLanguageTyping();
  const [activeStep, setActiveStep] = useState(0);
  const [testText, setTestText] = useState('');

  const handleClose = () => {
    setActiveStep(0);
    closeSetupGuide();
  };

  const handleNext = () => {
    if (activeStep === SETUP_STEPS.length - 1) {
      completeSetup();
      setActiveStep(0);
      return;
    }

    setActiveStep((current) => current + 1);
  };

  return (
    <Drawer
      anchor="right"
      open={setupGuideOpen}
      onClose={handleClose}
      ModalProps={{
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 2,
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          borderLeft: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.modal + 2,
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 2.5,
          pb: 2.25,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:translate" width={24} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.25, fontWeight: 800 }}>
                Regional Language Typing Guide
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete these simple steps to enable regional typing.
              </Typography>
            </Box>
          </Stack>
          <CustomTooltip title="Close setup guide">
            <IconButton aria-label="Close setup guide" onClick={handleClose} size="small">
              <Iconify icon="mdi:close" width={20} />
            </IconButton>
          </CustomTooltip>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2.25 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              color="primary"
              label={`Step ${activeStep + 1} of ${SETUP_STEPS.length}`}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              size="small"
              variant="outlined"
              icon={<Iconify icon="mdi:clock-outline" width={16} />}
              label="~ 2 Minutes"
            />
          </Stack>
          <Typography variant="caption" fontWeight={700} color="primary.main">
            {Math.round(((activeStep + 1) / SETUP_STEPS.length) * 100)}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / SETUP_STEPS.length) * 100}
          sx={{
            mt: 1.25,
            height: 7,
            borderRadius: 4,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            '& .MuiLinearProgress-bar': { borderRadius: 4 },
          }}
          aria-label={`Setup progress: step ${activeStep + 1} of ${SETUP_STEPS.length}`}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2}>
          {SETUP_STEPS.map((item, index) => {
            const isActive = index === activeStep;
            const isComplete = index < activeStep;

            return (
              <Stack
                key={item.title}
                direction="row"
                spacing={{ xs: 1, sm: 1.5 }}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    mt: 1,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    border: 2,
                    borderColor: isActive || isComplete ? 'primary.main' : 'divider',
                    bgcolor: isActive || isComplete ? 'primary.main' : 'background.paper',
                    color: isActive || isComplete ? 'primary.contrastText' : 'text.secondary',
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {isComplete ? <Iconify icon="mdi:check" width={20} /> : index + 1}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: { xs: 1.75, sm: 2.25 },
                    border: 1.5,
                    borderColor: isActive ? 'primary.main' : 'divider',
                    bgcolor: isActive
                      ? (theme) => alpha(theme.palette.primary.main, 0.08)
                      : 'background.paper',
                    borderRadius: 2,
                    boxShadow: isActive
                      ? (theme) => `0 8px 22px ${alpha(theme.palette.primary.main, 0.1)}`
                      : 0,
                    transition: (theme) =>
                      theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
                  }}
                >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon={item.icon} width={20} color="currentColor" />
                    <Typography variant="subtitle1" fontWeight={800}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Chip size="small" label={item.duration} sx={{ flexShrink: 0 }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.description}
                </Typography>
                {isActive && item.action && (
                  <>
                    <Button
                      component="a"
                      href="https://chromewebstore.google.com/detail/google-input-tools/mclkkofklkfljcocdinagocijmpgbhab"
                      target="_blank"
                      rel="noreferrer"
                      variant="contained"
                      size="small"
                      endIcon={<Iconify icon="mdi:open-in-new" width={16} />}
                      sx={{
                        mt: 2,
                        bgcolor: 'text.primary',
                        color: 'background.paper',
                        '&:hover': { bgcolor: 'text.secondary' },
                      }}
                    >
                      {item.action}
                    </Button>
                    
                  </>
                )}
                {isActive && activeStep === SETUP_STEPS.length - 1 && (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        border: 1,
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="mdi:keyboard-outline" width={20} />
                        <Typography variant="subtitle2" fontWeight={800}>
                          Test Your Setup
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        Click below and type phonetically to test your regional language extension.
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={testText}
                        onChange={(event) => setTestText(event.target.value)}
                        placeholder="Type here to test..."
                        inputProps={{ 'aria-label': 'Regional language typing test' }}
                        sx={{ mt: 1.5, bgcolor: 'background.paper' }}
                      />
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          mt: 1,
                          px: 1,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Example Transliteration:
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight={800}>
                          namaste → नमस्ते / નમસ્તે
                        </Typography>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        border: 1,
                        borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="mdi:movie-open-play-outline" width={20} />
                        <Typography variant="subtitle2" fontWeight={800}>
                          Video Tutorial
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Duration ~ 2:13"
                          sx={{ ml: 'auto' }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        Watch the complete setup in two minutes.
                      </Typography>
                      <Button
                        component="a"
                        href={VIDEO_TUTORIAL_URL}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        size="small"
                        color="warning"
                        endIcon={<Iconify icon="mdi:open-in-new" width={16} />}
                        sx={{ mt: 1.25 }}
                      >
                        Watch Video
                      </Button>
                    </Box>
                  </Stack>
                )}
              </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      <Divider />
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.25}
        sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Complete the final step to enable language typing.
        </Typography>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
            startIcon={<Iconify icon="mdi:close" width={16} />}
            sx={{ minWidth: 92 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleNext}
            startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
            sx={{ minWidth: 92 }}
          >
            {activeStep === SETUP_STEPS.length - 1 ? 'Save' : 'Continue'}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
