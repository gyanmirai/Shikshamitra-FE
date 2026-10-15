import { Button } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

export function FixtureThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>Switch theme</Button>;
}
