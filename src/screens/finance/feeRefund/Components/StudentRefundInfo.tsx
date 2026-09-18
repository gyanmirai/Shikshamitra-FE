import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { FeeRefundStatusType, FeeRefundStatusTypeColors } from 'src/enums/feeRefund-status-type';

import type { IStudentFeeData } from '../type';

const statusLabel: Record<FeeRefundStatusType, string> = {
  [FeeRefundStatusType.Submitted]: 'Submitted',
  [FeeRefundStatusType.UnderReview]: 'Under review',
  [FeeRefundStatusType.Approved]: 'Approved',
  [FeeRefundStatusType.Rejected]: 'Rejected',
  [FeeRefundStatusType.Cancelled]: 'Cancelled',
  [FeeRefundStatusType.Draft]: 'Draft',
  [FeeRefundStatusType.Processing]: 'Processing',
  [FeeRefundStatusType.Processed]: 'Processed',
  [FeeRefundStatusType.Failed]: 'Failed',
  [FeeRefundStatusType.Reversed]: 'Reversed',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1,
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<{ sx?: Record<string, unknown> }>, {
        sx: { fontSize: 18 },
      })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        component="p"
        sx={{
          color: 'text.secondary',
          display: 'block',
          mb: 0.2,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.65rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        component="p"
        sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentRefundInfo({
  student,
  status,
}: {
  student: IStudentFeeData;
  status?: number;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify
            icon="solar:users-group-rounded-bold-duotone"
            width={18}
            sx={{ color: 'primary.main' }}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Student Information
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Details of the selected student
            </Typography>
          </Box>
        </Stack>
        {status !== undefined && (
          <Label
            color={FeeRefundStatusTypeColors[status as FeeRefundStatusType] as any}
            variant="soft"
            sx={{ textTransform: 'capitalize', fontWeight: 700 }}
          >
            {statusLabel[status as FeeRefundStatusType] ?? 'Unknown'}
          </Label>
        )}
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3}>
        {/* Student Name */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:user-bold" />}
            label="Student Name"
            value={`${student?.name}${student?.grNo ? ` (${student.grNo})` : ''}`}
          />
        </Grid>

        {/* Roll No */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:hashtag-bold" />}
            label="Roll No."
            value={student?.rollNo}
          />
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:bookmark-opened-bold" />}
            label="Class/Division"
            value={`${student?.class || 'N/A'} - ${student?.division || 'N/A'}`}
          />
        </Grid>

        {/* Board */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:globus-bold" />}
            label="Board"
            value={student?.board}
          />
        </Grid>

        {/* Medium */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:letter-bold" />}
            label="Medium"
            value={student?.medium}
          />
        </Grid>

        {/* Total Paid Fees */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:hand-money-bold" />}
            label="Total Paid Fees"
            value={student?.totalPaidFees ? formatNumber(student.totalPaidFees, 'INR') : '₹ 0'}
          />
        </Grid>

        {/* Total Pending Fees */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Iconify icon="solar:wad-of-money-bold" />}
            label="Total Pending Fees"
            value={
              student?.totalPendingFees ? formatNumber(student.totalPendingFees, 'INR') : '₹ 0'
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
