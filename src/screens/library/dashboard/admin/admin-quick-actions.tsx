import React from 'react';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, CardHeader, IconButton, Typography } from '@mui/material';

const actions = [
  {
    title: 'Issue Book',
    icon: 'solar:hand-stars-bold-duotone',
    color: 'primary',
    href: '/library/issued-books',
  },
  {
    title: 'Return Book',
    icon: 'solar:restart-square-bold-duotone',
    color: 'info',
    href: '/library/issued-books',
  },
  {
    title: 'Add Book',
    icon: 'solar:book-bold',
    color: 'success',
    href: '/library/book-list',
  },
  {
    title: 'Reservations',
    icon: 'solar:calendar-date-bold-duotone',
    color: 'warning',
    href: '/library/member-management',
  },
  {
    title: 'Manage Fines',
    icon: 'solar:wallet-money-bold-duotone',
    color: 'error',
    href: '/library/charges-management',
  },
];

const AdminQuickActions = () => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 2,
      boxShadow: 'none',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <CardHeader
      title={
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="h6">Quick Actions</Typography>
          <CustomTooltip title="Perform common library management tasks quickly" placement="top">
            <IconButton size="small" sx={{ p: 0 }}>
              <Iconify icon="solar:info-circle-linear" width={18} sx={{ color: 'text.disabled' }} />
            </IconButton>
          </CustomTooltip>
        </Stack>
      }
      sx={{ mb: 0, mt: -1, ml: -1 }}
      action={
        <Button
          size="small"
          color="inherit"
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            },
          }}
        >
          <Iconify icon="solar:refresh-linear" width={20} />
        </Button>
      }
    />

    <Box sx={{ px: 1, pb: 2, mt: 2 }}>
      <Stack spacing={1}>
        {actions.map((action) => (
          <Button
            key={action.title}
            component={Link}
            href={action.href}
            disableRipple
            color="inherit"
            sx={{
              width: '100%',
              px: 2,
              py: 1.5,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1.5,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              textAlign: 'left',
              color: 'text.primary',
              transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.16),
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon={action.icon} width={24} sx={{ color: `${action.color}.main` }} />
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
              {action.title}
            </Typography>
          </Button>
        ))}
      </Stack>
    </Box>
  </Card>
);

export default AdminQuickActions;
