'use client';

import type { FormEvent } from 'react';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useAddPFMutation, useUpdatePFMutation } from 'src/redux/PF/PFApi';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  MenuItem,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  SetupEditorBody,
  SetupEditorGuard,
  SetupEditorActions,
  useHrSetupEditorState,
} from 'src/screens/hr/setup/hr-setup-editor-context';

type EditablePfRule = {
  id: string;
  code: string;
  name: string;
  employeePercentage: number;
  employerPercentage: number;
  contributionBasis: number;
  wageCeiling?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export function PFForm({
  editData,
  handleClose,
  onBusyChange,
}: {
  editData: Partial<EditablePfRule> | null;
  handleClose: (event?: unknown, saved?: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [addPF, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddPFMutation,
    popupConfig: { error: false },
  });
  const [updatePF, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePFMutation,
    popupConfig: { error: false },
  });
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [formError, setFormError] = useState('');
  const rootRef = useRef<HTMLElement>(null);
  const focusedSubmit = useRef(0);
  const formik = useFormik({
    initialValues: {
      code: editData?.code || '',
      name: editData?.name || '',
      employeePercentage: String(editData?.employeePercentage ?? ''),
      employerPercentage: String(editData?.employerPercentage ?? ''),
      contributionBasis: editData?.contributionBasis ?? 0,
      wageCeiling: String(editData?.wageCeiling ?? ''),
      effectiveFrom: editData?.effectiveFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      effectiveTo: editData?.effectiveTo?.slice(0, 10) || '',
      isActive: editData?.isActive ?? true,
    },
    validationSchema: Yup.object().shape({
      code: Yup.string().required('Code is required'),
      name: Yup.string().required('Name is required'),
      employeePercentage: Yup.number()
        .typeError('Staff Percentage must be a number')
        .required('Staff Percentage is required')
        .min(0, 'Staff Percentage cannot be less than 0')
        .max(100, 'Staff Percentage cannot be more than 100'),
      employerPercentage: Yup.number()
        .typeError('Employer Percentage must be a number')
        .required('Employer Percentage is required')
        .min(0, 'Employer Percentage cannot be less than 0')
        .max(100, 'Employer Percentage cannot be more than 100'),
      contributionBasis: Yup.number().oneOf([0, 1]).required('Contribution basis is required'),
      wageCeiling: Yup.number()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .min(0, 'Wage ceiling cannot be negative'),
      effectiveFrom: Yup.string().required('Effective from is required'),
      effectiveTo: Yup.string()
        .nullable()
        .test(
          'after-effective-from',
          'Effective to must be on or after effective from',
          (value, context) =>
            !value || !context.parent.effectiveFrom || value >= context.parent.effectiveFrom
        ),
    }),
    onSubmit: async (values) => {
      if (isLoading || isUpdatePFLoading) return;
      setFormError('');
      const body = {
        ...values,
        employeePercentage: Number(values.employeePercentage),
        employerPercentage: Number(values.employerPercentage),
        wageCeiling: values.wageCeiling === '' ? null : Number(values.wageCeiling),
        effectiveTo: values.effectiveTo || null,
      };
      try {
        if (editData)
          await updatePF({
            body: { ...body, academicYearId: currentYear?.id },
            id: editData.id,
          }).unwrap();
        else await addPF({ body, academicYearId: currentYear?.id }).unwrap();
        shikshaMitraToast.success({
          message: `PF rule "${values.name}" ${editData ? 'updated' : 'created'} successfully`,
        });
        handleClose(undefined, true);
      } catch (error) {
        setFormError(parseApiProblemDetail(error).detail);
      }
    },
  });
  const busy = isLoading || isUpdatePFLoading || formik.isSubmitting;
  const embedded = useHrSetupEditorState({ dirty: formik.dirty, busy, save: formik.submitForm });
  useEffect(() => {
    rootRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  useEffect(() => {
    if (
      !formik.isSubmitting &&
      !formik.isValidating &&
      formik.submitCount > focusedSubmit.current
    ) {
      focusedSubmit.current = formik.submitCount;
      rootRef.current
        ?.querySelector<HTMLElement>(
          'input[aria-invalid="true"], [role="combobox"][aria-invalid="true"]'
        )
        ?.focus();
    }
  }, [formik.submitCount, formik.isSubmitting, formik.isValidating, formik.errors]);
  const showError = (field: keyof typeof formik.values) =>
    Boolean((formik.touched[field] || formik.submitCount > 0) && formik.errors[field]);
  const feedback = (field: keyof typeof formik.values) =>
    showError(field) ? String(formik.errors[field]) : undefined;
  const gridSx = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
  };
  return (
    <Box
      ref={rootRef}
      component={embedded ? 'div' : 'form'}
      onSubmit={(event: FormEvent<HTMLElement>) => {
        event.preventDefault();
        formik.handleSubmit();
      }}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}
    >
      <SetupEditorGuard initialValues={formik.initialValues} currentValues={formik.values}>
        <SetupEditorBody>
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <FormSectionCard
              title="Rule Details"
              icon={GlobalIcons.documentIcon}
              descriptionTooltip="Identify the PF rule used during staff salary setup."
            >
              <FormFieldSpacing sx={gridSx}>
                <ShakingTextField error={showError('name')} sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    error={showError('name')}
                    helperText={feedback('name')}
                  />
                </ShakingTextField>
                <ShakingTextField error={showError('code')}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Code"
                    name="code"
                    value={formik.values.code}
                    onChange={(event) =>
                      formik.setFieldValue(
                        'code',
                        event.target.value.toUpperCase().replace(/[^A-Z_]/g, '')
                      )
                    }
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    error={showError('code')}
                    helperText={feedback('code')}
                  />
                </ShakingTextField>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      disabled={busy}
                      checked={formik.values.isActive}
                      onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
                    />
                  }
                  label="Active rule"
                />
              </FormFieldSpacing>
            </FormSectionCard>
            <FormSectionCard
              title="Contribution Rules"
              icon={GlobalIcons.assigned}
              descriptionTooltip="Contribution percentages use the selected wage basis. A blank wage ceiling leaves the contribution amount uncapped by this rule."
            >
              <FormFieldSpacing sx={gridSx}>
                {(['employeePercentage', 'employerPercentage'] as const).map((field) => (
                  <ShakingTextField key={field} error={showError(field)}>
                    <NumericFormatCustom
                      required
                      fullWidth
                      size="small"
                      name={field}
                      label={
                        field === 'employeePercentage' ? 'Staff percentage' : 'Employer percentage'
                      }
                      value={formik.values[field]}
                      valueIsNumericString
                      roundToWholeRupees={false}
                      prefix=""
                      suffix="%"
                      allowNegative={false}
                      isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= 100}
                      onValueChange={(values, source) => {
                        if (source.source === 'event') formik.setFieldValue(field, values.value);
                      }}
                      onBlur={formik.handleBlur}
                      disabled={busy}
                      error={showError(field)}
                      helperText={feedback(field)}
                    />
                  </ShakingTextField>
                ))}
                <ShakingTextField error={showError('contributionBasis')}>
                  <TextField
                    required
                    select
                    fullWidth
                    size="small"
                    label="Contribution basis"
                    name="contributionBasis"
                    value={formik.values.contributionBasis}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    error={showError('contributionBasis')}
                    helperText={feedback('contributionBasis')}
                  >
                    <MenuItem value={0}>Basic</MenuItem>
                    <MenuItem value={1}>Basic + Dearness Allowance</MenuItem>
                  </TextField>
                </ShakingTextField>
                <NumericFormatCustom
                  fullWidth
                  size="small"
                  label="Wage ceiling"
                  name="wageCeiling"
                  value={formik.values.wageCeiling}
                  valueIsNumericString
                  roundToWholeRupees={false}
                  decimalScale={2}
                  allowNegative={false}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || Number.isFinite(floatValue)
                  }
                  onValueChange={(values, source) => {
                    if (source.source === 'event')
                      formik.setFieldValue('wageCeiling', values.value);
                  }}
                  onBlur={formik.handleBlur}
                  disabled={busy}
                  error={showError('wageCeiling')}
                  helperText={feedback('wageCeiling') || 'Leave blank for no ceiling'}
                />
              </FormFieldSpacing>
            </FormSectionCard>
            <FormSectionCard
              title="Effective Dates"
              icon={GlobalIcons.calendar}
              descriptionTooltip="Use this rule from its start date through the optional end date."
            >
              <FormFieldSpacing sx={gridSx}>
                <ShakingTextField error={showError('effectiveFrom')}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="date"
                    label="Effective from"
                    name="effectiveFrom"
                    value={formik.values.effectiveFrom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={busy}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={showError('effectiveFrom')}
                    helperText={feedback('effectiveFrom')}
                  />
                </ShakingTextField>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Effective to"
                  name="effectiveTo"
                  value={formik.values.effectiveTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={busy}
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={showError('effectiveTo')}
                  helperText={feedback('effectiveTo') || 'Optional'}
                />
              </FormFieldSpacing>
            </FormSectionCard>
          </Stack>
        </SetupEditorBody>
      </SetupEditorGuard>
      <SetupEditorActions>
        <DialogActions>
          <Button
            type="button"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={(event) => handleClose(event, false)}
          >
            Cancel
          </Button>
          <SubmitButton loading={busy} />
        </DialogActions>
      </SetupEditorActions>
    </Box>
  );
}
