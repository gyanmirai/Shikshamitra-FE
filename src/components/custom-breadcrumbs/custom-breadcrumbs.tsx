'use client';

import type { ReactNode } from 'react';

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
  headingComponent = 'h6',
  layout = 'inline',
  moreLink,
  activeLast,
  slotProps = { action: {}, heading: {}, moreLink: {}, breadcrumbs: {} },
  sx,
  description,
  descriptionDisplay = 'tooltip',
  tooltipProps,
  isBack = false,
  onBack = () => { },
  showDivider = false,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1]?.name;

  const renderLinks = (separator: ReactNode) => (
    <Breadcrumbs
      separator={separator}
      sx={{
        fontSize: 12,
        color: 'text.secondary',
        '& .MuiBreadcrumbs-separator': { mx: layout === 'stacked' ? 0.75 : 1 },
        '& .MuiBreadcrumbs-ol': {
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          columnGap: 0.5,
          '&::-webkit-scrollbar': { display: 'none' },
        },
        ...slotProps?.breadcrumbs,
      }}
      {...other}
    >
      {links.map((link, index) => (
        <BreadcrumbsLink
          key={link.name ?? index}
          link={link}
          activeLast={activeLast ?? links.length === index + 1}
          disabled={link.name === lastLink}
        />
      ))}
    </Breadcrumbs>
  );

  const renderHeading = (
    <Stack
      direction="row"
      alignItems={layout === 'stacked' ? 'flex-start' : 'center'}
      spacing={1.5}
      sx={{ minWidth: 0, flex: layout === 'stacked' ? 1 : '0 1 auto' }}
    >
      {isBack && (
        <IconButton
          aria-label="Back"
          data-testid="breadcrumb-back"
          size="small"
          onClick={onBack}
          sx={{
            color: 'text.secondary',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.selected',
              color: 'text.primary',
            },
            transition: (theme) =>
              theme.transitions.create(['background-color', 'color'], {
                duration: theme.transitions.duration.shorter,
              }),
          }}
        >
          <Iconify icon="eva:arrow-back-fill" width={18} aria-hidden />
        </IconButton>
      )}

      {heading && (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              component={headingComponent}
              variant="h6"
              sx={{
                minWidth: 0,
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.2,
                overflowWrap: 'anywhere',
                textWrap: 'balance',
                ...slotProps?.heading,
              }}
            >
              {heading}
            </Typography>
            {description && descriptionDisplay === 'tooltip' && (
              <CustomTooltip arrow placement="right" title={description} {...tooltipProps}>
                <IconButton
                  aria-label="Page description"
                  size="small"
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <Iconify icon="lucide:info" width={16} color="info.main" aria-hidden />
                </IconButton>
              </CustomTooltip>
            )}
          </Stack>
          {description && descriptionDisplay === 'visible' ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 680, overflowWrap: 'anywhere' }}
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
      )}
    </Stack>
  );

  if (layout === 'stacked') {
    return (
      <Stack
        data-layout="stacked"
        spacing={0.5}
        sx={{
          pb: 0,
          px: 1,
          minHeight: 56,
          bgcolor: 'transparent',
          overflow: 'hidden',
          ...sx,
        }}
      >
        {!!links.length && <Box sx={{ minWidth: 0 }}>{renderLinks('/')}</Box>}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{ minWidth: 0 }}
        >
          {renderHeading}
          {action && <Box sx={{ flexShrink: 0, ...slotProps?.action }}>{action}</Box>}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      data-layout="inline"
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
      {renderHeading}

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

          {renderLinks(<Separator />)}
        </Box>
      )}

      {/* RIGHT: Actions */}
      {action && <Box sx={{ flexShrink: 0, ...slotProps?.action }}>{action}</Box>}
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
