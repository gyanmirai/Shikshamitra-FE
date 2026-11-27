'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import FinanceAccountantDashboardScreen from 'src/screens/finance/dashboard';
import FinanceAdminDashboardScreen from 'src/screens/finance/FinanceAdminDashboard';
import FinancePrincipalDashboard from 'src/screens/finance/FinancePrincipalDashboard';
import { getSessionRoles } from 'src/screens/mainDashboard/dashboard-template-resolver';
import { FinanceDashboardSkeleton } from 'src/screens/finance/components/FinanceContentSkeletons';
import { resolveFinanceDashboardView } from 'src/screens/finance/FinanceAdminDashboard/finance-dashboard-routing';
import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  Typography,
  CardContent,
} from '@mui/material';

const FinanceRoleNotConfigured = ({ role }: { role: string }) => (
  <Box
    sx={{
      minHeight: 'calc(100vh - 220px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}
  >
    <Card
      sx={{
        width: '100%',
        maxWidth: 560,
        borderRadius: 3,
        boxShadow: (theme) => theme.shadows[8],
        background: (theme) =>
          `linear-gradient(145deg, ${theme.palette.background.paper} 20%, ${theme.palette.grey[100]} 100%)`,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'warning.lighter',
              color: 'warning.dark',
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            !
          </Avatar>
          <Typography variant="h5">Dashboard Not Available</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
            No finance dashboard is configured for your role yet. Please contact the administrator
            to assign dashboard access.
          </Typography>
          <Chip
            label={`Current Role: ${role || 'Unknown'}`}
            color="warning"
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  </Box>
);

const FinanceDashboard = () => {
  const { data: session, status } = useSession();
  const view = resolveFinanceDashboardView(session);

  if (status === 'loading') {
    return <FinanceDashboardSkeleton />;
  }

  if (view === 'admin') {
    return <FinanceAdminDashboardScreen />;
  }

  if (view === 'principal') {
    return <FinancePrincipalDashboard />;
  }

  if (view === 'accountant') {
    return <FinanceAccountantDashboardScreen />;
  }

  return <FinanceRoleNotConfigured role={getSessionRoles(session).join(', ')} />;
};

export default FinanceDashboard;
