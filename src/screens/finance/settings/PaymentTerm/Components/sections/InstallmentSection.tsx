'use client';

import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Add, Delete, ContentCopy } from '@mui/icons-material';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';

import type { IPaymentTerm } from '../../type';
import type { IBoard } from '../../hooks/usePaymentTermForm';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface InstallmentSectionProps {
  formik: FormikProps<IPaymentTerm>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  board?: IBoard;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function InstallmentSection({
  formik,
  onAdd,
  onRemove,
  onDuplicate,
  board,
}: InstallmentSectionProps) {
  const allocationTotal = formik.values.installments.reduce(
    (sum, i) => sum + (Number(i.allocationPercentage) || 0),
    0
  );
  const allocationDelta = Math.round((100 - allocationTotal) * 100) / 100;
  const usesSpecificDate = formik.values.demandGenerationRule === 'SpecificDate';

  const getBillGenerationDate = (inst: IPaymentTerm['installments'][number]) => {
    if (usesSpecificDate) return parseDateOnly(inst.demandDate);
    if (formik.values.demandGenerationRule === 'OnInstallmentStartDate') {
      return parseDateOnly(inst.startDate);
    }
    if (formik.values.demandGenerationRule === 'OnDueDate') {
      return parseDateOnly(inst.dueDate);
    }
    if (formik.values.demandGenerationRule === 'XDaysBeforeDue' && inst.dueDate) {
      return (
        parseDateOnly(inst.dueDate)?.subtract(formik.values.demandOffsetDays ?? 0, 'day') ?? null
      );
    }
    return null;
  };

  return (
    <SectionCard
      title="Installment Schedule"
      subtitle="Define each installment period, due date, and percentage allocation (must total 100%)."
      info="Every installment start, end, and due date must fall inside the selected board period. Periods cannot overlap and allocations must total 100%."
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
      {board?.startDate && board?.endDate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Installment periods must be between {dayjs(board.startDate).format('DD/MM/YYYY')} and{' '}
          {dayjs(board.endDate).format('DD/MM/YYYY')} for {board.name}.
        </Alert>
      )}

      {/* Array-level error */}
      {formik.touched.installments && typeof formik.errors.installments === 'string' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formik.errors.installments}
        </Alert>
      )}

      {formik.values.installments.length > 0 && (
        <Alert severity={Math.abs(allocationDelta) <= 0.01 ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {Math.abs(allocationDelta) <= 0.01
            ? `Allocation totals 100% across ${formik.values.installments.length} installment(s).`
            : allocationDelta > 0
              ? `Allocation totals ${allocationTotal.toFixed(2)}%; ${allocationDelta.toFixed(2)}% remains unassigned.`
              : `Allocation totals ${allocationTotal.toFixed(2)}%; reduce by ${Math.abs(allocationDelta).toFixed(2)}%.`}
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
            Add installments to define when payments are due within the selected board period.
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Start Date *"
                    format="DD/MM/YYYY"
                    value={parseDateOnly(inst.startDate)}
                    minDate={parseDateOnly(board?.startDate) ?? undefined}
                    maxDate={parseDateOnly(board?.endDate) ?? undefined}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.startDate`, toDateOnly(date) || null)
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
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="End Date *"
                    format="DD/MM/YYYY"
                    value={parseDateOnly(inst.endDate)}
                    minDate={parseDateOnly(board?.startDate) ?? undefined}
                    maxDate={parseDateOnly(board?.endDate) ?? undefined}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.endDate`, toDateOnly(date) || null)
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

                {/* Bill generation date: entered only for the specific-date rule. */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label={usesSpecificDate ? 'Bill Generation Date *' : 'Bill Generation Date'}
                    format="DD/MM/YYYY"
                    value={getBillGenerationDate(inst)}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.demandDate`, toDateOnly(date) || null)
                    }
                    disabled={!usesSpecificDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: Boolean(errObj?.demandDate),
                        helperText:
                          errObj?.demandDate ||
                          (!usesSpecificDate ? 'Calculated from the billing schedule' : undefined),
                      },
                    }}
                  />
                </Grid>

                {/* Due Date */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Due Date *"
                    format="DD/MM/YYYY"
                    value={parseDateOnly(inst.dueDate)}
                    minDate={parseDateOnly(board?.startDate) ?? undefined}
                    maxDate={parseDateOnly(board?.endDate) ?? undefined}
                    onChange={(date) =>
                      formik.setFieldValue(`${prefix}.dueDate`, toDateOnly(date) || null)
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

                {/* Allocation % */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Allocation % *"
                    name={`${prefix}.allocationPercentage`}
                    value={inst.allocationPercentage ?? ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(errObj?.allocationPercentage)}
                    helperText={errObj?.allocationPercentage}
                    inputProps={{ min: 0.01, max: 100, step: 'any' }}
                  />
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
