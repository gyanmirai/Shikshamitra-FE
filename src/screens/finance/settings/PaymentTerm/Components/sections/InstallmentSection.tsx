'use client';

import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Add, Delete } from '@mui/icons-material';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Button,
  Tooltip,
  Switch,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
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
  board?: IBoard;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function InstallmentSection({
  formik,
  onAdd,
  onRemove,
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
              <Grid container spacing={2}>
                {/* Sequence */}
                <Grid size={{ xs: 2, sm: 1 }} sx={{ pt: 1 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, borderRadius: 1 }}
                  />
                </Grid>

                {/* Installment Name */}
                <Grid size={{ xs: 10, sm: 4 }}>
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

                {/* Coverage Period */}
                <Grid size={{ xs: 10, sm: 6 }}>
                  <CustomDateRangePicker
                    label="Coverage Period *"
                    title="Select Coverage Period"
                    value={[parseDateOnly(inst.startDate), parseDateOnly(inst.endDate)]}
                    dateFormat="DD/MM/YYYY"
                    minDate={parseDateOnly(board?.startDate) ?? undefined}
                    maxDate={parseDateOnly(board?.endDate) ?? undefined}
                    onChange={([startDate, endDate]) => {
                      formik.setValues({
                        ...formik.values,
                        installments: formik.values.installments.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                startDate: toDateOnly(startDate) || null,
                                endDate: toDateOnly(endDate) || null,
                              }
                            : item
                        ),
                      });
                    }}
                    error={Boolean(errObj?.startDate || errObj?.endDate)}
                    helperText={errObj?.startDate || errObj?.endDate}
                  />
                </Grid>

                {/* Delete */}
                <Grid size={{ xs: 2, sm: 1 }} sx={{ pt: 0.5, textAlign: 'right' }}>
                  <Tooltip title="Delete installment" arrow>
                    <IconButton size="small" color="error" onClick={() => onRemove(index)}>
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Grid>

                {/* Invoice generation */}
                <Grid size={{ xs: 12, sm: inst.demandEnabled ? 3 : 4 }}>
                  <FormControlLabel
                    sx={{
                      m: 0,
                      minHeight: 40,
                      width: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1,
                    }}
                    control={
                      <Switch
                        size="small"
                        checked={inst.demandEnabled}
                        onChange={(event) =>
                          formik.setFieldValue(`${prefix}.demandEnabled`, event.target.checked)
                        }
                      />
                    }
                    label="Send invoice for payment"
                  />
                </Grid>

                {/* Scheduled bill date: entered only for the specific-date rule. */}
                {inst.demandEnabled && (
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <DatePicker
                      label={usesSpecificDate ? 'Scheduled Bill Date *' : 'Scheduled Bill Date'}
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
                            (!usesSpecificDate
                              ? 'Calculated from the bill generation rule'
                              : undefined),
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Due Date */}
                <Grid size={{ xs: 12, sm: inst.demandEnabled ? 3 : 4 }}>
                  <DatePicker
                    label="Payment Due Date *"
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
                <Grid size={{ xs: 12, sm: inst.demandEnabled ? 3 : 4 }}>
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

    </SectionCard>
  );
}
