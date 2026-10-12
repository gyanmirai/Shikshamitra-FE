import { useState } from 'react';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useReducedMotion } from 'framer-motion';
import Typography from '@mui/material/Typography';

export function LoginHelp({ disabled }: { disabled: boolean }) {
  const [showHelp, setShowHelp] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Button
        onClick={() => setShowHelp(!showHelp)}
        disabled={disabled}
        aria-expanded={showHelp}
        aria-controls="login-help"
        sx={{
          alignSelf: 'center',
          color: 'text.secondary',
          mt: 2,
          minHeight: 44,
          fontSize: '0.8125rem',
          '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
        }}
      >
        Need help?
      </Button>
      <Collapse in={showHelp} timeout={reduceMotion ? 0 : 'auto'}>
        <Typography
          id="login-help"
          variant="body2"
          sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}
        >
          Ask your school administrator for your school code and username. Use Forgot password to
          recover your account.
        </Typography>
      </Collapse>
    </>
  );
}
