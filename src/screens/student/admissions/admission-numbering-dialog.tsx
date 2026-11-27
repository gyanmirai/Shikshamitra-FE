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
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useId, useRef, useState, useEffect, useCallback } from 'react';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  Box,
  Grid,
  Stack,
  Button,
  Drawer,
  Skeleton,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useGetAdmissionNumberingQuery,
  useSaveAdmissionNumberingMutation,
  useLazyPreviewAdmissionNumberingQuery,
} from 'src/redux/student/admissions/admission-numbering-api';

import { AdmissionNumberingCycle } from './admission-numbering-cycle';
import { AdmissionNumberingPreview } from './admission-numbering-preview';
import { AdmissionNumberingHistoryDialog } from './admission-numbering-history-dialog';
import { type NumberingPreset, AdmissionNumberingPresets } from './admission-numbering-presets';
import {
  numberingSchema,
  numberingCycles,
  defaultNumbering,
  numberingFormValues,
  describeNumberingFormat,
  numberingDefinitionChanged,
} from './admission-numbering-model';

import type { NumberingFormValues } from './admission-numbering-model';

type Props = {
  onClose: () => void;
  closing?: boolean;
  onExited?: () => void;
  canEdit: boolean;
  academicYear?: AcademicYear;
  settings?: AdmissionNumbering;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onSave: (values: SaveAdmissionNumbering) => Promise<AdmissionNumbering>;
  onPreview: (values: PreviewAdmissionNumbering) => Promise<AdmissionNumberPreview>;
};

export function AdmissionNumberingFormDrawer({
  onClose,
  closing = false,
  onExited,
  canEdit,
  academicYear,
  settings,
  loading,
  loadError,
  onRetry,
  onSave,
  onPreview,
}: Props) {
  const titleId = useId();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [preset, setPreset] = useState<NumberingPreset>('custom');
  const [review, setReview] = useState<{
    values: SaveAdmissionNumbering;
    preview: AdmissionNumberPreview;
    current: NumberingFormValues;
    isConfigured: boolean;
  } | null>(null);
  const initialized = useRef(false);
  const submitting = useRef(false);
  const schoolPrefix = useRef('');
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmit = useRef(0);
  const formik = useFormik({
    initialValues: numberingFormValues(settings ?? defaultNumbering),
    validationSchema: numberingSchema,
    onSubmit: async (values) => {
      if (!canEdit || !settings || submitting.current || loading) return;
      if (preset === 'school' && !values.prefix.trim()) {
        formik.setFieldTouched('prefix', true, false);
        formik.setFieldError('prefix', 'Enter a school prefix.');
        return;
      }
      submitting.current = true;
      setSaving(true);
      setError('');
      try {
        const draft = {
          ...values,
          prefix: values.prefix.trim().toUpperCase(),
          suffix: values.suffix.trim().toUpperCase(),
          startingNumber: Number(values.startingNumber),
          beginNewSeries: numberingDefinitionChanged(values, formik.initialValues),
        };
        const next = await onPreview({ ...draft, academicYearId: academicYear?.id });
        setReview({
          values: draft,
          preview: next,
          current: { ...formik.initialValues },
          isConfigured: settings.isConfigured,
        });
      } catch (previewError) {
        setError(
          parseApiProblemDetail(previewError).detail ||
            'Unable to review numbering settings. Please try again.'
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
  const startsNewSeries = numberingDefinitionChanged(formik.values, formik.initialValues);
  const disabled = busy || loading || !settings || !canEdit;
  const close = () => {
    if (submitting.current) return;
    if (formik.dirty) setDiscard(true);
    else onClose();
  };
  const fieldError = (name: keyof typeof formik.values) =>
    formik.touched[name] ? formik.errors[name] : undefined;
  const choosePreset = (choice: NumberingPreset) => {
    if (disabled) return;
    if (preset === 'school' || formik.values.prefix.trim()) {
      schoolPrefix.current = formik.values.prefix;
    }
    setPreset(choice);
    if (choice === 'custom') return;
    const academic = choice === 'academic';
    formik.setValues({
      ...formik.values,
      prefix: choice === 'school' ? schoolPrefix.current : '',
      suffix: '',
      separator: academic ? '/' : '-',
      yearFormat: academic ? 2 : 0,
      resetPolicy: academic ? 2 : 0,
      startingNumber: '1',
      digits: 3,
    });
  };
  const confirmReview = async () => {
    if (!review || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const saved = await onSave(review.values);
      formik.resetForm({ values: numberingFormValues(saved) });
      setReview(null);
      shikshaMitraToast.success({ message: 'Application numbering settings saved' });
      onClose();
    } catch (saveError) {
      setReview(null);
      setError(
        parseApiProblemDetail(saveError).detail ||
          'Unable to save numbering settings. Please try again.'
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const select = (
    name: 'separator' | 'digits',
    label: string,
    options: { value: string | number; label: string }[]
  ) => (
    <ShakingTextField error={Boolean(fieldError(name))}>
      <CustomSelect
        label={label}
        name={name}
        value={formik.values[name]}
        options={options}
        size="small"
        fullWidth
        disabled={disabled}
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
    <Drawer
      anchor="right"
      open={!closing}
      onClose={busy ? undefined : close}
      onTransitionExited={onExited}
      slotProps={{
        paper: {
          inert: closing || undefined,
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: {
            width: { xs: '100%', sm: 'min(840px, 96vw)' },
            height: '100dvh',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75}>
          <Typography id={titleId} component="h2" variant="h6">
            Application Numbering
          </Typography>
          <InfoTooltipIcon
            label="Application Numbering information"
            title="Choose how future applications are numbered. Existing application numbers stay the same."
          />
        </Stack>
        <IconButton aria-label="Close Application Numbering" size="small" disabled={busy} onClick={close}>
          <Iconify icon={GlobalIcons.cancel} width={20} />
        </IconButton>
      </Stack>
      <Box
        component="form"
        noValidate
        ref={formRef}
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <Scrollbar sx={{ flex: 1, px: { xs: 1.5, sm: 2 }, py: 2, bgcolor: 'background.neutral' }}>
          <Stack spacing={2}>
            {loadError && (
              <StudentFeedback notificationKey="STU-0105" presentation="toast" severity="error">
                <Stack spacing={1}>
                  <span>Unable to load numbering settings.</span>
                  <Button size="small" onClick={onRetry} disabled={loading}>
                    Retry
                  </Button>
                </Stack>
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
              <Stack spacing={2} aria-label={loading ? 'Loading Numbering Settings' : undefined}>
                {[0, 1, 2].map(
                  (key) => loading && <Skeleton key={key} variant="rounded" height={100} />
                )}
              </Stack>
            ) : (
              <Box
                component="fieldset"
                disabled={busy || loading || !settings}
                sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}
              >
                <Stack spacing={2}>
                  <FormSectionCard
                    icon={GlobalIcons.scheduledReport}
                    title="Choose a Numbering Style"
                    descriptionTooltip="Choose a preset or configure your own application numbering format."
                  >
                    <AdmissionNumberingPresets
                      value={preset}
                      disabled={disabled}
                      onChange={choosePreset}
                    />
                  </FormSectionCard>
                  {preset === 'custom' && (
                    <AdmissionNumberingCycle
                      form={formik}
                      disabled={disabled}
                      sequenceLocked={false}
                    />
                  )}
                  <FormSectionCard
                    icon={GlobalIcons.doc}
                    title="Number Format"
                    descriptionTooltip="Choose the Format for Future Applications. Academic Year Comes From the Offering's Admission Period, Not Today's Date."
                  >
                    <Grid container spacing={2}>
                      {(preset === 'custom' || preset === 'school') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={Boolean(fieldError('prefix'))}>
                            <TextField
                              label="Prefix"
                              required={preset === 'school'}
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
                      )}
                      {preset === 'custom' && (
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
                      )}
                      {(preset === 'custom' || preset === 'school' || preset === 'academic') && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {select('separator', 'Separator', [
                            { value: '/', label: '/' },
                            { value: '-', label: '-' },
                            { value: '', label: 'No Separator' },
                          ])}
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {select(
                          'digits',
                          'Number Of Digits',
                          Array.from({ length: 12 }, (_, index) => ({
                            value: index + 1,
                            label: String(index + 1),
                          }))
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <ShakingTextField error={Boolean(fieldError('startingNumber'))}>
                          <TextField
                            label="Starting Number"
                            required
                            fullWidth
                            size="small"
                            disabled={disabled}
                            {...formik.getFieldProps('startingNumber')}
                            error={Boolean(fieldError('startingNumber'))}
                            helperText={fieldError('startingNumber')}
                            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 9 } }}
                          />
                        </ShakingTextField>
                      </Grid>
                    </Grid>
                  </FormSectionCard>
                </Stack>
              </Box>
            )}
          </Stack>
        </Scrollbar>
        {settings && (
          <Box sx={{ flexShrink: 0, px: { xs: 1.5, sm: 2 }, pb: 1.5, bgcolor: 'background.neutral' }}>
            <FormSectionCard
              icon={GlobalIcons.eye}
              title="Number Preview"
              descriptionTooltip="See the next available application number for these settings."
              contentSpacing={1}
            >
              <AdmissionNumberingPreview
                values={formik.values}
                academicYear={academicYear}
                onPreview={onPreview}
                beginNewSeries={startsNewSeries}
                requirePrefix={preset === 'school'}
              />
            </FormSectionCard>
          </Box>
        )}
        <Stack
          component="footer"
          direction="row"
          justifyContent="flex-end"
          flexWrap="wrap"
          gap={1}
          sx={{ px: { xs: 1.5, sm: 2 }, py: 1.75, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:history" />}
            onClick={() => setHistoryOpen(true)}
            disabled={busy}
          >
            History
          </Button>
          {canEdit && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              type="submit"
              loading={busy}
              loadingPosition="start"
              startIcon={<Iconify icon={GlobalIcons.eye} />}
              disabled={
                disabled || loadError || Boolean(settings?.isConfigured && !startsNewSeries)
              }
            >
              Review Change
            </Button>
          )}
        </Stack>
      </Box>
      {review && (
        <ConfirmDialog
          open
          title="Review Numbering Change"
          icon="info"
          onClose={() => {
            if (!busy) setReview(null);
          }}
          disableCancel={busy}
          disableEscapeKeyDown={busy}
          content={
            <Stack spacing={1}>
              <Typography variant="body2">
                Existing application numbers stay the same. New applications use the selected
                format.
              </Typography>
              {review.isConfigured ? (
                <>
                  <Typography variant="body2">
                    Current cycle:{' '}
                    {
                      numberingCycles.find((item) => item.value === review.current.resetPolicy)
                        ?.label
                    }
                  </Typography>
                  <Typography variant="body2">
                    Current format: {describeNumberingFormat(review.current)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">Current numbering: Not configured</Typography>
              )}
              <Typography variant="body2">
                New cycle:{' '}
                {numberingCycles.find((item) => item.value === review.values.resetPolicy)?.label}
              </Typography>
              <Typography variant="body2">
                New format: {describeNumberingFormat(review.values)}
              </Typography>
              <Typography variant="body2">
                Starting number: {review.values.startingNumber}
              </Typography>
              <Typography variant="subtitle2">
                Next available number now: {review.preview.nextNumber}
              </Typography>
              {review.values.beginNewSeries && review.preview.startingNumberUnavailable && (
                <Typography variant="body2">
                  The starting number is already in use. The next available number is shown above.
                </Typography>
              )}
            </Stack>
          }
          action={
            <Button
              type="button"
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={confirmReview}
            >
              Confirm Change
            </Button>
          }
        />
      )}
      {discard &&
        renderUnsavedConfirmation(
          () => setDiscard(false),
          () => {
            if (!busy) onClose();
          },
          { busy, description: 'Your application numbering changes have not been saved.' }
        )}
      {historyOpen && <AdmissionNumberingHistoryDialog onClose={() => setHistoryOpen(false)} />}
    </Drawer>
  );
}

export function AdmissionNumberingDrawer({
  onClose,
  ...props
}: Pick<Props, 'onClose' | 'canEdit' | 'academicYear'>) {
  const { closing, closeAfterExit, onExited } = useStudentDrawerExit();
  const query = useGetAdmissionNumberingQuery(undefined, { refetchOnMountOrArgChange: true });
  const [save] = useSaveAdmissionNumberingMutation();
  const [preview] = useLazyPreviewAdmissionNumberingQuery();
  const onPreview = useCallback(
    (values: PreviewAdmissionNumbering) => preview(values, false).unwrap(),
    [preview]
  );
  return (
    <AdmissionNumberingFormDrawer
      {...props}
      closing={closing}
      onClose={() => closeAfterExit(onClose)}
      onExited={onExited}
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
