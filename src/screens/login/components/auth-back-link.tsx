import type { ReactNode } from 'react';

import Link from '@mui/material/Link';
import { RouterLink } from 'src/routes/components';

type Props = { children?: ReactNode; href?: string };

export function AuthBackLink({ children = 'Back to login', href = '/login' }: Props) {
  return (
    <Link
      component={RouterLink}
      href={href}
      underline="hover"
      sx={(theme) => ({
        minHeight: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.dark',
        typography: 'body2',
        ...theme.applyStyles('dark', { color: 'primary.light' }),
        '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
      })}
    >
      {children}
    </Link>
  );
}
