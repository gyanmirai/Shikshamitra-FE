'use client';

import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
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
  const conflict = formik.status?.nameConflict;
  const nameError =
    (conflict?.name === formik.values.paymentTermName && conflict.message) ||
    (formik.touched.paymentTermName && formik.errors.paymentTermName);

  return (
    <FormSectionCard
      icon={GlobalIcons.notebook}
      descriptionTooltip="Draft keeps the schedule editable. Active publishes the current version for use by Fee Structures. Only active terms can be the board default."
      title="General Information"
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      sx={{ minWidth: 0 }}
    >
      <Grid container spacing={2}>
        {/* Name */}
        <Grid size={{ xs: 12, sm: 8, md: 6 }}>
          <ShakingTextField error={Boolean(nameError)}>
            <TextField
              fullWidth
              size="small"
              label="Payment term name *"
              name="paymentTermName"
              placeholder="e.g. Monthly installments"
              value={formik.values.paymentTermName || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(nameError)}
              helperText={nameError}
              inputProps={{ maxLength: 100 }}
            />
          </ShakingTextField>
        </Grid>

        {/* Editable lifecycle status — archive remains a guarded table action. */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <ShakingTextField error={Boolean(formik.touched.status && formik.errors.status)}>
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
              <FormHelperText>
                {(formik.touched.status && formik.errors.status) || undefined}
              </FormHelperText>
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Board */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <ShakingTextField error={Boolean(formik.touched.boardId && formik.errors.boardId)}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.boardId && Boolean(formik.errors.boardId)}
            >
              <InputLabel id="payment-term-board-label">Board *</InputLabel>
              <Select
                label="Board *"
                labelId="payment-term-board-label"
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
              <FormHelperText>
                {(formik.touched.boardId && formik.errors.boardId) || undefined}
              </FormHelperText>
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12, sm: 8, md: 8 }}>
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
            helperText={formik.errors.description}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Default Term toggle */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            data-testid="default-payment-term-toggle"
            sx={{
              px: 1.5,
              py: 1.5,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <FormControlLabel
              sx={{ m: 0, gap: 0.5 }}
              control={
                <Switch
                  size="small"
                  checked={formik.values.isDefaultTerm}
                  disabled={defaultSelectionDisabled}
                  onChange={(event) => formik.setFieldValue('isDefaultTerm', event.target.checked)}
                />
              }
              label={
                <Box ml={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    Default Payment Term
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
