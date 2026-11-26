import type { ReactNode } from 'react';
import type { AcademicNotificationChannel } from 'src/redux/academic-notifications/types';
import type { NotificationPreference, NotificationPreferenceOptions } from 'src/redux/communication/notification-self-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import { useId, useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { useSavePersonalNotificationPreferenceMutation } from 'src/redux/communication/notification-self-api';
import {
  Alert, Stack, Button, Switch, Checkbox, TextField, DialogActions, FormControlLabel,
} from '@mui/material';

type Selection = Pick<NotificationPreference, 'category' | 'studentId'>;
type Props = {
  owner: string;
  selection: Selection;
  saved?: NotificationPreference;
  availableChannels: AcademicNotificationChannel[];
  options: NotificationPreferenceOptions;
  categoryLabel: (category: string) => string;
  onSelect: (selection: Selection) => void;
  onClose: () => void;
  onReload: () => Promise<NotificationPreference | undefined>;
  onAccessChanged: () => void;
  deviceSettings?: ReactNode;
};

const channels = [
  { value: CommunicationChannelType.InApp, label: 'Inbox' },
  { value: CommunicationChannelType.Email, label: 'Email' },
  { value: CommunicationChannelType.WhatsApp, label: 'WhatsApp' },
  { value: CommunicationChannelType.WebPush, label: 'Website push' },
] as const;
const timePattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const quietTime = Yup.string().nullable().when('quietHoursEnabled', {
  is: true,
  then: (field) => field.required('Enter a time').matches(timePattern, 'Use a valid time'),
});
const validation = Yup.object({
  languageCode: Yup.string().trim().required('Enter a language code').max(16, 'Use up to 16 characters')
    .matches(/^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$/, 'Use a language code such as en or gu'),
  quietHoursStart: quietTime,
  quietHoursEnd: quietTime.when('quietHoursEnabled', {
    is: true,
    then: (field) => field.notOneOf([Yup.ref('quietHoursStart')], 'Choose a different end time'),
  }),
});

function initialPreference(selection: Selection, available: AcademicNotificationChannel[], saved?: NotificationPreference) {
  return saved ?? {
    ...selection, enabledChannels: available, languageCode: 'en',
    quietHoursEnabled: false, quietHoursStart: null, quietHoursEnd: null,
  };
}

export function NotificationPreferenceForm({
  owner, selection, saved, availableChannels, options, categoryLabel, onSelect, onClose, onReload, onAccessChanged, deviceSettings,
}: Props) {
  const id = useId();
  const lock = useRef(false);
  const open = useRef(true);
  const [save, mutation] = useSavePersonalNotificationPreferenceMutation();
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [discard, setDiscard] = useState<(() => void) | null>(null);
  useEffect(() => {
    open.current = true;
    return () => { open.current = false; };
  }, []);

  const form = useFormik<NotificationPreference>({
    initialValues: initialPreference(selection, availableChannels, saved),
    validationSchema: validation,
    onSubmit: async (values) => {
      if (lock.current || conflict) return;
      lock.current = true;
      setError('');
      try {
        await save({ owner, input: {
          ...values,
          languageCode: values.languageCode.trim().toLowerCase(),
          quietHoursStart: values.quietHoursEnabled ? values.quietHoursStart : null,
          quietHoursEnd: values.quietHoursEnabled ? values.quietHoursEnd : null,
        } }).unwrap();
        if (open.current) {
          shikshaMitraToast.success({ message: 'Notification preferences saved.' });
          onClose();
        }
      } catch (failure) {
        if (!open.current) return;
        const status = (failure as { status?: number } | null)?.status;
        setConflict(status === 409);
        if (status === 409) setError('These settings changed. Reload the saved settings before submitting again.');
        else if (status === 403) {
          onAccessChanged();
          setError('Your access to these notification preferences changed.');
        }
        else setError('Your notification preferences could not be saved. Check the fields and try again.');
      } finally {
        lock.current = false;
      }
    },
  });
  const { dirty, values, isSubmitting, errors, submitCount } = form;
  const busy = isSubmitting || mutation.isLoading || reloading;
  const shownChannels = channels.filter(({ value }) =>
    availableChannels.includes(value) || values.enabledChannels.includes(value)
  );

  const lastSubmit = useRef(0);
  useEffect(() => {
    if (!submitCount || submitCount === lastSubmit.current || isSubmitting) return;
    lastSubmit.current = submitCount;
    const firstInvalid = (['languageCode', 'quietHoursStart', 'quietHoursEnd'] as const).find((field) => errors[field]);
    if (!firstInvalid) return;
    document.getElementById(`${id}-${firstInvalid}`)?.focus();
  }, [errors, id, isSubmitting, submitCount]);

  useEffect(() => {
    if (!dirty && !busy) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);

  function requestChange(next: () => void) {
    if (busy || lock.current) return;
    if (dirty) setDiscard(() => next);
    else next();
  }

  async function reload() {
    setReloading(true);
    try {
      const latest = await onReload();
      form.resetForm({ values: initialPreference(selection, availableChannels, latest) });
      lastSubmit.current = 0;
      setConflict(false);
      setError('');
    } catch {
      setError('Saved settings could not be reloaded. Try again.');
    } finally {
      setReloading(false);
    }
  }

  return (
    <>
      <CustomDialog open title="Notification Preferences" maxWidth="sm" titleInfo="Choose how you receive school notices."
        disableClose={busy} guardUnsavedChanges={false} handleClose={() => requestChange(onClose)}
        formProps={{ noValidate: true, onSubmit: async (event) => {
          event.preventDefault();
          if (!busy && dirty && !conflict) await form.submitForm();
        } }}>
        <DialogScrollContent>
          <Stack gap={2}>
            {deviceSettings}
            {error && <Alert severity="error" action={conflict && (
              <Button size="small" disabled={busy} onClick={() => requestChange(reload)}>Reload saved settings</Button>
            )}>{error}</Alert>}
            <FormSectionCard title="Delivery Preferences"
              descriptionTooltip="Account-wide settings also apply to linked students. Delivery follows school rules and channel consent.">
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField select fullWidth size="small" id={`${id}-category`} label="Category"
                  disabled={busy} slotProps={{ select: { native: true } }} value={selection.category}
                  onChange={({ target: { value } }) => requestChange(() => onSelect({ ...selection, category: value }))}>
                  {options.categories.map(({ category }) => (
                    <option key={category} value={category}>{categoryLabel(category)}</option>
                  ))}
                </TextField>
                {options.students.length > 0 && (
                  <TextField select fullWidth size="small" id={`${id}-scope`} label="Apply to"
                    disabled={busy} slotProps={{ inputLabel: { shrink: true }, select: { native: true } }} value={selection.studentId ?? ''}
                    onChange={({ target: { value } }) => requestChange(() => onSelect({ ...selection, studentId: value || null }))}>
                    <option value="">All my notifications</option>
                    {options.students.map(({ studentId, displayName }) => (
                      <option key={studentId} value={studentId}>{displayName}</option>
                    ))}
                  </TextField>
                )}
              </Stack>
              <Stack direction="row" flexWrap="wrap" role="group" aria-label="Delivery channels">
                {shownChannels.map(({ value, label }) => (
                  <FormControlLabel key={value} label={label} control={
                    <Checkbox disabled={busy} checked={values.enabledChannels.includes(value)} onChange={(_, checked) => {
                      form.setFieldValue('enabledChannels', checked
                        ? [...values.enabledChannels, value] : values.enabledChannels.filter((channel) => channel !== value));
                    }} />
                  } />
                ))}
              </Stack>
              <ShakingTextField error={Boolean(form.touched.languageCode && form.errors.languageCode)}>
                <TextField fullWidth required size="small" id={`${id}-languageCode`} label="Preferred language"
                  {...form.getFieldProps('languageCode')} disabled={busy}
                  error={Boolean(form.touched.languageCode && form.errors.languageCode)}
                  helperText={form.touched.languageCode && form.errors.languageCode || 'Language code, such as en, hi, or gu.'} />
              </ShakingTextField>
              <FormControlLabel label="Quiet hours (school time)" control={
                <Switch disabled={busy} slotProps={{ input: { role: 'switch' } }} checked={values.quietHoursEnabled} onChange={(_, enabled) => {
                  form.setValues({ ...values, quietHoursEnabled: enabled,
                    quietHoursStart: values.quietHoursStart ?? '20:00', quietHoursEnd: values.quietHoursEnd ?? '07:00' });
                }} />
              } />
              {values.quietHoursEnabled && (
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                  {(['quietHoursStart', 'quietHoursEnd'] as const).map((name) => {
                    const message = form.touched[name] && form.errors[name];
                    return (
                      <ShakingTextField key={name} error={Boolean(message)}>
                        <TextField fullWidth required size="small" type="time" id={`${id}-${name}`}
                          label={name === 'quietHoursStart' ? 'Quiet hours start' : 'Quiet hours end'} disabled={busy}
                          {...form.getFieldProps(name)} value={values[name] ?? ''} error={Boolean(message)} helperText={message}
                          slotProps={{ inputLabel: { shrink: true } }} />
                      </ShakingTextField>
                    );
                  })}
                </Stack>
              )}
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button type="button" size="small" variant="outlined" disabled={busy} onClick={() => requestChange(onClose)}>Cancel</Button>
          <SubmitButton loading={isSubmitting} disabled={busy || !dirty || conflict} />
        </DialogActions>
      </CustomDialog>
      {discard && (
        <ConfirmDialog open title="Discard Changes" content="Your unsaved notification preferences will be lost."
          cancelText="Keep editing" onClose={() => setDiscard(null)}
          action={<Button variant="contained" onClick={() => { setDiscard(null); discard(); }}>Discard changes</Button>} />
      )}
    </>
  );
}
