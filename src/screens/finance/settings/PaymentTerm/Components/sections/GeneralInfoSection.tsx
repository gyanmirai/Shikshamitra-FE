'use client';

import type { FormikProps } from 'formik';

import {
  Box,
  Card,
  Grid,
  Select,
  Switch,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';

import type { IPaymentTerm } from '../../type';
import type { IBoard } from '../../hooks/usePaymentTermForm';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GeneralInfoSectionProps {
  formik: FormikProps<IPaymentTerm>;
  boards: IBoard[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GeneralInfoSection({ formik, boards }: GeneralInfoSectionProps) {
  const defaultSelectionDisabled = formik.values.status !== 'Active';

  return (
    <SectionCard
      title="General Information"
      subtitle="Identify the schedule and optionally make it the board default after publishing."
      info="Draft keeps the schedule editable. Active publishes the current version for use by Fee Structures."
    >
      <Grid container spacing={2.5}>
        {/* Board */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.boardId && Boolean(formik.errors.boardId)}
          >
            <InputLabel>Board *</InputLabel>
            <Select
              label="Board *"
              name="boardId"
              value={formik.values.boardId}
              disabled={Boolean(formik.values.id)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {boards.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.boardId && formik.errors.boardId && (
              <FormHelperText>{formik.errors.boardId}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Editable lifecycle status — archive remains a guarded table action. */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <InputLabel id="payment-term-status-label">Status *</InputLabel>
            <Select
              labelId="payment-term-status-label"
              label="Status *"
              name="status"
              value={formik.values.status === 'Archived' ? 'Draft' : formik.values.status}
              onChange={(event) => {
                const status = event.target.value as 'Draft' | 'Active';
                formik.setFieldValue('status', status);
                if (status !== 'Active') {
                  formik.setFieldValue('isDefaultTerm', false);
                }
              }}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Name */}
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Payment Term Name *"
            name="paymentTermName"
            placeholder="e.g. Monthly Installments — 2025-26"
            value={formik.values.paymentTermName || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.paymentTermName && Boolean(formik.errors.paymentTermName)}
            helperText={
              (formik.touched.paymentTermName && formik.errors.paymentTermName) ||
              `${(formik.values.paymentTermName || '').length}/100`
            }
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Description"
            name="description"
            placeholder="Briefly describe this payment term's purpose and coverage..."
            value={formik.values.description || ''}
            onChange={formik.handleChange}
            error={Boolean(formik.errors.description)}
            helperText={
              formik.errors.description || `${(formik.values.description || '').length}/500`
            }
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Default Term toggle */}
        <Grid size={{ xs: 12 }}>
          <Card
            data-testid="default-payment-term-toggle"
            variant="outlined"
            sx={{
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              bgcolor: formik.values.isDefaultTerm ? 'primary.lighter' : 'transparent',
              borderColor: formik.values.isDefaultTerm ? 'primary.main' : 'divider',
              transition: 'all 0.2s ease',
              cursor: defaultSelectionDisabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => {
              if (!defaultSelectionDisabled) {
                formik.setFieldValue('isDefaultTerm', !formik.values.isDefaultTerm);
              }
            }}
          >
            <FormControlLabel
              sx={{ m: 0, pointerEvents: 'none' }}
              control={
                <Switch
                  size="small"
                  checked={formik.values.isDefaultTerm}
                  disabled={defaultSelectionDisabled}
                  onChange={() => {}}
                />
              }
              label={
                <Box ml={0.5}>
                  <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                    Default Payment Term
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    fontSize="0.68rem"
                  >
                    {defaultSelectionDisabled
                      ? 'Only an Active payment term can be the default.'
                      : 'Only one default is allowed per board. Selecting this replaces that board’s previous default.'}
                  </Typography>
                </Box>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
