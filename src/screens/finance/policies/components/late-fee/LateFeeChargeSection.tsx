'use client';

import React from 'react';
import CustomAccordion from 'src/components/custom-accordian';
import {
  Grid,
  Switch,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import HeadSelector from '../../../components/HeadSelector';

// Mock lists for charge generation
const MOCK_CHARGE_CATEGORIES = [
  { id: 'cat-1', name: 'Late Fee Penalties' },
  { id: 'cat-2', name: 'Miscellaneous Charges' },
];

const MOCK_CHARGE_HEADS = [
  { id: 'head-1', name: 'Late Registration Fine' },
  { id: 'head-2', name: 'Overdue Installment Fine' },
];

const MOCK_LEDGERS = [
  { id: 'ledger-1', name: 'Late Fee Income Ledger' },
  { id: 'ledger-2', name: 'General Penalties Ledger' },
];

interface LateFeeChargeSectionProps {
  formik: any;
  expanded: boolean;
  onToggle: () => void;
}

export default function LateFeeChargeSection({
  formik,
  expanded,
  onToggle,
}: LateFeeChargeSectionProps) {
  return (
    <CustomAccordion
      title="5. Charge Generation & Ledger Mapping"
      expanded={expanded}
      onChange={onToggle}
      isActive={expanded}
      content={
        <Grid container spacing={2.5} p={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.willCreateCharge}
                  onChange={(e) => formik.setFieldValue('willCreateCharge', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Create separate transaction charges for penalties
                </Typography>
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.separateChargeEntry}
                  onChange={(e) => formik.setFieldValue('separateChargeEntry', e.target.checked)}
                />
              }
              label={<Typography variant="body2">Show separate ledger line item entry</Typography>}
            />
          </Grid>

          {formik.values.willCreateCharge && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Charge Category</InputLabel>
                  <Select
                    label="Charge Category"
                    name="chargeCategoryId"
                    value={formik.values.chargeCategoryId}
                    onChange={formik.handleChange}
                  >
                    {MOCK_CHARGE_CATEGORIES.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.chargeHeadId && Boolean(formik.errors.chargeHeadId)}
                >
                  <InputLabel>Charge Head *</InputLabel>
                  <Select
                    label="Charge Head *"
                    name="chargeHeadId"
                    value={formik.values.chargeHeadId}
                    onChange={formik.handleChange}
                  >
                    {MOCK_CHARGE_HEADS.map((h) => (
                      <MenuItem key={h.id} value={h.id}>
                        {h.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.chargeHeadId && formik.errors.chargeHeadId && (
                    <Typography variant="caption" color="error.main" mt={0.5} display="block">
                      {formik.errors.chargeHeadId as string}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <HeadSelector
                  headType="Income"
                  label="Late-Fee Income Head"
                  value={formik.values.lateFeeIncomeHeadId}
                  onChange={(val) => formik.setFieldValue('lateFeeIncomeHeadId', val)}
                  error={
                    formik.touched.lateFeeIncomeHeadId && Boolean(formik.errors.lateFeeIncomeHeadId)
                  }
                  helperText={
                    formik.touched.lateFeeIncomeHeadId &&
                    (formik.errors.lateFeeIncomeHeadId as string)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ledger Account Mapping</InputLabel>
                  <Select
                    label="Ledger Account Mapping"
                    name="ledgerMappingId"
                    value={formik.values.ledgerMappingId}
                    onChange={formik.handleChange}
                  >
                    {MOCK_LEDGERS.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.showOnReceipt}
                  onChange={(e) => formik.setFieldValue('showOnReceipt', e.target.checked)}
                />
              }
              label={<Typography variant="body2">Show Late Fee on Receipts</Typography>}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.showInParentPortal}
                  onChange={(e) => formik.setFieldValue('showInParentPortal', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Display pending fines in Parent/Student Portal
                </Typography>
              }
            />
          </Grid>
        </Grid>
      }
    />
  );
}
