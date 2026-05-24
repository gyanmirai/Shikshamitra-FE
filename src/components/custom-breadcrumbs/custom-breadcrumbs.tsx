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
        <IconButton aria-label="Back" data-testid="breadcrumb-back" size="small" onClick={onBack}>
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
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        pb: 0,
        px: 1,
        minHeight: 56,
        borderRadius: 2,
        bgcolor: 'transparent',
        // boxShadow: (theme) =>
        //   `0px 4px 12px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.16)'}`,
        // border: (theme) => `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* LEFT: Back Button & Heading */}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {isBack && (
          <IconButton
            aria-label="Back"
            data-testid="breadcrumb-back"
            size="small"
            onClick={onBack}
            sx={{
              color: 'text.secondary',
              bgcolor: 'action.hover',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: 'action.selected',
                color: 'text.primary',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Iconify icon="eva:arrow-back-fill" width={18} />
          </IconButton>
        )}

        {heading && (
          <Stack spacing={0.25}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
              >
                {heading}
              </Typography>
              {description && (
                <CustomTooltip arrow placement="right" title={description} {...tooltipProps}>
                  <Iconify
                    icon="lucide:info"
                    sx={{
                      cursor: 'pointer',
                    }}
                    width={16}
                    color="info.main"
                  />
                </CustomTooltip>
              )}
            </Stack>

            {/* Optional: We could show breadcrumbs *under* the title if we wanted a different layout, 
                 but matching the prompt's request for single line modernization first. 
                 However, usually enterprise breadcrumbs are above title or inline. 
                 The current design attempts inline. Let's keep inline but clean.
             */}
          </Stack>
        )}
      </Stack>

      {/* CENTER: Breadcrumbs (Liquid Width) */}
      {!!links.length && (
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0, // Allow shrinking
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Vertical Separator between Heading and Breadcrumbs */}
          <Box
            sx={{
              width: '1px',
              height: 24,
              bgcolor: (theme) => theme.palette.grey[400],
              mr: 2,
              display: { xs: 'none', md: 'block' },
            }}
          />

          <Breadcrumbs
            separator={<Separator />}
            sx={{
              '& .MuiBreadcrumbs-separator': { mx: 1 },
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'nowrap',
                overflowX: 'auto',
                // pb: 0.5, // Space for scrollbar if needed
                scrollbarWidth: 'none', // Firefox
                columnGap: 0.5,
                '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
              },
              ...slotProps?.breadcrumbs,
            }}
            {...other}
          >
            {links.map((link, index) => (
              <BreadcrumbsLink
                key={link.name ?? index}
                link={link}
                activeLast={links.length === index + 1}
                disabled={link.name === lastLink}
              />
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {/* RIGHT: Actions */}
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function Separator() {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'text.disabled',
        opacity: 0.7, // subtler
      }}
    />
  );
}
