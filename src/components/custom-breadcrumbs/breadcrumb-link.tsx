import type { SxProps } from '@mui/system';
import type { Theme } from 'src/theme/types';
import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { stylesMode } from 'src/theme/styles';
import { RouterLink } from 'src/routes/components';

import type { BreadcrumbsLinkProps } from './types';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  disabled: boolean;
  activeLast?: boolean;
  link: BreadcrumbsLinkProps;
};

export function BreadcrumbsLink({ link, activeLast, disabled, ...props }: Props) {
  const isInteractive = Boolean(link.href || link.onClick);
  const styles: SxProps<Theme> = {
    typography: 'body2',
    alignItems: 'center',
    color: (theme) =>
      activeLast
        ? theme.vars?.palette.primary.dark || theme.palette.primary.dark
        : theme.vars?.palette.text.primary || theme.palette.text.primary,
    display: 'inline-flex',
    minHeight: isInteractive ? 44 : 'auto',
    transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out',
    fontWeight: activeLast ? 600 : 400,
    ...(activeLast && { [stylesMode.dark]: { color: 'primary.light' } }),
    '&:hover': {
      color: 'primary.main',
      textDecoration: 'none',
      // backgroundColor: activeLast ? 'unset' : 'action.hover',
      borderRadius: 0.9,
    },
    '&:focus-visible': {
      outline: '3px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    ...(link.onClick &&
      !link.href && {
        p: 0,
        border: 0,
        font: 'inherit',
        cursor: 'pointer',
        backgroundColor: 'transparent',
      }),
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

  if (link.onClick) {
    return (
      <Box component="button" type="button" sx={styles} onClick={link.onClick} {...props}>
        {renderContent}
      </Box>
    );
  }

  return (
    <Box sx={styles} {...props}>
      {' '}
      {renderContent}{' '}
    </Box>
  );
}
