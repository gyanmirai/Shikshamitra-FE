'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Divider,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SectionCard } from './RefundCommon';

import type { RefundPolicySimulationResponse } from 'src/redux/finance/refundPolicy';
import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';

interface RefundSimulationSectionProps {
  policyId?: string;
  formik: { values: IRefundPolicyFormValues };
  simulationInput: {
    settledPaidAmount: number;
    priorProcessedRefund: number;
    activeReservation: number;
    studentYearRefundedOrReserved: number;
    requestedAmount: number;
  };
  setSimulationInput: React.Dispatch<
    React.SetStateAction<{
      settledPaidAmount: number;
      priorProcessedRefund: number;
      activeReservation: number;
      studentYearRefundedOrReserved: number;
      requestedAmount: number;
    }>
  >;
  serverSimulation?: RefundPolicySimulationResponse;
  isSimulating: boolean;
  onRunSimulation: () => void;
}

export default function RefundSimulationSection({
  policyId,
  formik,
  simulationInput,
  setSimulationInput,
  serverSimulation,
  isSimulating,
  onRunSimulation,
}: RefundSimulationSectionProps) {
  const { values } = formik;

  const handleInputChange = (field: keyof typeof simulationInput, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setSimulationInput((prev) => ({ ...prev, [field]: num }));
  };

  return (
    <SectionCard
      title="Server Calculation Simulator"
      subtitle="Verify policy calculation rules against the backend calculation engine. These simulations run in sandbox mode and do not generate ledger entries."
      icon="solar:play-circle-bold-duotone"
      action={
        <LoadingButton
          size="small"
          variant="contained"
          loading={isSimulating}
          disabled={!policyId}
          onClick={onRunSimulation}
          startIcon={<Iconify icon="solar:play-bold" width={16} height={16} />}
        >
          Execute Simulation
        </LoadingButton>
      }
    >
      {!policyId ? (
        <Alert severity="info" sx={{ borderRadius: 1.25 }}>
          Save this policy first to test it with the backend server simulation service. In the meantime, the Live Summary panel on the right provides immediate client-side previews.
        </Alert>
      ) : (
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            {/* Settled Paid Amount */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Settled Paid Amount"
                value={simulationInput.settledPaidAmount || ''}
                onChange={(e) => handleInputChange('settledPaidAmount', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0 },
                  },
                }}
                helperText="Total verified money collected"
              />
            </Grid>

            {/* Previously Processed Refund */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Prior Processed Refund"
                value={simulationInput.priorProcessedRefund || ''}
                onChange={(e) => handleInputChange('priorProcessedRefund', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0 },
                  },
                }}
                helperText="Already disbursed vouchers"
              />
            </Grid>

            {/* Active Refund Reservation */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Active Reservation"
                value={simulationInput.activeReservation || ''}
                onChange={(e) => handleInputChange('activeReservation', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0 },
                  },
                }}
                helperText="Approved/In-flight requests"
              />
            </Grid>

            {/* Student/Year Used Amount */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Student/Year Used Amount"
                value={simulationInput.studentYearRefundedOrReserved || ''}
                onChange={(e) =>
                  handleInputChange('studentYearRefundedOrReserved', e.target.value)
                }
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0 },
                  },
                }}
                helperText="Prior refunds in academic year"
              />
            </Grid>

            {/* Requested Amount (when Manual mode) */}
            {values.amountMode === 'ManualUpToEligible' && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Requested Amount"
                  value={simulationInput.requestedAmount || ''}
                  onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      inputProps: { min: 0.01 },
                    },
                  }}
                  helperText="User-requested voucher value"
                />
              </Grid>
            )}
          </Grid>

          {/* Simulation Output Card */}
          {serverSimulation && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.03),
                borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Iconify icon="solar:check-circle-bold" color="success.main" width={20} height={20} />
                <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                  Server Calculation Result
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Remaining Eligible Base
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      ₹{serverSimulation.remainingEligible.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Gross Calculated
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      ₹{serverSimulation.rawRefund.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Typography variant="caption" color="error.main" display="block">
                      Deduction Applied
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="error.main">
                      -₹{serverSimulation.deductionAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Typography variant="caption" color="success.dark" display="block" fontWeight={600}>
                      Final Net Refund
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="success.main">
                      ₹{serverSimulation.finalRefund.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {serverSimulation.explanation && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}
                >
                  <strong>Server Explanation:</strong> {serverSimulation.explanation}
                </Typography>
              )}
            </Paper>
          )}
        </Stack>
      )}
    </SectionCard>
  );
}
