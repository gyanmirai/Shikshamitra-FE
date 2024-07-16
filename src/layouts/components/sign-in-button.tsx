import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }: ButtonProps) {
  return (
    <Button component={RouterLink} href="/login" variant="outlined" sx={sx} {...other}>
      Sign in
    </Button>
  );
}
