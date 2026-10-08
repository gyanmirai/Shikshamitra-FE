'use client';

import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Add, Delete, AutoAwesome } from '@mui/icons-material';
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
  Switch,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../ui/SectionCard';
import { BillingScheduleSection } from './BillingScheduleSection';
import { InstallmentTemplateDialog } from '../InstallmentTemplateDialog';
import {
  getInvoiceDate,
  getInvoiceStart,
  getInvoiceDateError,
} from '../../invoiceScheduleValidation';

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
export function InstallmentSection({ formik, onAdd, onRemove, board }: InstallmentSectionProps) {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const allocationTotal = formik.values.installments.reduce(
    (sum, i) => sum + (Number(i.allocationPercentage) || 0),
    0
  );
  const allocationDelta = Math.round((100 - allocationTotal) * 100) / 100;
  const usesSpecificDate = formik.values.demandGenerationRule === 'SpecificDate';

  return (
    <SectionCard
      title="Installment schedule"
      subtitle="Define each installment's start and end dates, due date, and percentage allocation (must total 100%)."
      info="Every installment start date, end date, and due date must fall inside the selected board period. Installments cannot overlap and allocations must total 100%."
      action={
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setTemplateDialogOpen(true)}
            disabled={!formik.values.boardId}
            sx={{ flexShrink: 0 }}
          >
            Apply Template
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ flexShrink: 0 }}
          >
            Add Installment
          </Button>
        </Stack>
      }
    >
      {board?.startDate && board?.endDate && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Installment periods must be between {dayjs(board.startDate).format('DD/MM/YYYY')} and{' '}
          {dayjs(board.endDate).format('DD/MM/YYYY')} for {board.name}.
        </Alert>
      )}

      <Card variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 1.5 }}>
        <FormControlLabel
          sx={{ m: 0, alignItems: 'flex-start' }}
          control={
            <Switch
              size="small"
              checked={formik.values.invoiceCreationEnabled}
              onChange={(event) => {
                const enabled = event.target.checked;
                formik.setValues({
                  ...formik.values,
                  invoiceCreationEnabled: enabled,
                  installments: formik.values.installments.map((installment) => ({
                    ...installment,
                    demandEnabled: enabled,
                  })),
                });
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Create invoices for all installments
              </Typography>
              <Typography variant="caption" color="text.secondary">
                One setting controls invoice creation for the complete payment schedule.
              </Typography>
            </Box>
          }
        />
      </Card>

      <BillingScheduleSection formik={formik} board={board} />

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
          const invoiceDate = getInvoiceDate(formik.values, inst);
          const invoiceError =
            usesSpecificDate || invoiceDate
              ? errObj?.demandDate || getInvoiceDateError(formik.values, inst, board?.startDate)
              : undefined;

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

                {/* Installment start and end dates */}
                <Grid size={{ xs: 10, sm: 6 }}>
                  <CustomDateRangePicker
                    label="Installment Start–End Date *"
                    title="Select Installment Start–End Date"
                    value={[parseDateOnly(inst.startDate), parseDateOnly(inst.endDate)]}
                    dateFormat="DD/MM/YYYY"
                    allowManualInput
                    referenceDate={parseDateOnly(board?.startDate) ?? undefined}
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

                {/* Invoice date: entered only for the specific-date rule. */}
                {formik.values.invoiceCreationEnabled && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DatePicker
                      label={usesSpecificDate ? 'Invoice Date *' : 'Invoice Date'}
                      format="DD/MM/YYYY"
                      referenceDate={
                        parseDateOnly(inst.startDate) ??
                        parseDateOnly(board?.startDate) ??
                        undefined
                      }
                      value={invoiceDate}
                      minDate={getInvoiceStart(inst, board?.startDate) ?? undefined}
                      maxDate={parseDateOnly(inst.dueDate) ?? undefined}
                      onChange={(date) =>
                        formik.setFieldValue(`${prefix}.demandDate`, toDateOnly(date) || null)
                      }
                      disabled={!usesSpecificDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: Boolean(invoiceError),
                          helperText:
                            invoiceError ||
                            (!usesSpecificDate
                              ? 'Calculated from the invoice date rule'
                              : undefined),
                        },
                      }}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: formik.values.invoiceCreationEnabled ? 4 : 6 }}>
                  <DatePicker
                    label="Payment Due Date *"
                    format="DD/MM/YYYY"
                    referenceDate={
                      parseDateOnly(inst.startDate) ?? parseDateOnly(board?.startDate) ?? undefined
                    }
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
                <Grid size={{ xs: 12, sm: formik.values.invoiceCreationEnabled ? 4 : 6 }}>
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
      <InstallmentTemplateDialog
        open={templateDialogOpen}
        boardId={formik.values.boardId}
        existingInstallmentCount={formik.values.installments.length}
        demandGenerationRule={formik.values.demandGenerationRule}
        demandOffsetDays={formik.values.demandOffsetDays}
        onClose={() => setTemplateDialogOpen(false)}
        onApply={(installments, rule, offset) => {
          formik.setValues({
            ...formik.values,
            demandGenerationRule: rule,
            demandOffsetDays: offset,
            installments: installments.map((installment) => ({
              ...installment,
              demandEnabled: formik.values.invoiceCreationEnabled,
            })),
          });
          formik.setFieldTouched('installments', true, false);
        }}
      />
    </SectionCard>
  );
}
