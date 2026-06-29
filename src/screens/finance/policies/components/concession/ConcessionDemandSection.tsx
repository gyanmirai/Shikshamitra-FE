'use client';

/**
 * ConcessionDemandSection — Card 5
 * Existing Demand, Receipt Behaviour, Late Fee Behaviour, Demand Status
 */

import React from 'react';
import { Grid, Select, MenuItem, InputLabel, FormControl, FormHelperText } from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const EXISTING_DEMAND_OPTIONS = [
  { value: 'RecalculateAutomatically', label: 'Recalculate Automatically' },
  { value: 'RecalculateFutureOnly', label: 'Recalculate Future Demands Only' },
  { value: 'ManualRecalculation', label: 'Manual Recalculation Required' },
  { value: 'KeepExisting', label: 'Keep Existing Demands As-Is' },
];

const RECEIPT_BEHAVIOUR_OPTIONS = [
  { value: 'KeepOriginalReceipt', label: 'Keep Original Receipt' },
  { value: 'GenerateAdjustmentReceipt', label: 'Generate Adjustment Receipt' },
  { value: 'ReverseOriginalReceipt', label: 'Reverse Original Receipt' },
];

const LATE_FEE_BEHAVIOUR_OPTIONS = [
  { value: 'Recalculate', label: 'Recalculate Late Fee' },
  { value: 'KeepExisting', label: 'Keep Existing Late Fee' },
  { value: 'RemoveLateFee', label: 'Remove Late Fee' },
];

const DEMAND_STATUS_OPTIONS = [
  { value: 'UpdateImmediately', label: 'Update Demand Immediately on Apply' },
  { value: 'UpdateAfterApproval', label: 'Update Demand After Approval' },
];

interface ConcessionDemandSectionProps {
  formik: any;
}

export default function ConcessionDemandSection({ formik }: ConcessionDemandSectionProps) {
  return (
    <ConcessionSectionCard
      title="Demand Behaviour"
      subtitle="Control how existing demand records, receipts, and late fees respond when this concession is applied."
    >
      <Grid container spacing={3}>
        {/* Existing Demand */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Existing Demand</InputLabel>
            <Select
              label="Existing Demand"
              name="existingDemand"
              value={formik.values.existingDemand}
              onChange={formik.handleChange}
            >
              {EXISTING_DEMAND_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>How already-generated demand records should behave</FormHelperText>
          </FormControl>
        </Grid>

        {/* Demand Status */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Demand Status Update</InputLabel>
            <Select
              label="Demand Status Update"
              name="demandStatus"
              value={formik.values.demandStatus}
              onChange={formik.handleChange}
            >
              {DEMAND_STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>When the demand record gets updated in the system</FormHelperText>
          </FormControl>
        </Grid>

        {/* Already Generated Receipts */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Already Generated Receipts</InputLabel>
            <Select
              label="Already Generated Receipts"
              name="receiptBehaviour"
              value={formik.values.receiptBehaviour}
              onChange={formik.handleChange}
            >
              {RECEIPT_BEHAVIOUR_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Action to take on receipts already issued for this student
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Late Fee Behaviour */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Late Fee Behaviour</InputLabel>
            <Select
              label="Late Fee Behaviour"
              name="lateFeeBehaviour"
              value={formik.values.lateFeeBehaviour}
              onChange={formik.handleChange}
            >
              {LATE_FEE_BEHAVIOUR_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>What happens to late fees when concession is applied</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </ConcessionSectionCard>
  );
}
