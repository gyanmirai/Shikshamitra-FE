'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Stack, Divider, Typography } from '@mui/material';

interface LateFeeSummaryPanelProps {
  formik: any;
  academicYears: any[];
  calcLateFeeResult: number;
  calcFeeDue: number;
  calcPaidAfterDays: number;
}

export default function LateFeeSummaryPanel({
  formik,
  academicYears,
  calcLateFeeResult,
  calcFeeDue,
  calcPaidAfterDays,
}: LateFeeSummaryPanelProps) {
  return (
    <Box
      sx={{
        width: 320,
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
        p: 3,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
        Quick Review Summary
      </Typography>

      <Stack spacing={2} sx={{ mt: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Policy Name
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formik.values.policyName || 'Untitled Policy'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Academic Year
          </Typography>
          <Typography variant="body2">
            {academicYears?.find((y: any) => y.id === formik.values.academicYearId)?.name || '-'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Grace Period
          </Typography>
          <Typography variant="body2">{formik.values.gracePeriodDays} days</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Calculation Method
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formik.values.lateFeeType}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Status
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color={formik.values.status === 'Active' ? 'success.main' : 'warning.main'}
          >
            {formik.values.status}
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Waiver Allowed
          </Typography>
          <Typography variant="body2">
            {formik.values.waiverAllowed
              ? `Allowed (Max: ${formik.values.maximumWaiverPercentage || 100}%)`
              : 'Blocked'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Effective Period
          </Typography>
          <Typography variant="caption" display="block">
            From:{' '}
            {formik.values.effectiveFrom
              ? dayjs(formik.values.effectiveFrom).format('DD/MM/YYYY')
              : '-'}
          </Typography>
          <Typography variant="caption" display="block">
            To:{' '}
            {formik.values.effectiveTo
              ? dayjs(formik.values.effectiveTo).format('DD/MM/YYYY')
              : '-'}
          </Typography>
        </Box>

        <Divider />

        <Box
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Example Calc Result:
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="error.main">
            ₹{calcLateFeeResult.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            (Fee: ₹{calcFeeDue}, Overdue: {calcPaidAfterDays} days)
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
