'use client';

import type { AcademicYear } from 'src/types/school';
import type {
  AdmissionNumbering,
  SaveAdmissionNumbering,
  AdmissionNumberPreview,
  PreviewAdmissionNumbering,
} from 'src/redux/student/admissions/admission-numbering-api';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useRef, useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetAdmissionNumberingQuery,
  useSaveAdmissionNumberingMutation,
  useLazyPreviewAdmissionNumberingQuery,
} from 'src/redux/student/admissions/admission-numbering-api';

import { AdmissionNumberingPreview } from './admission-numbering-preview';
import {
  numberingSchema,
  defaultNumbering,
  numberingFormValues,
} from './admission-numbering-model';

type Props = {
  onClose: () => void;
  canEdit: boolean;
  academicYear?: AcademicYear;
  settings?: AdmissionNumbering;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onSave: (values: SaveAdmissionNumbering) => Promise<AdmissionNumbering>;
  onPreview: (values: PreviewAdmissionNumbering) => Promise<AdmissionNumberPreview>;
};

export function AdmissionNumberingFormDialog({
  onClose,
  canEdit,
  academicYear,
  settings,
  loading,
  loadError,
  onRetry,
  onSave,
  onPreview,
}: Props) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [discard, setDiscard] = useState(false);
  const initialized = useRef(false);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmit = useRef(0);
  const formik = useFormik({
    initialValues: numberingFormValues(settings ?? defaultNumbering),
    validationSchema: numberingSchema,
    onSubmit: async (values, helpers) => {
      if (!canEdit || !settings || submitting.current || loading) return;
      submitting.current = true;
      setSaving(true);
      setError('');
      try {
        const saved = await onSave({
          ...values,
          prefix: values.prefix.trim().toUpperCase(),
          suffix: values.suffix.trim().toUpperCase(),
          startingNumber: Number(values.startingNumber),
        });
        helpers.resetForm({ values: numberingFormValues(saved) });
        shikshaMitraToast.success({ message: 'Application numbering settings saved' });
        onClose();
      } catch (saveError) {
        setError(
          parseApiProblemDetail(saveError).detail ||
            'Unable to save numbering settings. Please try again.'
        );
      } finally {
        submitting.current = false;
        setSaving(false);
      }
    },
  });
  const { resetForm } = formik;
  useEffect(() => {
    if (settings && !initialized.current) {
      initialized.current = true;
      resetForm({ values: numberingFormValues(settings) });
    }
  }, [settings, resetForm]);
  useEffect(() => {
    if (
      !formik.submitCount ||
      formik.isSubmitting ||
      formik.isValid ||
      focusedSubmit.current === formik.submitCount
    )
      return;
    focusedSubmit.current = formik.submitCount;
    formRef.current
      ?.querySelector<HTMLElement>('.Mui-error input, .Mui-error [role="combobox"]')
      ?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.isValid]);
  const busy = saving || formik.isSubmitting;
  const disabled = busy || loading || !settings || !canEdit;
  const close = () => {
    if (submitting.current) return;
    if (formik.dirty) setDiscard(true);
    else onClose();
  };
  const fieldError = (name: keyof typeof formik.values) =>
    formik.touched[name] ? formik.errors[name] : undefined;
  const select = (
    name: 'separator' | 'yearFormat' | 'resetPolicy' | 'digits',
    label: string,
    options: { value: string | number; label: string }[],
    locked = false
  ) => (
    <ShakingTextField error={Boolean(fieldError(name))}>
      <CustomSelect
        label={label}
        name={name}
        value={formik.values[name]}
        options={options}
        size="small"
        fullWidth
        disabled={disabled || locked}
        formControlProps={{ required: true }}
        onBlur={formik.handleBlur}
        error={Boolean(fieldError(name))}
        helperText={fieldError(name)}
        onChange={(value) =>
          formik.setFieldValue(name, name === 'separator' ? String(value) : Number(value))
        }
      />
    </ShakingTextField>
  );
  return (
    <CustomDialog
      open
      maxWidth="sm"
      hasForm={false}
      title="Application Numbering"
      titleInfo="Set school-wide automatic application numbers. New formats apply to future registrations; existing numbers stay unchanged."
      handleClose={close}
      disableClose={busy}
      guardUnsavedChanges={false}
    >
      <Box
        component="form"
        noValidate
        ref={formRef}
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {loadError && (
              <StudentFeedback
                notificationKey="STU-0105"
                presentation="toast"
                severity="error"
                action={
                  <Button size="small" onClick={onRetry} disabled={loading}>
                    Retry
                  </Button>
                }
              >
                Unable to load numbering settings.
              </StudentFeedback>
            )}
            {error && (
              <StudentFeedback
                notificationKey="STU-0106"
                presentation="persistent"
                severity="error"
              >
                {error}
              </StudentFeedback>
            )}
            {!settings ? (
              <Stack spacing={2} aria-label={loading ? 'Loading numbering settings' : undefined}>
                {[0, 1, 2].map(
                  (key) => loading && <Skeleton key={key} variant="rounded" height={100} />
                )}
              </Stack>
            ) : (
              <>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Applies to
                  </Typography>
                  <Typography variant="body2">All admission offerings</Typography>
                </Stack>
                <Box
                  component="fieldset"
                  disabled={busy || loading || !settings}
                  sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}
                >
                  <Stack spacing={2}>
                    <FormSectionCard
                      icon={GlobalIcons.doc}
                      title="Number Format"
                      descriptionTooltip="Choose the format for future applications. Academic year comes from the offering's admission period, not today's date."
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={Boolean(fieldError('prefix'))}>
                            <TextField
                              label="Prefix"
                              required
                              fullWidth
                              size="small"
                              disabled={disabled}
                              {...formik.getFieldProps('prefix')}
                              error={Boolean(fieldError('prefix'))}
                              helperText={fieldError('prefix')}
                              slotProps={{ htmlInput: { maxLength: 20 } }}
                            />
                          </ShakingTextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {select('separator', 'Separator', [
                            { value: '/', label: '/' },
                            { value: '-', label: '-' },
                            { value: '', label: 'No separator' },
                          ])}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {select('yearFormat', 'Year format', [
                            { value: 2, label: 'Academic year (2026-27)' },
                            { value: 1, label: 'Calendar year (2026)' },
                            { value: 0, label: 'No year' },
                          ])}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Suffix"
                            placeholder="Optional"
                            fullWidth
                            size="small"
                            disabled={disabled}
                            {...formik.getFieldProps('suffix')}
                            error={Boolean(fieldError('suffix'))}
                            helperText={fieldError('suffix')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                          />
                        </Grid>
                      </Grid>
                    </FormSectionCard>
                    <FormSectionCard
                      icon={GlobalIcons.scheduledReport}
                      title="Sequence Rules"
                      descriptionTooltip="Counters are shared across school offerings. Starting number and reset policy lock after first use. Format edits keep the counter moving forward."
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          {select(
                            'resetPolicy',
                            'Reset counter',
                            [
                              { value: 2, label: 'Each academic year' },
                              { value: 1, label: 'Each calendar year' },
                              { value: 0, label: 'Continuous' },
                            ],
                            settings.sequenceLocked
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {select(
                            'digits',
                            'Number of digits',
                            Array.from({ length: 12 }, (_, index) => ({
                              value: index + 1,
                              label: String(index + 1),
                            }))
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={Boolean(fieldError('startingNumber'))}>
                            <TextField
                              label="Starting number"
                              required
                              fullWidth
                              size="small"
                              disabled={disabled || settings.sequenceLocked}
                              {...formik.getFieldProps('startingNumber')}
                              error={Boolean(fieldError('startingNumber'))}
                              helperText={
                                fieldError('startingNumber') ||
                                (settings.sequenceLocked
                                  ? 'Locked after first use.'
                                  : 'Minimum value. Existing numbering continues automatically.')
                              }
                              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 9 } }}
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    </FormSectionCard>
                  </Stack>
                </Box>
                <FormSectionCard
                  icon={GlobalIcons.eye}
                  title="Number Preview"
                  descriptionTooltip="The next available number from the school counter for this format. Preview does not reserve it; another registration can use it first."
                >
                  <AdmissionNumberingPreview
                    values={formik.values}
                    academicYear={academicYear}
                    onPreview={onPreview}
                  />
                </FormSectionCard>
              </>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={busy}
            onClick={close}
          >
            Cancel
          </Button>
          {canEdit && (
            <Button
              size="small"
              variant="contained"
              type="submit"
              loading={busy}
              loadingPosition="start"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              disabled={disabled || loadError || Boolean(settings?.isConfigured && !formik.dirty)}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Box>
      <ConfirmDialog
        open={discard}
        cancelText="Keep editing"
        onClose={() => setDiscard(false)}
        title="Discard unsaved changes?"
        content="Your application numbering changes have not been saved."
        action={
          <Button variant="contained" color="error" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </CustomDialog>
  );
}

export function AdmissionNumberingDialog(
  props: Pick<Props, 'onClose' | 'canEdit' | 'academicYear'>
) {
  const query = useGetAdmissionNumberingQuery(undefined, { refetchOnMountOrArgChange: true });
  const [save] = useSaveAdmissionNumberingMutation();
  const [preview] = useLazyPreviewAdmissionNumberingQuery();
  const onPreview = useCallback(
    (values: PreviewAdmissionNumbering) => preview(values, false).unwrap(),
    [preview]
  );
  return (
    <AdmissionNumberingFormDialog
      {...props}
      settings={query.data}
      loading={query.isFetching}
      loadError={query.isError}
      onRetry={() => {
        query.refetch();
      }}
      onSave={(values) => save(values).unwrap()}
      onPreview={onPreview}
    />
  );
}
