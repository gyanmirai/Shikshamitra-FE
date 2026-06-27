'use client';

import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Add, Delete, ContentCopy } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Button,
  Select,
  Switch,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';

import type { IPaymentTerm } from '../../type';
import type { ILateFeePolicy } from '../../hooks/usePaymentTermForm';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface InstallmentSectionProps {
  formik: FormikProps<IPaymentTerm>;
  lateFeePolicies: ILateFeePolicy[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function InstallmentSection({
  formik,
  lateFeePolicies,
  onAdd,
  onRemove,
  onDuplicate,
}: InstallmentSectionProps) {
  return (
    <SectionCard
      title="Installment Schedule"
      subtitle="Define payment installments with start dates, due dates, and policies."
      action={
        <Button
          size="small"
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          sx={{ flexShrink: 0 }}
        >
          Add Installment
        </Button>
      }
    >
      {/* Array-level error */}
      {formik.touched.installments && typeof formik.errors.installments === 'string' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.errors.installments}
        </Alert>
      )}

      {/* Empty state */}
      {formik.values.installments.length === 0 && (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            py: 5,
            px: 3,
            textAlign: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
            No installments configured
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" mb={2}>
            Add installments to define when payments are due across the academic year.
          </Typography>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAdd}>
            Add First Installment
          </Button>
        </Box>
      )}

      {/* Installment cards */}
      <Stack spacing={2}>
        {formik.values.installments.map((inst, index) => {
          const prefix = `installments[${index}]`;
          const errObj = (
            Array.isArray(formik.errors.installments) && formik.errors.installments[index]
              ? formik.errors.installments[index]
              : {}
          ) as Record<string, string>;
          const hasError = Object.keys(errObj).length > 0;

          return (
            <Card
              key={`inst-${index}`}
              variant="outlined"
              sx={{
                p: 2,
                borderColor: hasError ? 'error.light' : 'divider',
                transition: 'border-color 0.2s',
                borderRadius: 1.5,
              }}
            >
              {/* Card header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: 1 }}
                  />
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {inst.installmentName || 'Unnamed Installment'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Duplicate" arrow>
                    <IconButton size="small" onClick={() => onDuplicate(index)}>
                      <ContentCopy sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete installment" arrow>
                    <IconButton size="small" color="error" onClick={() => onRemove(index)}>
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Grid container spacing={2}>
                {/* Installment Name */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Installment Name *"
                    name={`${prefix}.installmentName`}
                    value={inst.installmentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(errObj?.installmentName)}
                    helperText={errObj?.installmentName}
                  />
                </Grid>

                {/* Start Date */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <DatePicker
                    label="Start Date *"
                    value={inst.startDate ? dayjs(inst.startDate as string) : null}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.startDate`, date ? date.toISOString() : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: Boolean(errObj?.startDate),
                        helperText: errObj?.startDate,
                      },
                    }}
                  />
                </Grid>

                {/* End Date */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <DatePicker
                    label="End Date *"
                    value={inst.endDate ? dayjs(inst.endDate as string) : null}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.endDate`, date ? date.toISOString() : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: Boolean(errObj?.endDate),
                        helperText: errObj?.endDate,
                      },
                    }}
                  />
                </Grid>

                {/* Due Date */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <DatePicker
                    label="Due Date *"
                    value={inst.dueDate ? dayjs(inst.dueDate as string) : null}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.dueDate`, date ? date.toISOString() : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: Boolean(errObj?.dueDate),
                        helperText: errObj?.dueDate,
                      },
                    }}
                  />
                </Grid>

                {/* Grace Days */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Grace Days"
                    name={`${prefix}.gracePeriod`}
                    value={inst.gracePeriod ?? 0}
                    onChange={formik.handleChange}
                    inputProps={{ min: 0 }}
                    helperText="Days after due date"
                    error={Boolean(errObj?.gracePeriod)}
                  />
                </Grid>

                {/* Late Fee Policy */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Late Fee Policy</InputLabel>
                    <Select
                      label="Late Fee Policy"
                      name={`${prefix}.lateFeePolicyId`}
                      value={inst.lateFeePolicyId ?? ''}
                      onChange={(e) => {
                        const pId = e.target.value;
                        const pObj = lateFeePolicies.find((p) => p.id === pId);
                        formik.setFieldValue(`${prefix}.lateFeePolicyId`, pId);
                        formik.setFieldValue(`${prefix}.lateFeePolicyName`, pObj?.policyName ?? '');
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {lateFeePolicies.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.policyName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Feature toggles */}
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Stack direction="row" flexWrap="wrap" gap={0} mt={0.5}>
                    <FormControlLabel
                      sx={{ mr: 1.5, mb: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={inst.demandEnabled}
                          onChange={(e) =>
                            formik.setFieldValue(`${prefix}.demandEnabled`, e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="caption" fontSize="0.7rem">
                          Generate Demand
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      sx={{ mr: 1.5, mb: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={inst.reminderEnabled}
                          onChange={(e) =>
                            formik.setFieldValue(`${prefix}.reminderEnabled`, e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="caption" fontSize="0.7rem">
                          Send Reminder
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      sx={{ mb: 0 }}
                      control={
                        <Switch
                          size="small"
                          checked={inst.allowPartialOverride}
                          onChange={(e) =>
                            formik.setFieldValue(`${prefix}.allowPartialOverride`, e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography variant="caption" fontSize="0.7rem">
                          Allow Partial
                        </Typography>
                      }
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          );
        })}
      </Stack>

      {/* Add another button */}
      {formik.values.installments.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={onAdd}
            color="primary"
            sx={{ borderStyle: 'dashed' }}
            variant="outlined"
          >
            Add Another Installment
          </Button>
        </Box>
      )}
    </SectionCard>
  );
}
