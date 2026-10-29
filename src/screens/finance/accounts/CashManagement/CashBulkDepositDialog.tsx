'use client';

import type { RootState } from 'src/redux/store';
import type { CashBulkDepositInput } from 'src/redux/finance/cashManagementApi';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import CustomUpload from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetCashOptionsQuery,
  useBulkDepositCashMutation,
} from 'src/redux/finance/cashManagementApi';
import {
  Stack,
  Alert,
  Button,
  TextField,
  FormLabel,
  Typography,
  DialogActions,
} from '@mui/material';

const types = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
export const bulkDepositSchema = Yup.object({
  bankAccountId: Yup.string().required('Select a receiving school bank account.'),
  notes: Yup.string().trim().max(1000, 'Notes must be 1,000 characters or fewer.'),
  file: Yup.mixed<File>()
    .nullable()
    .test(
      'type',
      'Select a PDF, JPG, JPEG or PNG file.',
      (file) => !file || types.includes(file.type)
    )
    .test(
      'size',
      'File exceeds the 5 MB size limit.',
      (file) => !file || file.size <= 5 * 1024 * 1024
    ),
});

export default function CashBulkDepositDialog({
  academicYearId,
  amount,
  onClose,
  onRefresh,
  initialBankAccountId,
}: {
  academicYearId: string;
  amount: number;
  onClose: () => void;
  onRefresh: () => Promise<number>;
  initialBankAccountId?: string;
}) {
  const auth = useSelector((state: RootState) => state.auth);
  const allowed =
    auth.permissionsInitialized &&
    !auth.loading &&
    hasGrantedPermission(auth.permissions, `${financePermissions.accounts.cashManagement}.Deposit`);
  const [expectedAmount, setExpectedAmount] = useState(amount);
  const [failure, setFailure] = useState('');
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const discard = useBoolean();
  const pending = useRef<CashBulkDepositInput | null>(null);
  const inFlight = useRef(false);
  const options = useGetCashOptionsQuery(
    { academicYearId, operation: 'deposit' },
    { skip: !allowed, refetchOnMountOrArgChange: true }
  );
  const [save] = useBulkDepositCashMutation();
  const formik = useFormik({
    initialValues: {
      bankAccountId: initialBankAccountId ?? '',
      notes: '',
      file: null as File | null,
    },
    validationSchema: uncertain ? undefined : bulkDepositSchema,
    onSubmit: async (values) => {
      if (
        inFlight.current ||
        !allowed ||
        stale ||
        refreshing ||
        expectedAmount <= 0 ||
        (!uncertain && (options.isFetching || options.isError || !options.currentData))
      )
        return;
      if (
        !uncertain &&
        !options.currentData?.bankAccounts.some((bank) => bank.id === values.bankAccountId)
      ) {
        formik.setFieldError('bankAccountId', 'Select an available school bank account.');
        return;
      }
      inFlight.current = true;
      setFailure('');
      if (!uncertain)
        pending.current = {
          academicYearId,
          bankAccountId: values.bankAccountId,
          expectedAmount,
          notes: values.notes.trim() || undefined,
          file: values.file || undefined,
          idempotencyKey: crypto.randomUUID(),
        };
      try {
        await save(pending.current!).unwrap();
        shikshaMitraToast.success({ message: 'Cash deposited into the selected bank account.' });
        formik.resetForm();
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        setFailure(problem.detail);
        setStale(problem.errorCode === 'Finance:CashManagement:Stale');
        const status = (error as { status?: number | string })?.status;
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
  const busy = formik.isSubmitting || refreshing;
  const fieldsBlocked = busy || uncertain || !allowed;
  const requestClose = () => {
    if (busy) return;
    if (formik.dirty || uncertain) discard.onTrue();
    else onClose();
  };
  useEffect(() => {
    if (!formik.dirty && !busy && !uncertain) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [formik.dirty, busy, uncertain]);
  const refresh = async () => {
    setRefreshing(true);
    try {
      const [latest] = await Promise.all([onRefresh(), options.refetch().unwrap()]);
      setExpectedAmount(latest);
      setStale(false);
      setFailure('');
      pending.current = null;
    } catch (error) {
      setFailure(parseApiProblemDetail(error).detail);
    } finally {
      setRefreshing(false);
    }
  };
  const bankError = Boolean(
    (formik.touched.bankAccountId || formik.submitCount > 0) && formik.errors.bankAccountId
  );
  return (
    <>
      <CustomDialog
        open
        title="Deposit Cash"
        maxWidth="sm"
        titleInfo="Deposit all available cash in the selected academic year. Table filters do not change this amount."
        handleClose={requestClose}
        guardUnsavedChanges={false}
        hasUnsavedChanges={formik.dirty}
        disableClose={busy}
        aria-busy={busy}
        formProps={{
          noValidate: true,
          onSubmit: async (event) => {
            event.preventDefault();
            await formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {!allowed && (
              <Alert severity="error">You do not have permission to deposit cash.</Alert>
            )}
            {failure && (
              <Alert severity="error">
                {failure}
                {stale && (
                  <Button size="small" disabled={busy} onClick={refresh}>
                    Refresh cash balance
                  </Button>
                )}
              </Alert>
            )}
            {uncertain && (
              <Alert severity="warning">
                The deposit outcome is uncertain. Retry sends the original request to prevent a
                duplicate deposit.
              </Alert>
            )}
            {options.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" disabled={busy} onClick={() => options.refetch()}>
                    Retry
                  </Button>
                }
              >
                School bank accounts could not be loaded.
              </Alert>
            )}
            {expectedAmount <= 0 && (
              <Alert severity="info">No cash is available to deposit for this academic year.</Alert>
            )}
            <FormSectionCard
              title="Deposit Details"
              icon={GlobalIcons.bankAccount}
              descriptionTooltip="The amount includes all available cash for this academic year after paid cash expenses and previous deposits."
            >
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Total academic-year cash to deposit
                  </Typography>
                  <Typography variant="subtitle1">{formatNumber(expectedAmount, 'INR')}</Typography>
                </Stack>
                <ShakingTextField error={bankError}>
                  <CustomSelect
                    required
                    fullWidth
                    size="small"
                    name="bankAccountId"
                    label="Receiving school bank account"
                    value={formik.values.bankAccountId}
                    options={options.currentData?.bankAccounts ?? []}
                    labelKey="label"
                    valueKey="id"
                    isSearch
                    isLoading={options.isFetching}
                    disabled={fieldsBlocked || options.isError || options.isFetching}
                    onChange={(value) => formik.setFieldValue('bankAccountId', value)}
                    onBlur={formik.handleBlur}
                    error={bankError}
                    helperText={bankError ? formik.errors.bankAccountId : undefined}
                  />
                </ShakingTextField>
                {!options.isFetching && options.currentData?.bankAccounts.length === 0 && (
                  <Alert severity="warning">
                    Add an active school bank account before depositing cash.
                  </Alert>
                )}
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  name="notes"
                  label="Notes (optional)"
                  value={formik.values.notes}
                  disabled={fieldsBlocked}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.notes && formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Stack>
            </FormSectionCard>
            <FormSectionCard
              title="Attachments"
              icon={GlobalIcons.documentIcon}
              descriptionTooltip="Optionally attach a deposit slip or supporting document to this deposit."
            >
              <Stack spacing={1}>
                <FormLabel id="cash-deposit-document-label">
                  Supporting document (optional)
                </FormLabel>
                <CustomUpload
                  multiple={false}
                  value={formik.values.file ?? undefined}
                  disabled={fieldsBlocked}
                  loading={formik.isSubmitting && Boolean(formik.values.file)}
                  primaryText="Upload document"
                  onChange={(file) => {
                    formik.setFieldTouched('file', true, false);
                    formik.setFieldValue('file', file ?? null);
                  }}
                  onReject={(message) => {
                    formik.setFieldTouched('file', true, false);
                    formik.setFieldError('file', message);
                  }}
                  error={formik.touched.file ? formik.errors.file : undefined}
                  dragProps={{
                    'aria-labelledby': 'cash-deposit-document-label',
                    'aria-describedby': 'cash-deposit-document-help',
                  }}
                />
                <Typography
                  id="cash-deposit-document-help"
                  variant="caption"
                  color="text.secondary"
                >
                  One PDF, JPG, JPEG or PNG file, up to 5 MB.
                </Typography>
              </Stack>
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            color="inherit"
            loading={formik.isSubmitting}
            disabled={
              busy ||
              !allowed ||
              stale ||
              expectedAmount <= 0 ||
              (!uncertain &&
                (options.isFetching ||
                  options.isError ||
                  !options.currentData?.bankAccounts.length))
            }
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            {uncertain ? 'Retry deposit' : 'Deposit cash'}
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Unsaved Changes?"
        icon="warning"
        cancelText="Keep editing"
        content={
          uncertain
            ? 'The deposit outcome is uncertain. Check Cash Management before starting another deposit if you leave.'
            : 'Your deposit details have unsaved changes.'
        }
        action={
          <Button
            size="small"
            color="warning"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={onClose}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
