import Stack from '@mui/material/Stack';
import { Logo } from 'src/components/logo';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';
import { useSettingsContext } from 'src/components/settings';

export function LoginHeader() {
  const { mode, systemMode, setMode } = useColorScheme();
  const settings = useSettingsContext();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
  const toggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setMode(nextMode);
    settings.onUpdateField('colorScheme', nextMode);
  };

  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ gridColumn: '1 / -1' }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Logo disableLink width={48} height={48} aria-label="GyanMirai logo" />
        <Typography
          component="span"
          sx={(theme) => ({
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'primary.dark',
            ...theme.applyStyles('dark', { color: 'primary.light' }),
          })}
        >
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
  );
}
