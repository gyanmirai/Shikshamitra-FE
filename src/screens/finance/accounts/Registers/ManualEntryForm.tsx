import type { Dayjs } from 'dayjs';
import type { AccountsManualEntry } from 'src/redux/finance/accountsActivityApi';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetCashOptionsQuery } from 'src/redux/finance/cashManagementApi';
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

type ManualEntryValues = {
  name: string;
  counterparty: string;
  categoryId: string;
  amount: string;
  paymentMethod: number;
  paymentDate: string;
  cashPaymentDateTime: string;
  bankAccountId: string;
  paymentReference: string;
  notes: string;
};

export default function ManualEntryForm({
  direction,
  period,
  month,
  onClose,
  initialBankAccountId,
}: {
  direction: 'income' | 'expense';
  period: AcademicPeriod;
  month: string;
  onClose: () => void;
  initialBankAccountId?: string;
}) {
  const income = direction === 'income';
  const access = useFinancePermissions(
    income ? financePermissions.accounts.income : financePermissions.accounts.expense
  );
  const [create, { isLoading }] = useCreateAccountsManualEntryMutation();
  const [failure, setFailure] = useState('');
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [refreshingCash, setRefreshingCash] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const submitting = useRef(false);
  const requestKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const pendingEntry = useRef<{
    academicYearId: string;
    direction: 'income' | 'expense';
    body: AccountsManualEntry;
  } | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const submitEntry = async (payload: NonNullable<typeof pendingEntry.current>) => {
    submitting.current = true;
    setFailure('');
    try {
      await create(payload).unwrap();
      shikshaMitraToast.success({
        message: income
          ? payload.body.paymentMethod === PaymentMethod.CASH
            ? 'Cash income recorded. Available for deposit in Cash Management.'
            : 'Income added.'
          : 'Expense paid and recorded.',
      });
      onClose();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      setFailure(problem.detail);
      setStale(problem.errorCode === 'Finance:CashManagement:Stale');
      const status = (error as { status?: string | number })?.status;
      setUncertain(
        problem.errorCode !== 'Finance:CashManagement:Stale' &&
          (typeof status === 'number'
            ? status >= 500
            : ['FETCH_ERROR', 'TIMEOUT_ERROR', 'PARSING_ERROR'].includes(String(status)))
      );
    } finally {
      submitting.current = false;
    }
  };
  const formik = useFormik<ManualEntryValues>({
    initialValues: {
      name: '',
      counterparty: '',
      categoryId: '',
      amount: '',
      paymentMethod: initialBankAccountId ? PaymentMethod.BANK_TRANSFER : PaymentMethod.CASH,
      paymentDate: entryDate(period, month),
      cashPaymentDateTime: (dayjs(entryDate(period, month)).isSame(dayjs(), 'day')
        ? dayjs()
        : dayjs(entryDate(period, month)).startOf('day')
      ).toISOString(),
      bankAccountId: initialBankAccountId ?? '',
      paymentReference: '',
      notes: '',
    },
    validate: async (values) => {
      if (uncertain && pendingEntry.current) return {};
      try {
        await manualEntrySchema.validate(values, { abortEarly: false, context: { direction } });
        if (
          !income &&
          values.paymentMethod === PaymentMethod.CASH &&
          availableCash !== undefined &&
          Number(values.amount) > availableCash
        )
          return { amount: 'Amount exceeds the available cash balance.' };
        return {};
      } catch (error: any) {
        return Object.fromEntries(error.inner.map((item: any) => [item.path, item.message]));
      }
    },
    onSubmit: async (values) => {
      if (!access.canAdd) return;
      if (submitting.current || stale || refreshingCash) return;
      if (uncertain && pendingEntry.current) {
        await submitEntry(pendingEntry.current);
        return;
      }
      if (submitting.current || options.isError || options.isFetching || !options.currentData)
        return;
      const date = dayjs(
        values.paymentMethod === PaymentMethod.CASH
          ? values.cashPaymentDateTime
          : values.paymentDate
      );
      if (
        !date.isValid() ||
        date.isBefore(dayjs(period.startDate), 'day') ||
        date.isAfter(dayjs(period.endDate), 'day')
      ) {
        formik.setFieldError(
          values.paymentMethod === PaymentMethod.CASH ? 'cashPaymentDateTime' : 'paymentDate',
          'Select a date within this academic year.'
        );
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
      if (!income && values.paymentMethod === PaymentMethod.CASH) {
        if (cashOptions.isFetching || cashOptions.isError || availableCash === undefined) {
          formik.setFieldError('amount', 'Refresh the available cash balance before submitting.');
          return;
        }
        if (Number(values.amount) > availableCash) {
          formik.setFieldError('amount', 'Amount exceeds the available cash balance.');
          return;
        }
      }
      const fingerprint = JSON.stringify(values);
      if (requestKey.current?.fingerprint !== fingerprint)
        requestKey.current = { fingerprint, key: crypto.randomUUID() };
      const { cashPaymentDateTime, paymentReference, ...entryValues } = values;
      pendingEntry.current = {
        academicYearId: period.id,
        direction,
        body: {
          ...entryValues,
          name: values.name.trim(),
          counterparty: values.counterparty.trim(),
          amount: Number(values.amount),
          paymentDate:
            values.paymentMethod === PaymentMethod.CASH
              ? dayjs(cashPaymentDateTime).toISOString()
              : `${date.format('YYYY-MM-DD')}T12:00:00+05:30`,
          bankAccountId:
            values.paymentMethod === PaymentMethod.CASH ? undefined : values.bankAccountId,
          idempotencyKey: requestKey.current!.key,
          ...(!income && values.paymentMethod === PaymentMethod.CASH ? {} : { paymentReference }),
          categoryTags: [],
        },
      };
      await submitEntry(pendingEntry.current);
    },
  });
  const cashExpense = !income && formik.values.paymentMethod === PaymentMethod.CASH;
  const options = useGetFinanceRoutingOptionsQuery(
    {
      academicYearId: period.id,
      operation: income ? 'income-entry' : cashExpense ? 'cash-expense' : 'expense-entry',
    },
    { skip: !access.canAdd, refetchOnMountOrArgChange: true }
  );
  const cashOptions = useGetCashOptionsQuery(
    { academicYearId: period.id, operation: 'expense' },
    { skip: !access.canAdd || !cashExpense, refetchOnMountOrArgChange: true }
  );
  const availableCash = cashOptions.currentData
    ? cashOptions.currentData.cashSources.reduce(
        (total, source) => total + Math.round(source.remainingAmount * 100),
        0
      ) / 100
    : undefined;
  const locked = isLoading || formik.isSubmitting;
  const blocking = !access.canAdd || locked || options.isFetching || refreshingCash;
  const fieldsBlocked = blocking || uncertain || stale;
  const refreshCashBalance = async () => {
    setRefreshingCash(true);
    try {
      const result = await cashOptions.refetch();
      if (result.error) {
        setFailure(parseApiProblemDetail(result.error).detail);
        return;
      }
      requestKey.current = null;
      pendingEntry.current = null;
      setStale(false);
      setUncertain(false);
      setFailure('');
    } catch (error) {
      setFailure(parseApiProblemDetail(error).detail);
    } finally {
      setRefreshingCash(false);
    }
  };
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
    if (locked) return;
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
    <ShakingTextField error={fieldError(name).error}>
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
        disabled={fieldsBlocked}
        {...fieldError(name)}
        {...(name === 'notes' ? { multiline: true, minRows: 2 } : {})}
      />
    </ShakingTextField>
  );
  return (
    <>
      <Box inert={locked} sx={{ flexShrink: 0 }}>
        <CustomBreadcrumbs
          description="Record a school transaction with its category and payment details."
          heading={income ? 'Add Income' : 'Add Expense'}

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
            { name: income ? 'Add Income' : 'Add Expense' },
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
          <Stack spacing={2}>
            {failure && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {failure}
                {stale && (
                  <Button disabled={locked || refreshingCash} onClick={refreshCashBalance}>
                    Refresh cash balance
                  </Button>
                )}
              </Alert>
            )}
            {uncertain && (
              <Alert severity="warning">
                The payment outcome is uncertain. Retry submits the original request. Fields stay
                locked until its outcome is resolved.
              </Alert>
            )}
            {options.isError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button disabled={fieldsBlocked} onClick={() => options.refetch()}>
                    Retry
                  </Button>
                }
              >
                Categories and bank accounts could not be loaded.
              </Alert>
            )}
            <Box
              component="fieldset"
              disabled={fieldsBlocked}
              sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
            >
              <Stack spacing={2}>
                <FormSectionCard
                  descriptionTooltip="Enter the transaction name, category and payer or payee for this school entry."
                  icon="mdi:receipt-text-outline"
                  title={income ? 'Income Details' : 'Expense Details'}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {text('name', income ? 'Income name' : 'Expense purpose', true)}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField error={fieldError('categoryId').error}>
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
                          disabled={fieldsBlocked || options.isError}
                          {...fieldError('categoryId')}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={12}>
                      {text('counterparty', income ? 'Received from' : 'Paid to', true)}
                    </Grid>
                  </Grid>
                </FormSectionCard>
                <FormSectionCard
                  descriptionTooltip="Cash expenses use the academic year's available cash. Cash Management records the amount spent and deposits the remainder as Income. Other methods require an eligible school bank account."
                  icon="mdi:bank-transfer"
                  title="Payment Details"
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField error={fieldError('amount').error}>
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
                          disabled={fieldsBlocked}
                          {...fieldError('amount')}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {formik.values.paymentMethod === PaymentMethod.CASH ? (
                        <ShakingTextField error={fieldError('cashPaymentDateTime').error}>
                          <DateTimePicker
                            label="Payment date"
                            value={dayjs(formik.values.cashPaymentDateTime)}
                            minDateTime={dayjs(period.startDate).startOf('day')}
                            maxDateTime={
                              dayjs(period.endDate).endOf('day').isBefore(dayjs())
                                ? dayjs(period.endDate).endOf('day')
                                : dayjs()
                            }
                            disabled={fieldsBlocked}
                            onChange={(value: Dayjs | null) => {
                              formik.setFieldValue(
                                'cashPaymentDateTime',
                                value?.isValid() ? value.toISOString() : ''
                              );
                              formik.setFieldValue(
                                'paymentDate',
                                value?.isValid() ? value.format('YYYY-MM-DD') : ''
                              );
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                required: true,
                                name: 'cashPaymentDateTime',
                                onBlur: formik.handleBlur,
                                ...fieldError('cashPaymentDateTime'),
                              },
                            }}
                          />
                        </ShakingTextField>
                      ) : (
                        <ShakingTextField error={fieldError('paymentDate').error}>
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
                            disabled={fieldsBlocked}
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
                        </ShakingTextField>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField error={fieldError('paymentMethod').error}>
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
                            if (Number(value) === PaymentMethod.CASH) {
                              formik.setFieldValue('bankAccountId', '');
                              if (!income) formik.setFieldValue('paymentReference', '');
                            }
                          }}
                          disabled={fieldsBlocked}
                          name="paymentMethod"
                          onBlur={formik.handleBlur}
                          {...fieldError('paymentMethod')}
                        />
                      </ShakingTextField>
                    </Grid>
                    {cashExpense && (
                      <Grid size={12}>
                        {cashOptions.isError && (
                          <Alert
                            severity="error"
                            action={<Button onClick={() => cashOptions.refetch()}>Retry</Button>}
                          >
                            Available cash could not be loaded.
                          </Alert>
                        )}
                        {cashOptions.isFetching ? (
                          <Typography role="status" variant="body2">
                            Loading available cash...
                          </Typography>
                        ) : !cashOptions.isError && availableCash !== undefined ? (
                          <Typography variant="body2" color="text.secondary">
                            Available cash: {formatNumber(availableCash, 'INR')}
                          </Typography>
                        ) : null}
                        {!cashOptions.isFetching && !cashOptions.isError && availableCash === 0 && (
                          <Alert severity="info">
                            No cash is available for this academic year.
                          </Alert>
                        )}
                      </Grid>
                    )}
                    {formik.values.paymentMethod !== PaymentMethod.CASH && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <ShakingTextField error={fieldError('bankAccountId').error}>
                          <CustomSelect
                            label={
                              income
                                ? 'Receiving school bank account'
                                : 'Paying school bank account'
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
                            disabled={fieldsBlocked || options.isError}
                            {...fieldError('bankAccountId')}
                          />
                        </ShakingTextField>
                      </Grid>
                    )}
                    {!cashExpense && (
                      <Grid size={12}>
                        {text('paymentReference', 'Payment reference (optional)')}
                      </Grid>
                    )}
                  </Grid>
                </FormSectionCard>
                <FormSectionCard
                  descriptionTooltip="Add any supporting context for this transaction. Notes are optional."
                  icon="mdi:text-box-outline"
                  title="Additional Notes"
                >
                  <Grid container spacing={2}>
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
          <Button
            size="small"
            variant="outlined"
            disabled={locked}
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
            disabled={
              locked ||
              stale ||
              refreshingCash ||
              !access.canAdd ||
              (!uncertain &&
                (options.isFetching ||
                  options.isError ||
                  !options.currentData ||
                  (cashExpense &&
                    (cashOptions.isError ||
                      cashOptions.isFetching ||
                      availableCash === undefined ||
                      availableCash <= 0))))
            }
          >
            Submit
          </LoadingButton>
        </Box>
      </Card>
      <ConfirmDialog
        open={discardOpen}
        icon="warning"
        title="Discard unsaved changes?"
        content={
          uncertain
            ? 'The payment outcome is uncertain. Review the register before creating another payment if you leave; this exact retry request will be lost.'
            : `Your ${income ? 'income' : 'expense'} entry has unsaved changes. Leaving will discard them.`
        }
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
