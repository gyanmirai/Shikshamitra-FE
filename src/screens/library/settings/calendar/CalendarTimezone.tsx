import type { LibraryCalendarSettings } from 'src/redux/library/calendar-types';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, TextField } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useUpdateLibraryCalendarSettingsMutation } from 'src/redux/library/calendar-api';

export function CalendarTimezone({ settings }: { settings: LibraryCalendarSettings }) {
  const [save, result] = useUpdateLibraryCalendarSettingsMutation();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: { timeZoneId: settings.timeZoneId || '' },
    validationSchema: Yup.object({
      timeZoneId: Yup.string().trim().required('Timezone is required').max(100),
    }),
    onSubmit: () => setConfirm(true),
  });
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: result.isLoading,
    guardContextChanges: true,
  });
  const submit = async () => {
    setError('');
    try {
      await save({ timeZoneId: formik.values.timeZoneId.trim() }).unwrap();
      formik.resetForm({ values: { timeZoneId: formik.values.timeZoneId.trim() } });
      setConfirm(false);
      shikshaMitraToast.success({ message: 'Library timezone saved.' });
    } catch (cause) {
      setConfirm(false);
      setError(
        parseApiProblemDetail(cause).detail ||
          'Could not save the Library timezone. Your entry is retained.'
      );
    }
  };
  const fieldError = Boolean(formik.touched.timeZoneId && formik.errors.timeZoneId);
  const confirmed = settings.source === 'Library' && !settings.needsConfiguration;
  return (
    <>
      <FormSectionCard
        title="Library Timezone"
        icon={GlobalIcons.clock}
        descriptionTooltip="The Library timezone defines local policy and closure dates. For example, Asia/Kolkata and Africa/Nairobi are IANA timezone IDs. This setting does not change HR."
      >
        <Alert severity={confirmed ? 'success' : 'info'}>
          {confirmed
            ? `Confirmed Library timezone: ${settings.timeZoneId}`
            : settings.source === 'Library'
              ? 'The saved Library timezone is invalid. Enter a valid IANA timezone before publishing policies.'
              : settings.source === 'LegacyHr'
                ? `Using HR fallback ${settings.timeZoneId} for previews. Explicitly confirm a Library timezone before publishing automated policies.`
                : 'No timezone is configured. Enter the Library timezone to enable calendar calculations.'}
        </Alert>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack component="form" spacing={2} onSubmit={formik.handleSubmit}>
          <ShakingTextField error={fieldError}>
            <TextField
              label="IANA timezone"
              name="timeZoneId"
              value={formik.values.timeZoneId}
              required
              fullWidth
              size="small"
              disabled={!settings.canManageCalendar || result.isLoading}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError}
              helperText={
                fieldError
                  ? formik.errors.timeZoneId
                  : 'Enter the school’s IANA timezone, for example Asia/Kolkata.'
              }
            />
          </ShakingTextField>
          {settings.canManageCalendar && (
            <LoadingButton
              type="submit"
              size="small"
              color="inherit"
              variant="contained"
              sx={{ alignSelf: 'flex-end' }}
              loading={result.isLoading}
              disabled={!formik.dirty && confirmed}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </LoadingButton>
          )}
        </Stack>
        {!settings.canManageCalendar && (
          <Alert severity="info">
            Calendar changes require the borrowing rules action permission and tenant-wide scope.
          </Alert>
        )}
      </FormSectionCard>
      <ConfirmDialog
        open={confirm}
        title="Confirm Library Timezone?"
        icon="info"
        onClose={() => {
          if (!result.isLoading) setConfirm(false);
        }}
        disableCancel={result.isLoading}
        disableEscapeKeyDown={result.isLoading}
        disableBackdropClick={result.isLoading}
        content={`Use ${formik.values.timeZoneId} for Library local dates? This changes the Library calendar only.`}
        action={
          <LoadingButton
            size="small"
            color="inherit"
            variant="contained"
            loading={result.isLoading}
            onClick={submit}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Confirm
          </LoadingButton>
        }
      />
      {guard.confirmation}
    </>
  );
}
