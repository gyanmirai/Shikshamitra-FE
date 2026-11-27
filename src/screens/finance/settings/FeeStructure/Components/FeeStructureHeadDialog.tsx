import type { StructureLine, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { roundUpAmount } from 'src/utils/whole-rupee-amount';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStructureTermScheduleQuery } from 'src/redux/finance/feeStructureWorkspace';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Alert,
  Button,
  Switch,
  TextField,
  FormGroup,
  Autocomplete,
  DialogActions,
  FormControlLabel,
  Skeleton,
} from '@mui/material';

import { amountError, defaultPaymentTerm } from '../feeStructureModel';
import { monthlyInstallmentCount, resolveStructureInstallments } from './structureScheduleAmounts';

const filterHeads = createFilterOptions<{
  id: string;
  name: string;
  categoryName: string;
  label: string;
}>({ stringify: (head) => `${head.name} ${head.categoryName}` });

interface Props {
  scope: { feeStructureMetadataId: string; standardId: string };
  line?: StructureLine;
  revealErrors?: boolean;
  amountInput?: string;
  lines: StructureLine[];
  settings: StructureSettings;
  busy: boolean;
  headsLoading: boolean;
  headsError: boolean;
  termsLoading: boolean;
  termsError: boolean;
  onClose: () => void;
  onSave: (line: StructureLine) => void;
}

interface FeeHeadFormValues {
  feeHeadId: string;
  amount: string;
  paymentTermVersionId: string;
  isVariable: boolean;
  isMonthlyRate: boolean;
  isOptional: boolean;
}

export default function FeeStructureHeadDialog({
  scope,
  line,
  revealErrors = false,
  amountInput,
  lines,
  settings,
  busy,
  headsLoading,
  headsError,
  termsLoading,
  termsError,
  onClose,
  onSave,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const termChoiceMade = useRef(false);
  const [replacement, setReplacement] = useState<StructureLine>();
  const defaultTerm = settings.permissions.termsRead
    ? defaultPaymentTerm(settings.terms)
    : undefined;
  const monthlyCount = (versionId: string): number => {
    const term = settings.terms.find((entry) => entry.versionId === versionId);
    const overrides = versionId === line?.paymentTermVersionId ? line.installmentOverrides : [];
    const schedule: StructureSettings['terms'][number] | undefined = termSchedule.currentData;
    const installments =
      schedule?.versionId === versionId ? schedule.installments : term?.installments;
    return monthlyInstallmentCount(resolveStructureInstallments(installments ?? [], overrides));
  };
  const retainedMonthlyTerm = (versionId: string): boolean =>
    line?.monthlyRate != null &&
    versionId === line.paymentTermVersionId &&
    !(termSchedule.currentData?.versionId === versionId);
  const formik = useFormik<FeeHeadFormValues>({
    initialValues: {
      feeHeadId: line?.feeHeadId ?? '',
      amount:
        line?.monthlyRate != null
          ? String(line.monthlyRate)
          : (amountInput ?? (line?.amount == null ? '' : String(line.amount))),
      paymentTermVersionId: line
        ? line.paymentTermId
          ? (line.paymentTermVersionId ?? '')
          : ''
        : (defaultTerm?.versionId ?? ''),
      isVariable: line?.isVariable ?? false,
      isMonthlyRate: line?.monthlyRate != null,
      isOptional: line?.isOptional ?? false,
    },
    validateOnMount: revealErrors,
    validationSchema: Yup.object({
      feeHeadId: Yup.string()
        .required('Select a fee head.')
        .test(
          'available',
          'Select an available fee head.',
          (id) => id === line?.feeHeadId || settings.heads.some((head) => head.id === id)
        )
        .test(
          'unique',
          'This fee head is already in the structure.',
          (id) =>
            !lines.some((entry) => entry.feeHeadId === id && entry.feeHeadId !== line?.feeHeadId)
        ),
      amount: Yup.string().when('isVariable', {
        is: false,
        then: (schema) =>
          schema.test('amount', (value, context) => {
            const { isMonthlyRate, paymentTermVersionId } = context.parent;
            const months = isMonthlyRate ? monthlyCount(paymentTermVersionId) : 0;
            const error =
              amountError(value) ||
              (value?.endsWith('.') ? 'Complete the amount after the decimal point.' : '') ||
              (isMonthlyRate && !months && !retainedMonthlyTerm(paymentTermVersionId)
                ? 'Select a payment term with one installment per covered month.'
                : '') ||
              (months && roundUpAmount(Number(value)) * months > 9999999999.99
                ? 'The monthly amount produces a term total above the allowed limit.'
                : '');
            return error ? context.createError({ message: error }) : true;
          }),
      }),
      paymentTermVersionId: Yup.string()
        .required('Select a published payment frequency.')
        .test(
          'published',
          'Select a published payment frequency.',
          (id) =>
            (id === line?.paymentTermVersionId && !!line?.paymentTermId) ||
            settings.terms.some((term) => term.versionId === id)
        ),
      isVariable: Yup.boolean(),
      isMonthlyRate: Yup.boolean(),
      isOptional: Yup.boolean(),
    }),
    onSubmit: (values, helpers) => {
      if (busy) {
        helpers.setSubmitting(false);
        return;
      }
      const head = settings.heads.find((entry) => entry.id === values.feeHeadId);
      const sameHead = values.feeHeadId === line?.feeHeadId;
      const sameTerm =
        values.paymentTermVersionId === line?.paymentTermVersionId && !!line?.paymentTermId;
      const term = settings.terms.find((entry) => entry.versionId === values.paymentTermVersionId);
      const rate = !values.isVariable && values.isMonthlyRate ? Number(values.amount) : null;
      const months = rate != null ? monthlyCount(values.paymentTermVersionId) : 0;
      const next: StructureLine = {
        ...line,
        id: sameHead ? line?.id : undefined,
        feeHeadId: values.feeHeadId,
        feeHeadName: head?.name ?? line?.feeHeadName,
        categoryName: head?.categoryName ?? line?.categoryName,
        amount: values.isVariable
          ? null
          : rate == null
            ? Number(values.amount)
            : months
              ? roundUpAmount(rate) * months
              : (line?.amount ?? null),
        monthlyRate: rate,
        isVariable: values.isVariable,
        isOptional: values.isOptional,
        isOneTime: line?.isOneTime ?? false,
        payableMonth: line?.payableMonth ?? 0,
        payableYear: line?.payableYear ?? 0,
        paymentTermId: sameTerm ? line!.paymentTermId : term!.id,
        paymentTermVersionId: values.paymentTermVersionId,
        paymentTermName: sameTerm ? line?.paymentTermName : term?.name,
        paymentTermVersionNumber: sameTerm ? line?.paymentTermVersionNumber : term?.versionNumber,
        scheduleMode: sameTerm ? line!.scheduleMode : 'Inherited',
        installmentOverrides: sameTerm ? line!.installmentOverrides : [],
      };
      helpers.setSubmitting(false);
      if (!sameTerm && line?.scheduleMode === 'Customized') setReplacement(next);
      else onSave(next);
    },
  });
  const { setFieldValue, values: dialogValues } = formik;
  const selectedTerm = settings.terms.find(
    (term) => term.versionId === dialogValues.paymentTermVersionId
  );
  const selectedTermId =
    selectedTerm?.id ??
    (dialogValues.paymentTermVersionId === line?.paymentTermVersionId ? line?.paymentTermId : null);
  const termSchedule = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStructureTermScheduleQuery,
    params: {
      ...scope,
      paymentTermId: selectedTermId ?? '',
      versionId: dialogValues.paymentTermVersionId,
    },
    options: {
      skip:
        !settings.permissions.termsRead ||
        !selectedTermId ||
        !dialogValues.paymentTermVersionId ||
        dialogValues.isVariable ||
        !!line?.isOneTime ||
        !!selectedTerm?.installments?.length,
    },
    popupConfig: { error: false },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    keepEditingLabel: 'Keep Editing',
    discardLabel: 'Discard Changes',
    blockNavigation: busy,
    push: (href) => window.location.assign(href),
  });
  const handleClose = () => requestNavigation(onClose);
  useEffect(() => {
    if (!line && defaultTerm && !dialogValues.paymentTermVersionId && !termChoiceMade.current)
      setFieldValue('paymentTermVersionId', defaultTerm.versionId);
  }, [line, defaultTerm, dialogValues.paymentTermVersionId, setFieldValue]);
  useEffect(() => {
    if ((formik.submitCount || revealErrors) && !formik.isValidating)
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [formik.submitCount, formik.isValidating, revealErrors]);
  const headOptions = useMemo(() => {
    const selectedIds = new Set(lines.map((entry) => entry.feeHeadId));
    const knownIds = new Set(settings.heads.map((head) => head.id));
    const nameCounts = new Map<string, number>();
    settings.heads.forEach((head) =>
      nameCounts.set(head.name, (nameCounts.get(head.name) ?? 0) + 1)
    );
    const heads = settings.heads.filter(
      (head) => head.id === line?.feeHeadId || !selectedIds.has(head.id)
    );
    if (line && !heads.some((head) => head.id === line.feeHeadId))
      heads.push({
        id: line.feeHeadId,
        name: line.feeHeadName || 'Retained fee head',
        categoryName: line.categoryName || '',
        isConcessionApplied: false,
      });
    return heads
      .map((head) => {
        const categoryName = head.categoryName?.trim() || 'Category unavailable';
        const duplicateName = (nameCounts.get(head.name) ?? 0) > (knownIds.has(head.id) ? 1 : 0);
        return {
          ...head,
          categoryName,
          label: duplicateName ? `${head.name} · ${categoryName}` : head.name,
        };
      })
      .sort(
        (left, right) =>
          left.categoryName.localeCompare(right.categoryName) || left.name.localeCompare(right.name)
      );
  }, [settings.heads, lines, line]);
  const terms = settings.terms.map((term) => ({
    value: term.versionId,
    label: `${term.name}${term.isDefault ? ' · Default' : ''}`,
    version: `v${term.versionNumber}`,
  }));
  if (
    line?.paymentTermId &&
    line.paymentTermVersionId &&
    !terms.some((term) => term.value === line.paymentTermVersionId)
  )
    terms.push({
      value: line.paymentTermVersionId,
      label: `${line.paymentTermName || 'Attached term'} · retained`,
      version: `v${line.paymentTermVersionNumber ?? '?'}`,
    });
  const errorFor = (field: keyof typeof formik.values) =>
    revealErrors || formik.touched[field] || formik.submitCount > 0
      ? formik.errors[field]
      : undefined;
  return (
    <>
      <CustomDialog
        titleInfo="Configure this fee head's annual amount and published installment schedule. Save the structure draft to persist the row."
        open
        title={line ? 'Edit Fee Head' : 'Add Fee Head'}

        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={() => handleClose()}
      >
        <Box
          component="form"
          ref={formRef}
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ minHeight: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
        >
          <DialogScrollContent>
            <FormSectionCard
              descriptionTooltip="The payment frequency determines installment dates and allocations."
              icon="mdi:cash-multiple"
              title="Fee Head Details"
            >
              <ShakingTextField error={!!errorFor('feeHeadId')}>
                <Autocomplete
                  size="small"
                  options={headOptions}
                  filterOptions={filterHeads}
                  groupBy={(option) => option.categoryName || 'Other'}
                  getOptionLabel={(option) => option.label || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={headOptions.find((head) => head.id === formik.values.feeHeadId) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('feeHeadId', String(newValue?.id ?? ''));
                  }}
                  disabled={
                    busy || headsLoading || Boolean(headsError) || !settings.permissions.headsRead
                  }
                  loading={headsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="feeHeadId"
                      label="Fee head"
                      placeholder="Search fee category or fee head"
                      required
                      onBlur={() => formik.setFieldTouched('feeHeadId', true)}
                      error={!!errorFor('feeHeadId')}
                      helperText={errorFor('feeHeadId')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {headsLoading && (
                              <Skeleton
                                variant="rounded"
                                width={18}
                                height={18}
                                role="status"
                                aria-label="Loading fee heads"
                              />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="All available fee heads have been added."
                  fullWidth
                />
              </ShakingTextField>
              <FormGroup
                role="group"
                aria-label="Fee options"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                  columnGap: { xs: 1, sm: 2 },
                  rowGap: 1,
                  '& > .MuiBox-root': { display: 'flex', alignItems: 'center' },
                  '& .MuiFormControlLabel-root': { m: 0, minWidth: 0 },
                  '& .MuiFormControlLabel-label': { overflowWrap: 'break-word' },
                  '& .MuiSwitch-root': { flexShrink: 0 },
                  '@media (max-width: 439px)': {
                    '& > .MuiBox-root': { alignItems: 'flex-start' },
                    '& .MuiFormControlLabel-root': {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                    },
                    '& .MuiSwitch-root': { my: 1.25 },
                  },
                }}
              >
                <Box>
                  <FormControlLabel
                    label="Variable amount"
                    control={
                      <Switch
                        size="small"
                        checked={formik.values.isVariable}
                        disabled={busy}
                        onChange={(_event, checked) => {
                          formik.setFieldValue('isVariable', checked);
                          formik.setFieldValue('isMonthlyRate', false);
                          formik.setFieldValue('amount', '');
                        }}
                      />
                    }
                  />
                  <InfoTooltipIcon
                    label="Variable amount information"
                    title="Enter the amount when assigning the fee structure to a student."
                    disabled={busy}
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    label="Optional fee"
                    control={
                      <Switch
                        size="small"
                        checked={formik.values.isOptional}
                        disabled={busy}
                        onChange={(_event, checked) => formik.setFieldValue('isOptional', checked)}
                      />
                    }
                  />
                  <InfoTooltipIcon
                    label="Optional fee information"
                    title="The fee is charged only if selected during student assignment."
                    disabled={busy}
                  />
                </Box>
                {!formik.values.isVariable &&
                  !line?.isOneTime &&
                  (formik.values.isMonthlyRate ||
                    monthlyCount(formik.values.paymentTermVersionId) > 0) && (
                    <Box>
                      <FormControlLabel
                        label="Charge per month"
                        control={
                          <Switch
                            size="small"
                            checked={formik.values.isMonthlyRate}
                            disabled={busy}
                            onChange={(_event, checked) => {
                              formik.setFieldValue('isMonthlyRate', checked);
                              formik.setFieldValue('amount', '');
                            }}
                          />
                        }
                      />
                    </Box>
                  )}
              </FormGroup>
              {!formik.values.isVariable && (
                <ShakingTextField error={!!errorFor('amount')}>
                  <NumericFormatCustom
                    name="amount"
                    label={formik.values.isMonthlyRate ? 'Monthly amount' : 'Annual amount'}
                    required
                    size="small"
                    fullWidth
                    value={formik.values.amount}
                    valueIsNumericString
                    roundToWholeRupees={false}
                    decimalScale={2}
                    allowNegative={false}
                    isAllowed={({ floatValue }) =>
                      floatValue === undefined || floatValue <= 9999999999.99
                    }
                    onValueChange={({ value }, source) => {
                      if (source.source === 'event') formik.setFieldValue('amount', value);
                    }}
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    error={!!errorFor('amount')}
                    helperText={
                      errorFor('amount') ||
                      (formik.values.isMonthlyRate ? 'Charged for each covered month.' : undefined)
                    }
                  />
                </ShakingTextField>
              )}
              <ShakingTextField error={!!errorFor('paymentTermVersionId')}>
                <CustomSelect
                  name="paymentTermVersionId"
                  label="Payment frequency"
                  size="small"
                  required
                  isSearch
                  value={formik.values.paymentTermVersionId}
                  options={terms}
                  labelKey="label"
                  valueKey="value"
                  optionEndLabelKey="version"
                  renderValue={(value) => {
                    const term = terms.find((option) => option.value === value);
                    return term ? `${term.label} · ${term.version}` : '';
                  }}
                  disabled={
                    busy || (termsLoading && !terms.length) || !settings.permissions.termsRead
                  }
                  isLoading={termsLoading}
                  onChange={(value) => {
                    termChoiceMade.current = true;
                    formik.setFieldTouched('paymentTermVersionId', true, false);
                    formik.setFieldValue('paymentTermVersionId', String(value ?? ''));
                  }}
                  onBlur={() => formik.setFieldTouched('paymentTermVersionId', true)}
                  error={!!errorFor('paymentTermVersionId')}
                  helperText={
                    errorFor('paymentTermVersionId') ||
                    (!settings.permissions.termsRead
                      ? 'You do not have permission to browse payment terms.'
                      : !terms.length && !termsLoading
                        ? 'Publish a payment term for this academic year and board, then retry terms.'
                        : undefined) ||
                    undefined
                  }
                  formControlProps={{ fullWidth: true, required: true }}
                />
              </ShakingTextField>
              {termsError && (
                <Alert severity="error">
                  Payment frequencies could not be loaded. Close and retry terms; your saved
                  attachment is preserved.
                </Alert>
              )}
            </FormSectionCard>
          </DialogScrollContent>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              disabled={busy}
              onClick={() => handleClose()}
            >
              Cancel
            </Button>
            <SubmitButton
              buttonText="Save"
              disabled={busy || !!replacement}
              loading={formik.isSubmitting}
            />
          </DialogActions>
        </Box>
      </CustomDialog>
      {confirmation}
      <ConfirmDialog
        disableCancel={busy}
        open={!!replacement}
        onClose={() => setReplacement(undefined)}
        title="Replace Customized Schedule?"
        content="Changing the payment frequency replaces this fee head's customized installments with the selected published schedule."
        action={
          <Button
            variant="contained"
            size="small"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            onClick={() => {
              if (replacement && !busy) onSave(replacement);
            }}
          >
            Replace Schedule
          </Button>
        }
      />
    </>
  );
}
