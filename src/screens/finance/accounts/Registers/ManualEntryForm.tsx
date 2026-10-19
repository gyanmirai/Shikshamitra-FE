import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import { useCreateAccountsManualEntryMutation } from 'src/redux/finance/accountsActivityApi';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { entryDate } from './academicMonths';
import { manualEntrySchema } from './manualEntrySchema';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';

import type { AcademicPeriod } from './academicMonths';

export default function ManualEntryForm({
  direction,
  period,
  month,
  onClose,
}: {
  direction: 'income' | 'expense';
  period: AcademicPeriod;
  month: string;
  onClose: () => void;
}) {
  const income = direction === 'income';
  const access = useFinancePermissions(income ? financePermissions.accounts.income : financePermissions.accounts.expense);
  const [create, { isLoading }] = useCreateAccountsManualEntryMutation();
  const [failure, setFailure] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const submitting = useRef(false);
  const requestKey = useRef<string | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const options = useGetFinanceRoutingOptionsQuery(
    { academicYearId: period.id, operation: income ? 'income-entry' : 'expense-entry' },
    { skip: !access.canAdd, refetchOnMountOrArgChange: true }
  );
  const formik = useFormik({
    initialValues: {
      name: '',
      counterparty: '',
      categoryId: '',
      amount: '',
      paymentMethod: PaymentMethod.CASH,
      paymentDate: entryDate(period, month),
      bankAccountId: '',
      paymentReference: '',
      notes: '',
    },
    validationSchema: manualEntrySchema,
    onSubmit: async (values) => {
      if (!access.canAdd) return;
      if (submitting.current || options.isError || options.isFetching || !options.currentData)
        return;
      const date = dayjs(values.paymentDate);
      if (
        !date.isValid() ||
        date.isBefore(dayjs(period.startDate), 'day') ||
        date.isAfter(dayjs(period.endDate), 'day')
      ) {
        formik.setFieldError('paymentDate', 'Select a date within this academic year.');
        return;
      }
      const categories = income
        ? options.currentData.incomeCategories
        : options.currentData.expenseCategories;
      if (!categories.some((item) => item.id === values.categoryId)) {
        formik.setFieldError('categoryId', 'Select an available category.');
        return;
      }
      if (
        values.paymentMethod !== PaymentMethod.CASH &&
        !options.currentData.bankAccounts.some((item) => item.id === values.bankAccountId)
      ) {
        formik.setFieldError('bankAccountId', 'Select an available school bank account.');
        return;
      }
      submitting.current = true;
      setFailure('');
      try {
        await create({
          academicYearId: period.id,
          direction,
          body: {
            ...values,
            name: values.name.trim(),
            counterparty: values.counterparty.trim(),
            amount: Number(values.amount),
            paymentDate: `${date.format('YYYY-MM-DD')}T12:00:00+05:30`,
            bankAccountId:
              values.paymentMethod === PaymentMethod.CASH ? undefined : values.bankAccountId,
            idempotencyKey: requestKey.current ?? (requestKey.current = crypto.randomUUID()),
            categoryTags: [],
          },
        }).unwrap();
        shikshaMitraToast.success({ message: income ? 'Income added.' : 'Expense added.' });
        onClose();
      } catch (error) {
        setFailure(parseApiProblemDetail(error).detail);
      } finally {
        submitting.current = false;
      }
    },
  });
  const locked = isLoading || formik.isSubmitting;
  const blocking = !access.canAdd || locked || options.isFetching;
  useEffect(() => {
    if (!options.isFetching && !options.isError) nameInput.current?.focus();
  }, [options.isFetching, options.isError]);
  useEffect(() => {
    if (!formik.dirty && !locked) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [formik.dirty, locked]);
  const requestClose = () => {
    if (blocking) return;
    if (formik.dirty) setDiscardOpen(true);
    else onClose();
  };
  const fieldError = (name: keyof typeof formik.values) => ({
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] ? formik.errors[name] : undefined,
  });
  const categories = income
    ? options.currentData?.incomeCategories
    : options.currentData?.expenseCategories;
  const text = (
    name: 'name' | 'counterparty' | 'paymentReference' | 'notes',
    label: string,
    required = false
  ) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      required={required}
      name={name}
      autoFocus={name === 'name'}
      inputRef={name === 'name' ? nameInput : undefined}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      disabled={blocking}
      {...fieldError(name)}
      {...(name === 'notes' ? { multiline: true, minRows: 2 } : {})}
    />
  );
  return (
    <>
      <Box inert={blocking} sx={{ flexShrink: 0 }}>
        <CustomBreadcrumbs
          heading={income ? 'Add income' : 'Add expense'}
          description="Record a school transaction with its category and payment details."
          isBack
          onBack={requestClose}
          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Accounts' },
            {
              name: income ? 'Income' : 'Expenses',
              href: income ? financePaths.incomeTracking : financePaths.expenseTracking,
              onClick: (event) => {
                event.preventDefault();
                requestClose();
              },
            },
            { name: income ? 'Add income' : 'Add expense' },
          ]}
        />
      </Box>
      <Card
        component="form"
        noValidate
        onSubmit={formik.handleSubmit}
        aria-busy={blocking}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadows-4)',
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'auto', p: 2 }}>
          <Stack spacing={1.5}>
            {failure && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {failure}
              </Alert>
            )}
            {options.isError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button disabled={blocking} onClick={() => options.refetch()}>
                    Retry
                  </Button>
                }
              >
                Categories and bank accounts could not be loaded.
              </Alert>
            )}
            <Box
              component="fieldset"
              disabled={blocking}
              sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
            >
              <Stack spacing={1.5}>
                <FormSectionCard
                  icon="mdi:receipt-text-outline"
                  title={income ? 'Income details' : 'Expense details'}
                  descriptionTooltip="Enter the transaction name, category and payer or payee for this school entry."
                >
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {text('name', income ? 'Income name' : 'Expense purpose', true)}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomSelect
                        label={income ? 'Income category' : 'Expense category'}
                        required
                        options={categories ?? []}
                        labelKey="label"
                        valueKey="id"
                        value={formik.values.categoryId}
                        onChange={(value) => formik.setFieldValue('categoryId', value)}
                        name="categoryId"
                        onBlur={formik.handleBlur}
                        isSearch
                        isLoading={options.isFetching}
                        disabled={blocking || options.isError}
                        {...fieldError('categoryId')}
                      />
                    </Grid>
                    <Grid size={12}>
                      {text('counterparty', income ? 'Received from' : 'Paid to', true)}
                    </Grid>
                  </Grid>
                </FormSectionCard>
                <FormSectionCard
                  icon="mdi:bank-transfer"
                  title="Payment details"
                  descriptionTooltip="Cash entries do not require a bank account. For other payment methods, select an eligible school bank account."
                >
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <NumericFormatCustom
                        fullWidth
                        size="small"
                        required
                        name="amount"
                        label="Amount"
                        value={formik.values.amount}
                        valueIsNumericString
                        roundToWholeRupees={false}
                        decimalScale={2}
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined || floatValue <= 999999999999.99
                        }
                        onValueChange={(values, source) => {
                          if (source.source === 'event')
                            formik.setFieldValue('amount', values.value);
                        }}
                        onBlur={formik.handleBlur}
                        disabled={blocking}
                        {...fieldError('amount')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label="Payment date"
                        value={dayjs(formik.values.paymentDate)}
                        minDate={dayjs(period.startDate)}
                        maxDate={dayjs(period.endDate)}
                        onChange={(value: Dayjs | null) =>
                          formik.setFieldValue(
                            'paymentDate',
                            value?.isValid() ? value.format('YYYY-MM-DD') : ''
                          )
                        }
                        disabled={blocking}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            required: true,
                            name: 'paymentDate',
                            onBlur: formik.handleBlur,
                            ...fieldError('paymentDate'),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomSelect
                        label="Payment method"
                        required
                        value={formik.values.paymentMethod}
                        options={Object.entries(PaymentMethodLabels).map(([value, label]) => ({
                          value: Number(value),
                          label,
                        }))}
                        onChange={(value) => {
                          formik.setFieldValue('paymentMethod', Number(value));
                          if (Number(value) === PaymentMethod.CASH)
                            formik.setFieldValue('bankAccountId', '');
                        }}
                        disabled={blocking}
                        name="paymentMethod"
                        onBlur={formik.handleBlur}
                        {...fieldError('paymentMethod')}
                      />
                    </Grid>
                    {formik.values.paymentMethod !== PaymentMethod.CASH && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomSelect
                          label={
                            income ? 'Receiving school bank account' : 'Paying school bank account'
                          }
                          required
                          options={options.currentData?.bankAccounts ?? []}
                          labelKey="label"
                          valueKey="id"
                          value={formik.values.bankAccountId}
                          onChange={(value) => formik.setFieldValue('bankAccountId', value)}
                          name="bankAccountId"
                          onBlur={formik.handleBlur}
                          isSearch
                          isLoading={options.isFetching}
                          disabled={blocking || options.isError}
                          {...fieldError('bankAccountId')}
                        />
                      </Grid>
                    )}
                    <Grid size={12}>
                      {text('paymentReference', 'Payment reference (optional)')}
                    </Grid>
                  </Grid>
                </FormSectionCard>
                <FormSectionCard
                  icon="mdi:text-box-outline"
                  title="Additional notes"
                  descriptionTooltip="Add any supporting context for this transaction. Notes are optional."
                >
                  <Grid container spacing={1.5}>
                    <Grid size={12}>{text('notes', 'Notes (optional)')}</Grid>
                  </Grid>
                </FormSectionCard>
              </Stack>
            </Box>
          </Stack>
          {blocking && (
            <Box
              role="status"
              aria-live="polite"
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2">
                {locked ? 'Saving entry...' : 'Loading categories and bank accounts...'}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
            Required fields are marked with *
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={blocking}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            loading={locked}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={blocking || options.isError || !options.currentData}
          >
            Submit
          </LoadingButton>
        </Box>
      </Card>
      <ConfirmDialog
        open={discardOpen}
        icon="warning"
        title="Discard unsaved changes?"
        content={`Your ${income ? 'income' : 'expense'} entry has unsaved changes. Leaving will discard them.`}
        onClose={() => setDiscardOpen(false)}
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            variant="contained"
            color="warning"
            onClick={onClose}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
