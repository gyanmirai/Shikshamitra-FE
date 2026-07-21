'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import { Box, Grid, Card, Stack, Divider, TextField, Typography } from '@mui/material';

interface LateFeePreviewSectionProps {
  formik: any;
  calcFeeDue: number;
  setCalcFeeDue: (val: number) => void;
  calcPaidAfterDays: number;
  setCalcPaidAfterDays: (val: number) => void;
  calcLateFeeResult: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeePreviewSection({
  formik,
  calcFeeDue,
  setCalcFeeDue,
  calcPaidAfterDays,
  setCalcPaidAfterDays,
  calcLateFeeResult,
  expanded,
  onToggle,
}: LateFeePreviewSectionProps) {
  return (
    <CustomAccordion
      title="7. Policy Preview & Interactive Calculator"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Stack spacing={3} p={2}>
          {/* Summary grid */}
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Rules Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Grace Period:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formik.values.gracePeriodDays} days
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Late Fee Type:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formik.values.lateFeeType}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Waiver Allowed:
                </Typography>
                <Typography variant="body2">
                  {formik.values.waiverAllowed ? 'Yes' : 'No'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Charge Creation:
                </Typography>
                <Typography variant="body2">
                  {formik.values.willCreateCharge ? 'Automatic' : 'Manual / None'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Calculator area */}
          <Box>
            <Typography variant="subtitle2" color="primary" mb={2}>
              Live Overdue Fine Calculator
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Fee Due Amount (₹)"
                  value={calcFeeDue}
                  onChange={(e) => setCalcFeeDue(Math.max(0, +e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Days Paid After Due Date"
                  value={calcPaidAfterDays}
                  onChange={(e) => setCalcPaidAfterDays(Math.max(0, +e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  variant="outlined"
                  sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Calculated Late Fee:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    ₹{calcLateFeeResult.toFixed(2)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Receipt Preview */}
          <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2, borderRadius: 2 }}>
            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              mb={1}
              sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Receipt Display Preview
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Tuition / Original Fee:</Typography>
                <Typography variant="body2">₹{calcFeeDue.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="error.main">
                  Late Overdue Fee Penalty:
                </Typography>
                <Typography variant="body2" color="error.main">
                  ₹{calcLateFeeResult.toFixed(2)}
                </Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" fontWeight={700}>
                <Typography variant="body2">Total Paid:</Typography>
                <Typography variant="body2">
                  ₹{(calcFeeDue + calcLateFeeResult).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      }
    />
  );
}
