'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Tooltip, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import { BreadcrumbsLink } from './breadcrumb-link';

import type { CustomBreadcrumbsProps } from './types';

// ----------------------------------------------------------------------

export function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  slotProps = {
    action: {},
    heading: {},
    moreLink: {},
    breadcrumbs: {},
  },
  sx,
  description,
  tooltipProps,
  isBack = false,
  onBack = () => {},
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;

  const renderHeading = (
    <Typography
      variant="h4"
      sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, ...slotProps?.heading }}
    >
      {isBack && (
        <IconButton onClick={onBack}>
          {' '}
          <Iconify icon="ic:outline-arrow-back-ios-new" />{' '}
        </IconButton>
      )}
      {heading}{' '}
      {description && (
        <Tooltip arrow placement="right" title={description} {...tooltipProps}>
          <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
        </Tooltip>
      )}
    </Typography>
  );
  if (isBack) {
    // @ts-ignore
    slotProps.breadcrumbs.pl = '52px';
  }
  const renderLinks = (
    <Breadcrumbs separator={<Separator />} sx={slotProps?.breadcrumbs} {...other}>
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

  const renderAction = <Box sx={{ flexShrink: 0, ...slotProps?.action }}> {action} </Box>;

  const renderMoreLink = (
    <Box component="ul">
      {moreLink?.map((href) => (
        <Box key={href} component="li" sx={{ display: 'flex' }}>
          <Link href={href} variant="body2" target="_blank" rel="noopener" sx={slotProps?.moreLink}>
            {href}
          </Link>
        </Box>
      ))}
    </Box>
  );

  return (
    <Stack
      spacing={2}
      sx={{ pl: 0, pb: 2, borderBottom: (theme) => `1px solid ${theme.palette.grey[400]}`, ...sx }}
    >
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          {heading && renderHeading}
          {!!links.length && renderLinks}
        </Box>

        {action && renderAction}
      </Stack>

      {!!moreLink && renderMoreLink}
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
      }}
    />
  );
}
