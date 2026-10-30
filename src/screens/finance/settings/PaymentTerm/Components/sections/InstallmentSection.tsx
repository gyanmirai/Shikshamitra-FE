'use client';

import { sanitizeFinanceName } from 'src/utils/finance-name';
import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { AutoAwesome } from '@mui/icons-material';
import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  Box,
  Paper,
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

import { BillingScheduleSection } from './BillingScheduleSection';
import { InstallmentTemplateDialog } from '../InstallmentTemplateDialog';
import { getAllocationSummary, ALLOCATION_TOTAL_ERROR } from '../../allocationValidation';
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
  const allocation = getAllocationSummary(formik.values.installments);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pendingInstallment = useRef<number | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const handleAdd = () => {
    pendingInstallment.current = formik.values.installments.length;
    onAdd();
  };
  useEffect(() => {
    const index = pendingInstallment.current;
    if (index === null || formik.values.installments.length <= index) return;
    const input = sectionRef.current?.querySelector<HTMLInputElement>(
      `input[name="installments[${index}].installmentName"]`
    );
    if (input) {
      const scroller = listScrollRef.current;
      if (scroller) {
        scroller.scrollTo?.({
          top:
            scroller.scrollTop +
            input.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top -
            scroller.clientHeight / 2,
          behavior: 'smooth',
        });
      }
      input.focus({ preventScroll: true });
      input.select();
      pendingInstallment.current = null;
    }
  }, [formik.values.installments.length]);
  const usesSpecificDate = formik.values.demandGenerationRule === 'SpecificDate';

  return (
    <Box ref={sectionRef} sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <FormSectionCard
        icon={GlobalIcons.calendar}
        descriptionTooltip="Every installment start date, end date, and due date must fall inside the selected board period. Installments cannot overlap and allocations must total 100%."
        title="Installment Schedule"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        sx={{ minWidth: 0 }}
        actionFullWidthOnMobile
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={handleAdd}
              sx={{ flexShrink: 0 }}
            >
              Add Installment
            </Button>
          </Stack>
        }
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={{ py: 0.5 }}>
            <FormControlLabel
              sx={{ m: 0, gap: 0.5 }}
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
                </Box>
              }
            />
          </Box>

          <BillingScheduleSection formik={formik} board={board} />
        </Box>

        {/* Array-level error */}
        {formik.touched.installments &&
          typeof formik.errors.installments === 'string' &&
          formik.errors.installments !== ALLOCATION_TOTAL_ERROR && (
            <Alert severity="error">{formik.errors.installments}</Alert>
          )}

        {formik.values.installments.length > 0 && !allocation.valid && (
          <Alert severity="error" id="payment-term-allocation-error">
            {allocation.message}
          </Alert>
        )}

        <Scrollbar
          autoHide={false}
          ariaLabel="Installments"
          scrollableNodeProps={{
            ref: listScrollRef,
            role: 'region',
            'aria-label': 'Installments',
            tabIndex: 0,
          }}
          slotProps={{ contentWrapper: { overscrollBehaviorY: 'contain' } }}
          sx={{ flexGrow: 0, maxHeight: { xs: '35dvh', sm: '45dvh' } }}
        >
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

              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={handleAdd}
              >
                Add First Installment
              </Button>
            </Box>
          )}

          {/* Installment cards */}
          <Stack component="ol" spacing={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {formik.values.installments.map((inst, index) => {
              const prefix = `installments[${index}]`;
              const allErrors = getIn(formik.errors, prefix) ?? {};
              const fieldError = (field: string): string | undefined =>
                formik.submitCount > 0 || getIn(formik.touched, `${prefix}.${field}`)
                  ? allErrors[field]
                  : undefined;
              const errObj = {
                installmentName: fieldError('installmentName'),
                startDate: fieldError('startDate'),
                endDate: fieldError('endDate'),
                dueDate: fieldError('dueDate'),
                demandDate: fieldError('demandDate'),
                allocationPercentage: fieldError('allocationPercentage'),
              };
              const invoiceDate = getInvoiceDate(formik.values, inst);
              const invoiceError =
                (formik.submitCount > 0 ||
                  ['demandDate', 'dueDate', 'startDate', 'endDate'].some((field) =>
                    getIn(formik.touched, `${prefix}.${field}`)
                  )) &&
                (usesSpecificDate || invoiceDate)
                  ? errObj?.demandDate || getInvoiceDateError(formik.values, inst, board?.startDate)
                  : undefined;

              return (
                <Box
                  component="li"
                  key={`inst-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1, sm: 1.5 },
                    minWidth: 0,
                  }}
                >
                  <Box
                    aria-label={`Installment ${index + 1}`}
                    sx={{
                      width: 28,
                      height: 28,
                      mt: 2.25,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      bgcolor: 'background.neutral',
                      color: 'text.secondary',
                      typography: 'caption',
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Paper
                    variant="outlined"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 1.5,
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: 'minmax(0, 1fr)',
                      '@container (min-width: 650px)': {
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      },
                      '@container (min-width: 1100px)': {
                        gridTemplateColumns: formik.values.invoiceCreationEnabled
                          ? 'minmax(140px, 1.1fr) minmax(240px, 1.7fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(105px, 0.7fr) 44px'
                          : 'minmax(140px, 1.1fr) minmax(240px, 1.7fr) minmax(150px, 1fr) minmax(105px, 0.7fr) 44px',
                      },
                      '& > div': { minWidth: 0 },
                      '& .MuiFormHelperText-root': { mx: 0 },
                    }}
                  >
                    {/* Installment Name */}
                    <ShakingTextField error={Boolean(errObj.installmentName)}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Installment Name *"
                        name={`${prefix}.installmentName`}
                        value={inst.installmentName}
                        onChange={(event) =>
                          formik.setFieldValue(
                            event.target.name,
                            sanitizeFinanceName(event.target.value)
                          )
                        }
                        onBlur={formik.handleBlur}
                        error={Boolean(errObj?.installmentName)}
                        helperText={errObj?.installmentName}
                      />
                    </ShakingTextField>

                    {/* Installment start and end dates */}
                    <ShakingTextField
                      error={Boolean(errObj.startDate || errObj.endDate)}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          formik.setFieldTouched(`${prefix}.startDate`, true);
                          formik.setFieldTouched(`${prefix}.endDate`, true);
                        }
                      }}
                    >
                      <CustomDateRangePicker
                        label="Installment Start–End Date *"
                        title="Select Installment Start–End Date"
                        name={`${prefix}.startDate`}
                        onClose={() => {
                          formik.setFieldTouched(`${prefix}.startDate`, true);
                          formik.setFieldTouched(`${prefix}.endDate`, true);
                        }}
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
                    </ShakingTextField>

                    {/* Invoice date: entered only for the specific-date rule. */}
                    {formik.values.invoiceCreationEnabled && (
                      <ShakingTextField error={Boolean(invoiceError)}>
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
                              name: `${prefix}.demandDate`,
                              onBlur: () => formik.setFieldTouched(`${prefix}.demandDate`, true),
                              error: Boolean(invoiceError),
                              helperText:
                                invoiceError ||
                                (!usesSpecificDate ? 'Calculated from invoice rule' : undefined),
                            },
                          }}
                        />
                      </ShakingTextField>
                    )}
                    <ShakingTextField error={Boolean(errObj.dueDate)}>
                      <DatePicker
                        label="Payment Due Date *"
                        format="DD/MM/YYYY"
                        referenceDate={
                          parseDateOnly(inst.startDate) ??
                          parseDateOnly(board?.startDate) ??
                          undefined
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
                            name: `${prefix}.dueDate`,
                            onBlur: () => formik.setFieldTouched(`${prefix}.dueDate`, true),
                            error: Boolean(errObj?.dueDate),
                            helperText: errObj?.dueDate,
                          },
                        }}
                      />
                    </ShakingTextField>
                    <ShakingTextField
                      error={Boolean(errObj.allocationPercentage) || !allocation.valid}
                    >
                      <NumericFormatCustom
                        fullWidth
                        size="small"
                        label="Allocation % *"
                        name={`${prefix}.allocationPercentage`}
                        value={inst.allocationPercentage ?? ''}
                        prefix=""
                        suffix="%"
                        decimalScale={2}
                        roundToWholeRupees={false}
                        onValueChange={(value, source) => {
                          if (source.source === 'event')
                            formik.setFieldValue(`${prefix}.allocationPercentage`, value.value);
                        }}
                        onBlur={formik.handleBlur}
                        error={Boolean(errObj?.allocationPercentage) || !allocation.valid}
                        inputProps={{
                          'aria-describedby': !allocation.valid
                            ? 'payment-term-allocation-error'
                            : undefined,
                        }}
                        helperText={errObj?.allocationPercentage}
                      />
                    </ShakingTextField>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title={`Delete installment ${index + 1}`} arrow>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Delete installment ${index + 1}`}
                          onClick={() => onRemove(index)}
                          sx={{ width: 44, height: 44, mt: -0.25 }}
                        >
                          <Iconify icon={GlobalIcons.delete} width={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        </Scrollbar>
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
      </FormSectionCard>
    </Box>
  );
}
