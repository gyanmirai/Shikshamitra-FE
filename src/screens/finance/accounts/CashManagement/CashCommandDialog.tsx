'use client';

import type { RootState } from 'src/redux/store';
import type { CashDetail, CashDeposit } from 'src/redux/finance/cashManagementApi';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Alert, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetCashOptionsQuery,
  useApproveCashMutation,
  useDepositCashMutation,
  useConfirmCashDepositMutation,
} from 'src/redux/finance/cashManagementApi';

import { cashActionAllowed, cashCommandSchema } from '../cashManagementRules';

import type { CashAction } from '../cashManagementRules';

export default function CashCommandDialog({
  action,
  data,
  deposit,
  academicYearId,
  onClose,
  onSaved,
  onRefresh,
}: {
  action: CashAction;
  data: CashDetail;
  deposit?: CashDeposit;
  academicYearId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onRefresh: () => Promise<CashDetail>;
}) {
  const approve = action === 'approve';
  const confirm = action === 'confirm';
  const [recoveredData, setRecoveredData] = useState<CashDetail | null>(null);
  const currentData = recoveredData ?? data;
  const currentDeposit = currentData.deposits.find((item) => item.id === deposit?.id) ?? deposit;
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pendingCommand = useRef<(() => Promise<unknown>) | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const grants = auth.permissions as { name: string; isGranted: boolean }[];
  const allowed =
    auth.permissionsInitialized &&
    !auth.loading &&
    cashActionAllowed(
      approve ? 'Approve' : confirm ? 'Reconcile' : 'Deposit',
      grants.filter((item) => item.isGranted).map((item) => item.name),
      uncertain
        ? Boolean(pendingCommand.current)
        : approve
          ? currentData.canApprove
          : confirm
            ? Boolean(currentDeposit?.canConfirm)
            : currentData.canDeposit
    );
  const maximum = approve
    ? currentData.remainingAmount
    : confirm
      ? currentDeposit!.amount - currentDeposit!.creditedAmount
      : currentData.remainingAmount;
  const options = useGetCashOptionsQuery(
    { academicYearId, operation: approve ? 'approve' : 'deposit' },
    { skip: !approve || !allowed, refetchOnMountOrArgChange: true }
  );
  const [approveCash] = useApproveCashMutation();
  const [depositCash] = useDepositCashMutation();
  const [confirmCredit] = useConfirmCashDepositMutation();
  const [failure, setFailure] = useState('');
  const [discard, setDiscard] = useState(false);
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  const inFlight = useRef(false);
  const formik = useFormik({
    initialValues: {
      bankAccountId: '',
      amount: approve ? String(currentData.remainingAmount) : '',
      date: dayjs().toISOString(),
      reference: '',
      notes: '',
    },
    validationSchema: uncertain
      ? undefined
      : cashCommandSchema(action, maximum, confirm ? currentDeposit?.depositDate : undefined),
    onSubmit: async (values) => {
      if (
        !allowed ||
        stale ||
        refreshing ||
        inFlight.current ||
        (!uncertain && approve && (options.isFetching || options.isError || !options.currentData))
      )
        return;
      if (
        approve &&
        !uncertain &&
        !options.currentData?.bankAccounts.some((bank) => bank.id === values.bankAccountId)
      ) {
        formik.setFieldError('bankAccountId', 'Select an available school bank account.');
        return;
      }
      inFlight.current = true;
      setFailure('');
      const fingerprint = JSON.stringify({ values, stamp: currentData.concurrencyStamp });
      if (!uncertain && request.current?.fingerprint !== fingerprint)
        request.current = { fingerprint, key: crypto.randomUUID() };
      const shared = {
        academicYearId,
        idempotencyKey: request.current!.key,
        concurrencyStamp: currentData.concurrencyStamp,
        notes: values.notes.trim() || undefined,
      };
      try {
        if (!uncertain && approve) {
          const args = {
            id: currentData.id,
            body: {
              ...shared,
              bankAccountId: values.bankAccountId,
              countedAmount: Number(values.amount),
            },
          };
          pendingCommand.current = () => approveCash(args).unwrap();
        } else if (!uncertain) {
          const evidence = {
            ...shared,
            amount: Number(values.amount),
            reference: values.reference.trim(),
          };
          const date = dayjs(values.date).toISOString();
          if (confirm) {
            const args = {
              id: currentData.id,
              depositId: currentDeposit!.id,
              body: { ...evidence, creditDate: date },
            };
            pendingCommand.current = () => confirmCredit(args).unwrap();
          } else {
            const args = { id: currentData.id, body: { ...evidence, depositDate: date } };
            pendingCommand.current = () => depositCash(args).unwrap();
          }
        }
        await pendingCommand.current!();
        shikshaMitraToast.success({
          message: approve
            ? 'Cash finalized. The remaining deposit is confirmed as Income.'
            : confirm
              ? 'Bank credit confirmed.'
              : 'Deposit recorded. Bank credit awaits independent confirmation.',
        });
        await onSaved();
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
        inFlight.current = false;
      }
    },
  });
  const locked = formik.isSubmitting;
  useEffect(() => {
    if (!formik.dirty && !locked) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [formik.dirty, locked]);
  const blocked =
    !allowed || locked || stale || refreshing || (!uncertain && approve && options.isFetching);
  const fieldsBlocked = blocked || uncertain;
  const refreshLatest = async () => {
    setRefreshing(true);
    try {
      const [latest] = await Promise.all([
        onRefresh(),
        approve ? options.refetch().unwrap() : Promise.resolve(),
      ]);
      setRecoveredData(latest);
      request.current = null;
      pendingCommand.current = null;
      setStale(false);
      setUncertain(false);
      setFailure('');
    } catch (error) {
      setFailure(parseApiProblemDetail(error).detail);
    } finally {
      setRefreshing(false);
    }
  };
  const requestClose = () => {
    if (locked) return;
    if (formik.dirty) setDiscard(true);
    else onClose();
  };
  const field = (name: keyof typeof formik.values) => ({
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] ? formik.errors[name] : undefined,
  });
  const title = approve ? 'Approve Cash' : confirm ? 'Confirm Bank Credit' : 'Record Bank Deposit';
  return (
    <>
      <CustomDialog
        aria-busy={locked}
        open
        title={title}
        titleInfo={
          approve
            ? 'Confirm the remaining cash deposited into the receiving bank. Expenses already paid remain separate; only the deposited remainder becomes Income.'
            : confirm
              ? 'Record actual bank statement credit. Partial credit leaves the balance in transit.'
              : 'Record actual cash dispatched to the approved bank. Dispatch is not bank credit.'
        }
        handleClose={requestClose}
        guardUnsavedChanges={false}
        hasUnsavedChanges={formik.dirty}
        disableClose={locked}
        maxWidth="sm"
        formProps={{
          noValidate: true,
          onSubmit: async (event) => {
            event.preventDefault();
            await formik.submitForm();
          },
        }}
        paperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            {!allowed && (
              <Alert severity="error">This cash action is no longer available. Close.</Alert>
            )}
            {failure && (
              <Alert severity="error">
                {failure}
                {stale && (
                  <Button disabled={locked || refreshing} onClick={refreshLatest}>
                    Refresh cash details
                  </Button>
                )}
                <Button size="small" disabled={locked} onClick={requestClose}>
                  Close
                </Button>
              </Alert>
            )}
            {uncertain && (
              <Alert severity="warning">
                The outcome is uncertain. Retry submits the original cash command. Fields stay
                locked until its outcome is resolved.
              </Alert>
            )}
            {approve && options.isError && (
              <Alert
                severity="error"
                action={<Button onClick={() => options.refetch()}>Retry</Button>}
              >
                Active school bank accounts could not be loaded.
              </Alert>
            )}
            <FormSectionCard
              title={approve ? 'Approval Evidence' : 'Bank Evidence'}
              icon="mdi:bank-check"
              descriptionTooltip="Enter the actual amount and evidence. The server revalidates permission, reviewer eligibility, date and current available balance."
            >
              <Stack spacing={2}>
                {approve ? (
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Collected amount: {formatNumber(currentData.amount, 'INR')}
                    </Typography>
                    <Typography variant="body2">
                      Expenses paid: {formatNumber(currentData.spentAmount, 'INR')}
                    </Typography>
                    <Typography variant="body2">
                      Remaining to deposit: {formatNumber(maximum, 'INR')}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2">
                    {confirm ? 'Remaining bank credit to confirm' : 'Available cash'}:{' '}
                    {formatNumber(maximum, 'INR')}
                    {` · Bank destination: ${currentData.bankLabel ?? '—'}`}
                  </Typography>
                )}
                {approve && (
                  <ShakingTextField error={field('bankAccountId').error}>
                    <CustomSelect
                      required
                      label="Receiving school bank account"
                      name="bankAccountId"
                      value={formik.values.bankAccountId}
                      options={options.currentData?.bankAccounts ?? []}
                      labelKey="label"
                      valueKey="id"
                      isSearch
                      isLoading={options.isFetching}
                      disabled={fieldsBlocked || options.isError}
                      onChange={(value) => formik.setFieldValue('bankAccountId', value)}
                      onBlur={formik.handleBlur}
                      {...field('bankAccountId')}
                    />
                  </ShakingTextField>
                )}
                {approve && options.currentData?.bankAccounts.length === 0 && (
                  <Alert severity="warning">
                    An active school bank account is required before approval.
                  </Alert>
                )}
                <ShakingTextField error={field('amount').error}>
                  <NumericFormatCustom
                    fullWidth
                    size="small"
                    required
                    autoFocus
                    name="amount"
                    label={
                      approve
                        ? 'Counted amount'
                        : confirm
                          ? 'Actual credited amount'
                          : 'Deposit amount'
                    }
                    value={formik.values.amount}
                    valueIsNumericString
                    roundToWholeRupees={false}
                    decimalScale={2}
                    onValueChange={(value, source) => {
                      if (source.source === 'event') formik.setFieldValue('amount', value.value);
                    }}
                    disabled={fieldsBlocked}
                    onBlur={formik.handleBlur}
                    {...field('amount')}
                  />
                </ShakingTextField>
                {!approve && (
                  <>
                    <ShakingTextField error={field('date').error}>
                      <DateTimePicker
                        label={confirm ? 'Actual bank credit date' : 'Actual deposit date'}
                        value={dayjs(formik.values.date)}
                        maxDateTime={dayjs()}
                        minDateTime={
                          confirm
                            ? dayjs(currentDeposit?.depositDate)
                            : dayjs(currentData.collectedAt)
                        }
                        disabled={fieldsBlocked}
                        onChange={(value) =>
                          formik.setFieldValue('date', value?.isValid() ? value.toISOString() : '')
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            required: true,
                            name: 'date',
                            onBlur: formik.handleBlur,
                            ...field('date'),
                          },
                        }}
                      />
                    </ShakingTextField>
                    <ShakingTextField error={field('reference').error}>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        name="reference"
                        label={
                          confirm
                            ? 'Bank statement credit reference'
                            : 'Deposit slip / bank reference'
                        }
                        value={formik.values.reference}
                        disabled={fieldsBlocked}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        {...field('reference')}
                      />
                    </ShakingTextField>
                  </>
                )}
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  name="notes"
                  label="Notes (optional)"
                  value={formik.values.notes}
                  disabled={fieldsBlocked}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  {...field('notes')}
                />
              </Stack>
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
            disabled={
              blocked ||
              (!uncertain &&
                approve &&
                (options.isError || !options.currentData?.bankAccounts.length))
            }
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discard}
        icon="warning"
        title="Discard Unsaved Changes?"
        content={
          uncertain
            ? 'The command outcome is uncertain. Review Cash Management before starting another command if you leave; this exact retry request will be lost.'
            : 'Your cash evidence has unsaved changes. Leaving will discard them.'
        }
        cancelText="Keep editing"
        onClose={() => setDiscard(false)}
        action={
          <Button color="warning" variant="contained" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}
