import type { SxProps } from '@mui/system';
import type { Theme } from 'src/theme/types';
import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { RouterLink } from 'src/routes/components';

import type { BreadcrumbsLinkProps } from './types';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  disabled: boolean;
  activeLast?: boolean;
  link: BreadcrumbsLinkProps;
};

export function BreadcrumbsLink({ link, activeLast, disabled, ...props }: Props) {
  const styles: SxProps<Theme> = {
    typography: 'body2',
    alignItems: 'center',
    color: (theme) =>
      activeLast ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
    display: 'inline-flex',
    transition: 'all 0.2s ease-in-out',
    fontWeight: activeLast ? 600 : 400,
    '&:hover': {
      color: 'primary.main',
      textDecoration: 'none',
      backgroundColor: activeLast ? 'unset' : 'action.hover',
      borderRadius: 0.9,
    },
    ...(disabled &&
      !activeLast && {
        cursor: 'default',
        pointerEvents: 'none',
        color: 'text.disabled',
      }),
  };

  const renderContent = (
    <>
      {link.icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            display: 'inherit',
            '& svg, & img': {
              width: 20,
              height: 20,
            },
          }}
        >
          {link.icon}
        </Box>
      )}

      {link.name}
    </>
  );

  if (link.href) {
    return (
      <Link component={RouterLink} href={link.href} sx={styles} onClick={link?.onClick}>
        {renderContent}
      </Link>
    );
  }

  return (
    <Box sx={styles} onClick={link?.onClick} {...props}>
      {' '}
      {renderContent}{' '}
    </Box>
  );
}
