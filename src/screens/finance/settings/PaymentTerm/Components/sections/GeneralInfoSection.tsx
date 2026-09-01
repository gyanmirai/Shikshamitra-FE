'use client';

import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Grid,
  Select,
  Switch,
  Tooltip,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  FormHelperText,
  InputAdornment,
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
  codeManuallyEdited: boolean;
  setCodeManuallyEdited: (v: boolean) => void;
  isDefaultSelectionLocked?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GeneralInfoSection({
  formik,
  boards,
  codeManuallyEdited,
  setCodeManuallyEdited,
  isDefaultSelectionLocked = false,
}: GeneralInfoSectionProps) {
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
            <InputLabel>Status *</InputLabel>
            <Select
              label="Status *"
              name="status"
              value={formik.values.status === 'Archived' ? 'Draft' : formik.values.status}
              onChange={(event) => {
                const status = event.target.value as 'Draft' | 'Active';
                formik.setFieldValue('status', status);
              }}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
            {!formik.errors.status && (
              <FormHelperText>
                {formik.values.status === 'Active'
                  ? 'Submitting publishes this version for fee-structure use.'
                  : 'Drafts remain unavailable for new fee-structure assignments.'}
              </FormHelperText>
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

        {/* Code */}
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            fullWidth
            size="small"
            label="Payment Term Code"
            name="paymentTermCode"
            value={formik.values.paymentTermCode || ''}
            onChange={(e) => {
              setCodeManuallyEdited(true);
              formik.setFieldValue(
                'paymentTermCode',
                e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
              );
            }}
            error={formik.touched.paymentTermCode && Boolean(formik.errors.paymentTermCode)}
            helperText={
              formik.touched.paymentTermCode && formik.errors.paymentTermCode
                ? formik.errors.paymentTermCode
                : codeManuallyEdited
                  ? 'Custom code set'
                  : 'Auto-generated from name'
            }
            InputProps={{
              endAdornment: codeManuallyEdited && (
                <InputAdornment position="end">
                  <Tooltip title="Reset to auto-generated" arrow>
                    <IconButton size="small" onClick={() => setCodeManuallyEdited(false)}>
                      <Iconify icon="mdi:refresh" width={14} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              sx: { fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.04em' },
            }}
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
              cursor: isDefaultSelectionLocked ? 'not-allowed' : 'pointer',
            }}
            onClick={() => {
              if (!isDefaultSelectionLocked) {
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
                  disabled={isDefaultSelectionLocked}
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
                    {isDefaultSelectionLocked
                      ? 'This is the current board default. Select another payment term as default to replace it.'
                      : 'Only one default is allowed per board. Selecting this replaces the previous default.'}
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
