'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
import { BreadcrumbsLink } from './breadcrumb-link';

import type { CustomBreadcrumbsProps } from './types';

// ----------------------------------------------------------------------

export function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  slotProps = { action: {}, heading: {}, moreLink: {}, breadcrumbs: {} },
  sx,
  description,
  tooltipProps,
  isBack = false,
  onBack = () => {},
  showDivider = false, // NEW: optional divider
  ...other
}: CustomBreadcrumbsProps & { showDivider?: boolean }) {
  const lastLink = links[links.length - 1]?.name;

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      {isBack && (
        <IconButton size="small" onClick={onBack}>
          <Iconify icon="ic:outline-arrow-back-ios-new" fontSize={18} />
        </IconButton>
      )}

      <Typography
        variant="h4"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ...slotProps?.heading }}
      >
        {heading}
        {description && (
          <CustomTooltip arrow placement="right" title={description} {...tooltipProps}>
            <Iconify
              icon="lucide:info"
              sx={{ cursor: 'pointer' }}
              fontSize={16}
              color="info.main"
            />
          </CustomTooltip>
        )}
      </Typography>
    </Stack>
  );

  const renderLinks = (
    <Breadcrumbs
      separator="/"
      sx={{
        mt: 0.5,
        fontSize: 12,
        color: 'text.secondary',
        '& .MuiBreadcrumbs-separator': { mx: 0.5 },
        ...slotProps?.breadcrumbs,
      }}
      {...other}
    >
      {links.map((link, index) => (
        <BreadcrumbsLink
          key={link.name ?? index}
          link={link}
          activeLast={activeLast}
          disabled={link.name === lastLink}
        />
      ))}
    </Breadcrumbs>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: 44, // slight bump for comfort (still compact)
        px: 2,
        borderRadius: 1.5,

        // subtle modern surface
        // backgroundColor: (theme) =>
        //   theme.palette.mode === 'light' ? 'rgba(248, 250, 252, 0.9)' : 'rgba(20, 24, 28, 0.9)',
        backdropFilter: 'blur(6px)',

        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* LEFT: Back + Heading */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        {isBack && (
          <IconButton size="small" onClick={onBack}>
            <Iconify icon="ic:outline-arrow-back-ios-new" fontSize={18} />
          </IconButton>
        )}

        <Typography variant="h5" noWrap fontWeight={600} letterSpacing="-0.01em">
          {heading}
        </Typography>

        {description && (
          <CustomTooltip arrow placement="right" title={description} {...tooltipProps}>
            <Iconify
              icon="lucide:info"
              sx={{ cursor: 'pointer' }}
              fontSize={16}
              color="info.main"
            />
          </CustomTooltip>
        )}

        {/* MODERN separator (replace red bar) */}
        <Box
          sx={{
            width: 12,
            height: 1,
            bgcolor: 'grey.400',
            opacity: 0.6,
            mx: 1,
            flexShrink: 0,
          }}
        />
      </Stack>

      {/* CENTER: Breadcrumbs */}
      {!!links.length && (
        <Breadcrumbs
          separator="/"
          sx={{
            fontSize: 12,
            letterSpacing: '0.02em',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            flexGrow: 1,
            '* ol': {
              gap: 1,
            },

            '&::-webkit-scrollbar': { display: 'none' },
            '& .MuiBreadcrumbs-separator': { mx: 0.5 },

            // modern hover feel
            '& a': {
              transition: 'color 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            },
          }}
        >
          {links.map((link, index) => (
            <BreadcrumbsLink
              key={link.name ?? index}
              link={link}
              activeLast={activeLast}
              disabled={index === links.length - 1}
            />
          ))}
        </Breadcrumbs>
      )}

      {/* RIGHT: Actions */}
      {action && (
        <Box
          sx={{
            flexShrink: 0,
            ml: 1,
            '& .MuiButton-root': {
              // borderRadius: 999, // pill-style modern CTA
              textTransform: 'none',
              px: 2,
            },
          }}
        >
          {action}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function Separator() {
  return (
    <Box
      component="span"
      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
    />
  );
}
