import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Card, Stack, Divider, Typography, CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

interface SalaryItem {
  label: string;
  amount: number;
}

interface TeacherPayrollOverviewProps {
  earnings: SalaryItem[];
  deductions: SalaryItem[];
}

// ----------------------------------------------------------------------

export default function TeacherPayrollOverview({
  earnings,
  deductions,
}: TeacherPayrollOverviewProps) {
  const theme = useTheme();

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const renderSection = (
    title: string,
    items: SalaryItem[],
    total: number,
    type: 'earning' | 'deduction'
  ) => (
    <Stack spacing={2} sx={{ flex: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: type === 'earning' ? 'success.main' : 'error.main',
          }}
        />
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {items.map((item, index) => (
          <Stack key={index} direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
            <Typography variant="subtitle2">
              {type === 'deduction' && '- '}
              {formatCurrency(item.amount)}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">
          Total {type === 'earning' ? 'Earnings' : 'Deductions'}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: type === 'earning' ? 'success.main' : 'error.main' }}
        >
          {formatCurrency(total)}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Salary Overview"
        subheader="Monthly breakdown of earnings and deductions"
        action={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
            <Iconify icon="solar:calendar-date-bold" width={16} />
            <Typography variant="caption">September 2024</Typography>
          </Stack>
        }
      />

      <Stack
        spacing={3}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderSection('Earnings', earnings, totalEarnings, 'earning')}
        {renderSection('Deductions', deductions, totalDeductions, 'deduction')}
      </Stack>

      <Box sx={{ p: 3, pt: 0 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
            border: `1px dashed ${varAlpha(theme.palette.primary.mainChannel, 0.2)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'common.white',
                  boxShadow: theme.shadows[1],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify
                  icon="solar:wallet-money-bold-duotone"
                  width={24}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Box>
                <Typography variant="h6">Net Salary</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Paid on 30th Sep
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {formatCurrency(netSalary)}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
