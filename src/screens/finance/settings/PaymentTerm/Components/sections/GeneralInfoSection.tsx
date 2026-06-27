'use client';

import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Grid,
  Stack,
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
// Status dot colour map (kept local — only used here)
// ---------------------------------------------------------------------------
const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Draft: '#f59e0b',
  Archived: '#94a3b8',
  Inactive: '#94a3b8',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GeneralInfoSectionProps {
  formik: FormikProps<IPaymentTerm>;
  boards: IBoard[];
  codeManuallyEdited: boolean;
  setCodeManuallyEdited: (v: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GeneralInfoSection({
  formik,
  boards,
  codeManuallyEdited,
  setCodeManuallyEdited,
}: GeneralInfoSectionProps) {
  return (
    <SectionCard
      title="General Information"
      subtitle="Name, code, description, status, and default flag."
    >
      <Grid container spacing={2.5}>
        {/* Board */}
        <Grid size={{ xs: 12, sm: 5 }}>
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

        {/* Name */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <TextField
            fullWidth
            size="small"
            label="Payment Term Name *"
            name="paymentTermName"
            placeholder="e.g. Monthly Installments — 2025-26"
            value={formik.values.paymentTermName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.paymentTermName && Boolean(formik.errors.paymentTermName)}
            helperText={
              (formik.touched.paymentTermName && formik.errors.paymentTermName) ||
              `${formik.values.paymentTermName.length}/100`
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
            value={formik.values.paymentTermCode}
            onChange={(e) => {
              setCodeManuallyEdited(true);
              formik.setFieldValue(
                'paymentTermCode',
                e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
              );
            }}
            helperText={codeManuallyEdited ? 'Custom code set' : 'Auto-generated from name'}
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
            value={formik.values.description}
            onChange={formik.handleChange}
            error={Boolean(formik.errors.description)}
            helperText={
              formik.errors.description || `${(formik.values.description || '').length}/500`
            }
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12 }}>
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <InputLabel>Status *</InputLabel>
            <Select
              label="Status *"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              {(['Active', 'Archived'] as const).map((s) => (
                <MenuItem key={s} value={s}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: STATUS_COLORS[s] ?? 'text.disabled',
                        flexShrink: 0,
                      }}
                    />
                    {s}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {formik.touched.status && formik.errors.status && (
              <Typography variant="caption" color="error.main" mt={0.5} display="block">
                {formik.errors.status}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Default Term toggle */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              bgcolor: formik.values.isDefaultTerm ? 'primary.lighter' : 'transparent',
              borderColor: formik.values.isDefaultTerm ? 'primary.main' : 'divider',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => formik.setFieldValue('isDefaultTerm', !formik.values.isDefaultTerm)}
          >
            <FormControlLabel
              sx={{ m: 0, pointerEvents: 'none' }}
              control={
                <Switch size="small" checked={formik.values.isDefaultTerm} onChange={() => {}} />
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
                    Auto-selected when no specific term is chosen
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
