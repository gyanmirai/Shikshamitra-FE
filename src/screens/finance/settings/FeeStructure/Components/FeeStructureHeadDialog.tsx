import type { StructureLine, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  Checkbox,
  IconButton,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { amountError, defaultPaymentTerm } from '../feeStructureModel';

interface Props {
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

export default function FeeStructureHeadDialog({
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
  const formik = useFormik({
    initialValues: {
      feeHeadId: line?.feeHeadId ?? '',
      amount: amountInput ?? (line?.amount == null ? '' : String(line.amount)),
      paymentTermVersionId: line
        ? line.paymentTermId
          ? (line.paymentTermVersionId ?? '')
          : ''
        : (defaultTerm?.versionId ?? ''),
      isVariable: line?.isVariable ?? false,
      isOptional: line?.isOptional ?? false,
      collectAtAdmission: line?.collectAtAdmission ?? false,
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
            const error =
              amountError(value) ||
              (value?.endsWith('.') ? 'Complete the amount after the decimal point.' : '');
            return error ? context.createError({ message: error }) : true;
          }),
      }),
      paymentTermVersionId: Yup.string().when('collectAtAdmission', {
        is: false,
        then: (schema) =>
          schema
            .required('Select a published payment frequency.')
            .test(
              'published',
              'Select a published payment frequency.',
              (id) =>
                (id === line?.paymentTermVersionId && !!line?.paymentTermId) ||
                settings.terms.some((term) => term.versionId === id)
            ),
      }),
      isVariable: Yup.boolean(),
      isOptional: Yup.boolean(),
      collectAtAdmission: Yup.boolean(),
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
      const next: StructureLine = {
        ...line,
        id: sameHead ? line?.id : undefined,
        feeHeadId: values.feeHeadId,
        feeHeadName: head?.name ?? line?.feeHeadName,
        categoryName: head?.categoryName ?? line?.categoryName,
        amount: values.isVariable ? null : Number(values.amount),
        isVariable: values.isVariable,
        isOptional: values.isOptional,
        collectAtAdmission: values.collectAtAdmission,
        isOneTime: line?.isOneTime ?? false,
        payableMonth: line?.payableMonth ?? 0,
        payableYear: line?.payableYear ?? 0,
        paymentTermId: values.collectAtAdmission ? null : sameTerm ? line!.paymentTermId : term!.id,
        paymentTermVersionId: values.collectAtAdmission ? null : values.paymentTermVersionId,
        paymentTermName: sameTerm ? line?.paymentTermName : term?.name,
        paymentTermVersionNumber: sameTerm ? line?.paymentTermVersionNumber : term?.versionNumber,
        scheduleMode: !values.collectAtAdmission && sameTerm ? line!.scheduleMode : 'Inherited',
        installmentOverrides:
          !values.collectAtAdmission && sameTerm ? line!.installmentOverrides : [],
      };
      helpers.setSubmitting(false);
      if (!values.collectAtAdmission && !sameTerm && line?.scheduleMode === 'Customized')
        setReplacement(next);
      else onSave(next);
    },
  });
  const { setFieldValue, values: dialogValues } = formik;
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
  const heads = settings.heads.filter(
    (head) => head.id === line?.feeHeadId || !lines.some((entry) => entry.feeHeadId === head.id)
  );
  if (line && !heads.some((head) => head.id === line.feeHeadId))
    heads.push({
      id: line.feeHeadId,
      name: line.feeHeadName || 'Retained fee head',
      categoryName: line.categoryName || '',
      isConcessionApplied: false,
    });
  const terms = settings.terms.map((term) => ({
    value: term.versionId,
    label: `${term.name} · v${term.versionNumber}${term.isDefault ? ' · Default' : ''}`,
  }));
  if (
    line?.paymentTermId &&
    line.paymentTermVersionId &&
    !terms.some((term) => term.value === line.paymentTermVersionId)
  )
    terms.push({
      value: line.paymentTermVersionId,
      label: `${line.paymentTermName || 'Attached term'} · v${line.paymentTermVersionNumber ?? '?'} · retained`,
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
              descriptionTooltip="The selected payment frequency determines installment dates and amount allocations. Optional heads are charged only when selected during assignment."
              icon="mdi:cash-multiple"
              title="Fee Head Details"
            >
              <ShakingTextField error={!!errorFor('feeHeadId')}>
                <CustomSelect
                  name="feeHeadId"
                  label="Fee head"
                  size="small"
                  required
                  isSearch
                  value={formik.values.feeHeadId}
                  options={heads}
                  labelKey="name"
                  valueKey="id"
                  disabled={busy || headsLoading || headsError || !settings.permissions.headsRead}
                  isLoading={headsLoading}
                  onChange={(value) => formik.setFieldValue('feeHeadId', String(value ?? ''))}
                  onBlur={() => formik.setFieldTouched('feeHeadId', true)}
                  error={!!errorFor('feeHeadId')}
                  helperText={errorFor('feeHeadId')}
                  noOptionsMessage="All available fee heads have been added."
                  formControlProps={{ fullWidth: true, required: true }}
                />
              </ShakingTextField>
              <FormControlLabel
                label="Set amount during student assignment"
                control={
                  <Switch
                    size="small"
                    checked={formik.values.isVariable}
                    disabled={busy}
                    onChange={(_event, checked) => {
                      formik.setFieldValue('isVariable', checked);
                      formik.setFieldValue('amount', '');
                    }}
                  />
                }
              />
              {!formik.values.isVariable && (
                <ShakingTextField error={!!errorFor('amount')}>
                  <NumericFormatCustom
                    name="amount"
                    label="Annual amount"
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
                    helperText={errorFor('amount')}
                  />
                </ShakingTextField>
              )}
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center">
                  <FormControlLabel
                    label="Collect at admission"
                    control={
                      <Switch
                        name="collectAtAdmission"
                        size="small"
                        checked={formik.values.collectAtAdmission}
                        disabled={busy}
                        onChange={(_event, checked) =>
                          formik.setFieldValue('collectAtAdmission', checked)
                        }
                      />
                    }
                  />
                  <CustomTooltip
                    placement="right"
                    title="When enabled, this head creates no regular fee dues, does not appear in Fee Collection, and is not counted as income. This option does not collect money or mark a payment as received during admission. Save the structure draft to retain this choice."
                  >
                    <IconButton size="small" aria-label="About collect at admission" color="info">
                      <Iconify icon="mdi:information-outline" width={18} />
                    </IconButton>
                  </CustomTooltip>
                </Stack>
                {formik.values.collectAtAdmission && (
                  <Typography variant="caption" color="text.secondary">
                    Excluded from Fee Collection and income. No admission payment is recorded.
                  </Typography>
                )}
              </Stack>
              {!formik.values.collectAtAdmission && (
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
              )}
              {!formik.values.collectAtAdmission && termsError && (
                <Alert severity="error">
                  Payment frequencies could not be loaded. Close and retry terms; your saved
                  attachment is preserved.
                </Alert>
              )}
              <FormControlLabel
                label="Optional fee head"
                control={
                  <Checkbox
                    size="small"
                    checked={formik.values.isOptional}
                    disabled={busy}
                    onChange={(_event, checked) => formik.setFieldValue('isOptional', checked)}
                  />
                }
              />
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
