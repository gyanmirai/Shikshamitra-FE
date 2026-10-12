import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Logo } from 'src/components/logo';
import Tooltip from '@mui/material/Tooltip';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'framer-motion';
import { useSettingsContext } from 'src/components/settings';

export function LoginHeader() {
  const reduceMotion = useReducedMotion();
  const { mode, systemMode, setMode } = useColorScheme();
  const settings = useSettingsContext();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setMode(nextMode);
    settings.onUpdateField('colorScheme', nextMode);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        px: 3.5,
        pt: 3,
        pb: 7,
      }}
    >
      <Box
        component={motion.div}
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        sx={(theme) => ({
          position: 'absolute',
          width: 190,
          height: 190,
          right: -75,
          bottom: -55,
          borderRadius: '50%',
          border: '28px solid',
          borderColor: varAlpha(theme.vars.palette.primary.contrastTextChannel, 0.09),
          pointerEvents: 'none',
        })}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ position: 'relative' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo
            disableLink
            width={28}
            height={28}
            aria-label="GyanMirai logo"
            sx={{ fill: 'currentColor' }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            GyanMirai
          </Typography>
        </Stack>
        <Tooltip title={isDark ? 'Use light theme' : 'Use dark theme'}>
          <IconButton
            onClick={toggleTheme}
            aria-label={isDark ? 'Use light theme' : 'Use dark theme'}
            sx={{
              color: 'inherit',
              width: 44,
              height: 44,
              '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
            }}
          >
            <Iconify icon={isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        component={motion.div}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ position: 'relative', mt: 3 }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: 'clamp(1.65rem, 7.3vw, 2.25rem)',
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
          }}
        >
          A fresh day.
          <br />A new possibility.
        </Typography>
      </Box>
    </Box>
  );
}
