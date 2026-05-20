'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import {
  Box,
  Card,
  Chip,
  Grid,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import FeeLedgerList from './FeeLedgerList';
import { toPeriod } from './FeeLedgerShared';
import { paymentMethodsConfig } from '../Components/paymentConfigMethods';
import { StudentFeeSummaryCard } from '../Components/StudentFeesSummaryCard';
import FeeCollectionPreviewDialog from './preview/FeeCollectionPreviewDialog';
import FeeLedgerFilterBar, { FEE_LEDGER_INITIAL_FILTERS } from './FeeLedgerFilterBar';

import type { FeeLedgerFilters } from './FeeLedgerFilterBar';
import type {
  IFeeCharge,
  IStudentFee,
  SelectedItem,
  FeeLedgerData,
  IPaymentFieldConfig,
  FeeCollectionPayment,
  FeeCollectionFormValues,
} from '../Components/type';

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const DUMMY_LEDGER_DATA: FeeLedgerData = {
  monthWise: [
    {
      month: 'April',
      totalDue: 4200,
      items: [
        {
          feeHeadId: 'fh1',
          feeHeadName: 'Tuition',
          total: 2000,
          paid: 0,
          due: 2000,
          status: FeeCollectionStatusType.Pending,
        },
        {
          feeHeadId: 'fh2',
          feeHeadName: 'Hostel',
          total: 3000,
          paid: 1000,
          due: 2000,
          status: FeeCollectionStatusType.Partial,
        },
        {
          feeHeadId: 'fh3',
          feeHeadName: 'Transport',
          total: 800,
          paid: 800,
          due: 0,
          status: FeeCollectionStatusType.Paid,
        },
        {
          feeHeadId: 'fh4',
          feeHeadName: 'Library',
          total: 200,
          paid: 0,
          due: 200,
          status: FeeCollectionStatusType.Pending,
        },
      ],
    },
    {
      month: 'May',
      totalDue: 5800,
      items: [
        {
          feeHeadId: 'fh1',
          feeHeadName: 'Tuition',
          total: 2000,
          paid: 0,
          due: 2000,
          status: FeeCollectionStatusType.Pending,
        },
      ],
    },
  ],
  feeHeadWise: [
    {
      feeHeadId: 'fh1',
      feeHeadName: 'Tuition',
      months: 3,
      totalDue: 6000,
      items: [
        {
          month: 'April',
          total: 2000,
          paid: 0,
          due: 2000,
          status: FeeCollectionStatusType.Pending,
        },
        { month: 'May', total: 2000, paid: 0, due: 2000, status: FeeCollectionStatusType.Pending },
      ],
    },
    {
      feeHeadId: 'fh2',
      feeHeadName: 'Hostel',
      months: 2,
      totalDue: 5000,
      items: [
        {
          month: 'April',
          total: 3000,
          paid: 1000,
          due: 2000,
          status: FeeCollectionStatusType.Partial,
        },
        { month: 'May', total: 3000, paid: 0, due: 3000, status: FeeCollectionStatusType.Pending },
      ],
    },
  ],
};

const DUMMY_CHARGES: IFeeCharge[] = [
  { chargeId: 'ch1', chargeName: 'Late Fee', amount: 500 },
  { chargeId: 'ch2', chargeName: 'Transport Fine', amount: 300 },
];

const buildDetailsForMethod = (method: string): Record<string, any> => {
  const config = paymentMethodsConfig[method as keyof typeof paymentMethodsConfig] ?? [];
  const details: Record<string, any> = {};
  config.forEach((field) => {
    if (field.name !== 'amount') {
      details[field.name] = field.type === 'date' ? null : '';
    }
  });
  return details;
};

// ─── Validation ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  selectedItems: Yup.array().min(1, 'Select at least one fee item to collect'),
  payment: Yup.object({
    paymentMethod: Yup.string().required('Payment method is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be positive'),
  }),
});

// ─── Initial Values ────────────────────────────────────────────────────────────

const buildInitialValues = (student: IStudentFee | null): FeeCollectionFormValues => ({
  studentId: String(student?.id ?? ''),
  selectedItems: [],
  charges: [],
  subtotal: 0,
  finalAmount: 0,
  payment: { paymentMethod: 'Cash', amount: '', details: {} },
  remarks: '',
});

// ─── Sub-components ────────────────────────────────────────────────────────────

const SummaryRow = ({
  label,
  value,
  color,
  bold = false,
  large = false,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  large?: boolean;
}) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" py={0.375}>
    <Typography
      variant={large ? 'subtitle2' : 'body2'}
      color="text.secondary"
      fontWeight={bold ? 600 : 400}
    >
      {label}
    </Typography>
    <Typography
      variant={large ? 'subtitle1' : 'body2'}
      fontWeight={bold ? 700 : 500}
      color={color ?? 'text.primary'}
    >
      {value}
    </Typography>
  </Box>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const FeeCollectComponentForm = ({
  student,
  ledgerData = DUMMY_LEDGER_DATA,
  chargesData = DUMMY_CHARGES,
  onSubmit,
  onCancel,
  loading = false,
}: {
  student: IStudentFee | null;
  ledgerData?: FeeLedgerData;
  chargesData?: IFeeCharge[];
  onSubmit?: (values: FeeCollectionFormValues & { subtotal: number; finalAmount: number }) => void;
  onCancel?: (e: any, isSubmit: boolean) => void;
  loading?: boolean;
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [filters, setFilters] = useState<FeeLedgerFilters>(FEE_LEDGER_INITIAL_FILTERS);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik<FeeCollectionFormValues>({
    initialValues: buildInitialValues(student),
    validationSchema,
    enableReinitialize: true,
    validate: (values) => {
      const errors: any = {};
      if (!values.payment.amount) return errors;
      const itemsTotal = values.selectedItems.reduce((s, i) => s + i.dueAmount, 0);
      const chargesTotal = (chargesData ?? [])
        .filter((c) => values.charges.includes(c.chargeId))
        .reduce((s, c) => s + c.amount, 0);
      const total = itemsTotal + chargesTotal;
      const paid = Number(String(values.payment.amount).replace(/[₹,\s]/g, ''));
      if (!Number.isNaN(paid) && total > 0 && paid > total) {
        errors.payment = { amount: `Amount cannot exceed ₹${formatNumber(total)}` };
      }
      return errors;
    },
    onSubmit: () => {
      setPreviewOpen(true);
    },
  });
  // ── Derived amounts ────────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    const itemsTotal = formik.values.selectedItems.reduce((s, i) => s + i.dueAmount, 0);
    const chargesTotal = (chargesData ?? [])
      .filter((c) => formik.values.charges.includes(c.chargeId))
      .reduce((s, c) => s + c.amount, 0);
    return itemsTotal + chargesTotal;
  }, [formik.values.selectedItems, formik.values.charges, chargesData]);

  const finalAmount = subtotal;

  const totalAllocated = useMemo(() => {
    const n = Number(String(formik.values.payment.amount || 0).replace(/[₹,\s]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  }, [formik.values.payment.amount]);

  const balance = finalAmount - totalAllocated;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectionChange = (items: SelectedItem[]) =>
    formik.setFieldValue('selectedItems', items, false);

  const handleChargesChange = (chargeIds: string[]) =>
    formik.setFieldValue('charges', chargeIds, false);

  const handlePaymentMethodChange = (method: string) => {
    formik.setFieldValue('payment', {
      paymentMethod: method,
      amount: formik.values.payment.amount,
      details: buildDetailsForMethod(method),
    });
  };

  const updatePayment = (field: keyof FeeCollectionPayment, value: any) =>
    formik.setFieldValue('payment', { ...formik.values.payment, [field]: value });

  const updatePaymentDetail = (detailKey: string, value: any) =>
    formik.setFieldValue('payment', {
      ...formik.values.payment,
      details: { ...formik.values.payment.details, [detailKey]: value },
    });

  const handleConfirmCollect = () => {
    onSubmit?.({ ...formik.values, subtotal, finalAmount });
    setPreviewOpen(false);
    onCancel?.(null, true);
  };
  const handleSelectAll = () => {
    const year = currentYear?.year ?? new Date().getFullYear();
    const allItems: SelectedItem[] = [];
    (ledgerData.monthWise ?? []).forEach((group) => {
      const period = toPeriod(group.month, year);
      group.items.forEach((item) => {
        if (item.due > 0) {
          allItems.push({
            feeHeadId: item.feeHeadId,
            period,
            dueAmount: item.due,
          });
        }
      });
    });
    formik.setFieldValue('selectedItems', allItems, false);

    if (chargesData && chargesData.length > 0) {
      const allCharges = chargesData
        .filter((c) => c.status !== 0 && c.status !== 'Paid')
        .map((c) => c.chargeId);
      formik.setFieldValue('charges', allCharges, false);
    }
  };

  const handleRemoveAll = () => {
    formik.setFieldValue('selectedItems', [], false);
    formik.setFieldValue('charges', [], false);
  };

  const entryCount = useMemo(
    () => (ledgerData.monthWise ?? []).reduce((s, g) => s + g.items.length, 0),
    [ledgerData]
  );

  const feeHeadMap = useMemo(() => {
    const map: Record<string, string> = {};
    (ledgerData.feeHeadWise ?? []).forEach((fh) => {
      map[fh.feeHeadId] = fh.feeHeadName;
    });
    (ledgerData.monthWise ?? []).forEach((m) =>
      m.items.forEach((item) => {
        map[item.feeHeadId] = item.feeHeadName;
      })
    );
    return map;
  }, [ledgerData]);

  const selectedCount = formik.values.selectedItems.length + formik.values.charges.length;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: (t) => alpha(t.palette.background.neutral ?? t.palette.action.hover, 0.25),
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          p: { xs: 0.75, md: 1.25 },
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Grid container spacing={{ xs: 1.25, md: 1.75 }} sx={{ height: '100%' }}>
          {/* ── LEFT: Student + Ledger ── */}
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <StudentFeeSummaryCard student={student} />

            <Box
              mt={0.75}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
              }}
            >
              <FeeLedgerFilterBar
                filters={filters}
                onFilterChange={setFilters}
                entryCount={entryCount}
              />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={0.85}
                minHeight={24}
                sx={{
                  p: 1,
                  pl: 1.25,
                  borderRadius: 1.5,
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.72)}`,
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.82),
                  ml: 0.25,
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {selectedCount > 0 && (
                    <Chip
                      label={`${selectedCount} selected`}
                      size="small"
                      color="primary"
                      variant="soft"
                      onDelete={handleRemoveAll}
                      deleteIcon={<Iconify icon={GlobalIcons.cancel} width={14} />}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {formik.errors.selectedItems && formik.touched.selectedItems && (
                    <Typography variant="caption" color="error">
                      {formik.errors.selectedItems as string}
                    </Typography>
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:check-read-linear" />}
                    onClick={handleSelectAll}
                    sx={{
                      borderColor: (t) => alpha(t.palette.primary.main, 0.35),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={selectedCount === 0}
                    startIcon={<Iconify icon="solar:trash-bin-trash-linear" />}
                    onClick={handleRemoveAll}
                    sx={{
                      borderColor: (t) => alpha(t.palette.error.main, 0.35),
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                    }}
                  >
                    Remove All
                  </Button>
                </Box>
              </Box>
              <Box mt={0.85} sx={{ flex: 1, minHeight: 0 }}>
                <Scrollbar sx={{ height: '100%', pr: 0.5 }}>
                  <FeeLedgerList
                    data={ledgerData}
                    activeTab={filters.activeTab}
                    selectedItems={formik.values.selectedItems}
                    charges={formik.values.charges}
                    chargesData={chargesData}
                    onSelectionChange={handleSelectionChange}
                    onChargesChange={handleChargesChange}
                    year={currentYear?.year ?? new Date().getFullYear()}
                  />
                </Scrollbar>
              </Box>
            </Box>
          </Grid>

          {/* ── RIGHT: Summary + Payment ── */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              height: '100%',
              position: 'relative',
            }}
          >
            <Scrollbar sx={{ height: '100%', pr: 0.5 }}>
              {/* ── Fee Summary Card ── */}
              <Card
                sx={{
                  p: 1.5,
                  borderRadius: 2.25,
                  ml: 0.25,
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.72)}`,
                  boxShadow: (t) => `0 6px 16px ${alpha(t.palette.common.black, 0.05)}`,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Iconify icon="solar:calculator-bold" sx={{ color: 'primary.main', width: 24 }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Fee Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1.1 }} />

                {formik.values.selectedItems.length === 0 && formik.values.charges.length === 0 ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center', py: 1.5 }}
                  >
                    No fee items selected
                  </Typography>
                ) : (
                  <>
                    {formik.values.selectedItems.map((item, idx) => {
                      const feeHeadName = feeHeadMap[item.feeHeadId] ?? item.feeHeadId;
                      const periodLabel = dayjs(`${item.period}-01`).format('MMM YYYY');
                      return (
                        <Box
                          key={`${item.feeHeadId}-${item.period}`}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          py={0.55}
                          px={0.5}
                          sx={{
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.action.hover, 0.5),
                            },
                          }}
                        >
                          <Box display="flex" gap={1}>
                            <Typography variant="body2">{feeHeadName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({periodLabel})
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                            <Typography
                              variant="body2"
                              sx={{
                                width: 110,
                                textAlign: 'right',
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              ₹ {formatNumber(item.dueAmount)}
                            </Typography>
                            <IconButton
                              size="small"
                              sx={{ p: 0.35 }}
                              onClick={() => {
                                const newItems = formik.values.selectedItems.filter(
                                  (_, i) => i !== idx
                                );
                                formik.setFieldValue('selectedItems', newItems, false);
                              }}
                            >
                              <Iconify
                                icon={GlobalIcons.cancel}
                                width={20}
                                sx={{ color: 'error.main' }}
                              />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                    {formik.values.charges.length > 0 && (
                      <>
                        <Divider sx={{ my: 0.5 }} />
                        {(chargesData ?? [])
                          .filter((c) => formik.values.charges.includes(c.chargeId))
                          .map((charge) => (
                            <Box
                              key={charge.chargeId}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              px={0.5}
                              py={0.35}
                              sx={{
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: (t) => alpha(t.palette.action.hover, 0.5),
                                },
                              }}
                            >
                              <Box flex={1} minWidth={0}>
                                <Typography variant="body2">{charge.chargeName}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    width: 110,
                                    textAlign: 'right',
                                    flexShrink: 0,
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  ₹ {formatNumber(charge.amount)}
                                </Typography>
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.35 }}
                                  onClick={() => {
                                    const newCharges = formik.values.charges.filter(
                                      (id) => id !== charge.chargeId
                                    );
                                    formik.setFieldValue('charges', newCharges, false);
                                  }}
                                >
                                  <Iconify
                                    icon={GlobalIcons.cancel}
                                    width={20}
                                    sx={{ color: 'error.main' }}
                                  />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                      </>
                    )}
                  </>
                )}

                <Divider sx={{ my: 0.75 }} />
                <SummaryRow
                  label="Total"
                  value={`₹ ${formatNumber(subtotal)}`}
                  color="primary.main"
                  bold
                  large
                />
              </Card>

              {/* ── Payment Methods Card ── */}
              <Card
                sx={{
                  mt: 1.25,
                  p: 1.5,
                  borderRadius: 2.25,
                  ml: 0.25,
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.72)}`,
                  boxShadow: (t) => `0 6px 16px ${alpha(t.palette.common.black, 0.05)}`,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Iconify icon="solar:card-bold" sx={{ color: 'primary.main', width: 24 }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Payment Methods
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1.5 }} />

                <ShakingTextField
                  error={Boolean(
                    formik.touched.payment?.paymentMethod && formik.errors.payment?.paymentMethod
                  )}
                >
                  <CustomSelect
                    label="Select Payment Method *"
                    options={Object.keys(paymentMethodsConfig).map((m) => ({ value: m, label: m }))}
                    labelKey="label"
                    valueKey="value"
                    disabled={finalAmount === 0}
                    value={formik.values.payment.paymentMethod}
                    onChange={(val) => handlePaymentMethodChange(val as string)}
                    error={Boolean(
                      formik.touched.payment?.paymentMethod && formik.errors.payment?.paymentMethod
                    )}
                    helperText={
                      formik.touched.payment?.paymentMethod
                        ? ((formik.errors.payment?.paymentMethod as string) ?? '')
                        : ''
                    }
                    formControlProps={{ sx: { width: '100%' } }}
                    name="payment"
                  />
                </ShakingTextField>

                {formik.values.payment.paymentMethod && (
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    mt={1.5}
                  >
                    <Typography variant="subtitle2" color="primary.main" fontWeight={700} mb={1}>
                      {formik.values.payment.paymentMethod}
                    </Typography>
                    <Grid container spacing={2}>
                      {(
                        paymentMethodsConfig[
                          formik.values.payment.paymentMethod as keyof typeof paymentMethodsConfig
                        ] ?? []
                      ).map((field: IPaymentFieldConfig) => {
                        const isAmount = field.name === 'amount';
                        const fieldPath = isAmount
                          ? 'payment.amount'
                          : `payment.details.${field.name}`;
                        const fieldValue = isAmount
                          ? formik.values.payment.amount
                          : formik.values.payment.details[field.name];
                        const isTouched = isAmount
                          ? formik.touched.payment?.amount
                          : (formik.touched.payment?.details as any)?.[field.name];
                        const errorMsg = isAmount
                          ? formik.errors.payment?.amount
                          : (formik.errors.payment?.details as any)?.[field.name];

                        return (
                          <Grid
                            size={{ xs: 12, sm: 6 }}
                            key={`${formik.values.payment.paymentMethod}-${field.name}`}
                          >
                            {field.type === 'date' ? (
                              <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                <DatePicker
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={fieldValue ? dayjs(fieldValue as Dayjs) : null}
                                  format="DD/MM/YYYY"
                                  onChange={(date) => formik.setFieldValue(fieldPath, date)}
                                  sx={{ width: '100%' }}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      fullWidth: true,
                                      error: isTouched && Boolean(errorMsg),
                                      helperText: isTouched ? errorMsg : '',
                                    },
                                  }}
                                />
                              </ShakingTextField>
                            ) : field.type === 'select' ? (
                              <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                <TextField
                                  select
                                  fullWidth
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={fieldValue ?? ''}
                                  size="small"
                                  onChange={(e) =>
                                    isAmount
                                      ? updatePayment('amount', e.target.value)
                                      : updatePaymentDetail(field.name, e.target.value)
                                  }
                                  error={isTouched && Boolean(errorMsg)}
                                  helperText={isTouched ? errorMsg : ''}
                                >
                                  {field.options?.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </ShakingTextField>
                            ) : field.type === 'amount' ? (
                              <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                <NumericFormatCustom
                                  fullWidth
                                  size="small"
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={fieldValue ?? ''}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[₹,\s]/g, '');
                                    updatePayment('amount', raw);
                                  }}
                                  error={isTouched && Boolean(errorMsg)}
                                  helperText={isTouched ? errorMsg : ''}
                                />
                              </ShakingTextField>
                            ) : field.type === 'multiline' ? (
                              <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  size="small"
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={fieldValue ?? ''}
                                  onChange={(e) => updatePaymentDetail(field.name, e.target.value)}
                                  error={isTouched && Boolean(errorMsg)}
                                  helperText={isTouched ? errorMsg : ''}
                                />
                              </ShakingTextField>
                            ) : (
                              <ShakingTextField error={isTouched && Boolean(errorMsg)}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type={field.type}
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={fieldValue ?? ''}
                                  onChange={(e) => {
                                    const { value: val } = e.target;
                                    if (field.pattern && val !== '') {
                                      if (!/^[a-zA-Z0-9 ]*$/.test(val)) return;
                                    }
                                    updatePaymentDetail(field.name, val);
                                  }}
                                  error={isTouched && Boolean(errorMsg)}
                                  helperText={isTouched ? errorMsg : ''}
                                  inputProps={
                                    field.type === 'number'
                                      ? { min: field.min, max: field.max }
                                      : {}
                                  }
                                />
                              </ShakingTextField>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                )}

                {formik.values.payment.paymentMethod && (
                  <Box
                    mt={1.5}
                    p={1.1}
                    sx={{
                      borderRadius: 1.25,
                      border: (t) => `1px solid ${alpha(t.palette.divider, 0.7)}`,
                      bgcolor:
                        balance === 0
                          ? alpha(theme.palette.success.main, 0.08)
                          : balance > 0
                            ? alpha(theme.palette.warning.main, 0.08)
                            : alpha(theme.palette.error.main, 0.08),
                    }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        Total Allocated
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        ₹ {formatNumber(totalAllocated)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        {balance > 0 ? 'Remaining' : balance < 0 ? 'Excess' : 'Balanced'}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                        color={
                          balance === 0
                            ? 'success.main'
                            : balance > 0
                              ? 'warning.main'
                              : 'error.main'
                        }
                      >
                        {balance === 0 ? '' : ''}₹ {formatNumber(Math.abs(balance))}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Card>

              {/* ── Remarks ── */}
              <Box mt={1.25} mb={1} ml={0.25}>
                <TextField
                  label="Remarks (Optional)"
                  value={formik.values.remarks ?? ''}
                  onChange={(e) => formik.setFieldValue('remarks', e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  placeholder="Add any notes for this payment..."
                />
              </Box>
            </Scrollbar>
          </Grid>
        </Grid>
      </Box>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          px: { xs: 1, md: 1.5 },
          py: 0.9,
          mt: 0,
          bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
          borderTop: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
        }}
      >
        <Box display="flex" justifyContent="space-between" gap={1} alignItems="center" width="100%">
          {balance < 0 && (
            <Box flex={2} display="flex" justifyContent="center">
              <Typography variant="caption" color="error" textAlign="center">
                Total allocated <strong>(₹ {formatNumber(totalAllocated)})</strong> exceeds the
                payable amount{' '}
                <strong>
                  (₹
                  {formatNumber(finalAmount)})
                </strong>
                . Please reduce payment amounts before submitting.
              </Typography>
            </Box>
          )}
          <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                onCancel?.(null, false);
              }}
              disabled={loading}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{ minWidth: 88 }}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              // loading={isCollectFeeLoading}
              size="small"
              onClick={(e: any) => {
                formik.handleSubmit(e);
              }}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              disabled={loading}
              sx={{ minWidth: 96 }}
            >
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </DialogActions>

      {/* ── Fee Collection Preview Dialog ── */}
      <FeeCollectionPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmCollect}
        loading={loading}
        formValues={formik.values}
        student={student}
        chargesData={chargesData ?? []}
        feeHeadMap={feeHeadMap}
        academicYear={currentYear?.year ? String(currentYear.year) : undefined}
      />
    </Box>
  );
};

export default FeeCollectComponentForm;
