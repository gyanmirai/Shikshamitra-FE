import React from 'react';
import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button, CardHeader, Typography } from '@mui/material';

const actions = [
  {
    title: 'Issue Book',
    icon: 'solar:hand-stars-bold-duotone',
    color: 'primary.main',
    href: '/library/issued-books',
  },
  {
    title: 'Return Book',
    icon: 'solar:restart-square-bold-duotone',
    color: 'info.main',
    href: '/library/issued-books',
  },
  {
    title: 'Add Book',
    icon: 'solar:book-bold',
    color: 'success.main',
    href: '/library/book-list',
  },
  {
    title: 'Charges Management',
    icon: 'solar:wallet-money-bold-duotone',
    color: 'error.main',
    href: '/library/charges-management',
  },
];

const AdminQuickActions = () => (
  <Card sx={{ height: '100%', borderRadius: 1.5 }}>
    <CardHeader
      title="Quick Actions"
      action={
        <Iconify
          icon="eva:refresh-fill"
          width={20}
          sx={{ color: 'text.secondary', cursor: 'pointer' }}
        />
      }
      sx={{ mb: 2 }}
    />

    <Box
      sx={{
        px: 3,
        pb: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.title}
          component={Link}
          href={action.href}
          disableRipple
          color="inherit"
          sx={{
            py: 2,
            px: 2.5,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            textAlign: 'left',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'text.primary',
            },
          }}
        >
          <Iconify icon={action.icon} width={24} sx={{ color: action.color }} />

          <Typography variant="subtitle2" fontWeight={600}>
            {action.title}
          </Typography>
        </Button>
      ))}
    </Box>
  </Card>
);

export default AdminQuickActions;
