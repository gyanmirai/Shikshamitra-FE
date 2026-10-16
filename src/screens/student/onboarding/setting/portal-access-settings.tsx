'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Radio,
  Button,
  Divider,
  Accordion,
  RadioGroup,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import {
  appLoginAccessOptions,
  appLoginTimingOptions,
  getAppLoginSettingsValues,
  applyAppLoginSettingsValues,
  type AppLoginSettingsValues,
} from './app-login-settings-model';

const accessSchema = Yup.object({
  studentAccess: Yup.string()
    .oneOf(['not-needed', 'optional', 'required'])
    .required('Choose student app access.'),
  guardianAccess: Yup.string()
    .oneOf(['not-needed', 'optional', 'required'])
    .required('Choose parent or guardian app access.'),
  deliveryMode: Yup.string()
    .oneOf(['manual', 'automatic'])
    .required('Choose how to send login details.'),
  sendingTime: Yup.string()
    .oneOf(['activation', 'completion'])
    .required('Choose when to send login details.'),
});

const automaticChecks = [
  {
    label: 'Admission & required documents',
    source: 'From Admissions',
    icon: 'mdi:file-document-check-outline',
  },
  {
    label: 'Class, division, GR & roll number',
    source: 'From Student Setup',
    icon: 'mdi:school-outline',
  },
  {
    label: 'Fee requirements',
    source: 'From Admissions & Finance',
    icon: 'mdi:receipt-text-outline',
  },
  {
    label: 'Student & parent/guardian accounts',
    source: 'From these login settings',
    icon: 'mdi:account-key-outline',
  },
];

const deliveryChoices = [
  {
    value: 'manual',
    title: 'Staff sends manually',
    description: 'Use Send Credentials for each student.',
  },
  {
    value: 'automatic',
    title: 'Send automatically',
    description: 'Send when the selected stage is reached.',
  },
] as const;

export default function PortalAccessSettingsScreen() {
  const { settings, scope, applyReadinessAccess } = useOnboardingSettings();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canConfigure = hasGrantedPermission(permissions, studentPermissions.onboarding.configure);
  const router = useRouter();
  const submitting = useRef(false);
  const formik = useFormik<AppLoginSettingsValues>({
    enableReinitialize: true,
    initialValues: getAppLoginSettingsValues(settings.readinessAccess),
    validationSchema: accessSchema,
    onSubmit: async (values, helpers) => {
      if (!canConfigure || submitting.current) return;
      submitting.current = true;
      helpers.setStatus(undefined);
      try {
        await applyReadinessAccess(applyAppLoginSettingsValues(settings.readinessAccess, values));
        helpers.resetForm({
          values: getAppLoginSettingsValues(
            applyAppLoginSettingsValues(settings.readinessAccess, values)
          ),
        });
      } catch {
        helpers.setStatus(
          'Login settings could not be saved. Your changes are still here; retry saving.'
        );
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = formik.isSubmitting;
  const locked = busy || !canConfigure;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
  });

  return (
    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
        {scope.level === 'academic-year' ? scope.academicYearName : 'All academic years'}
        {' · All admissions'}
      </Typography>
      {!canConfigure && (
        <Alert severity="info">
          You can view these settings. Editing requires onboarding settings permission.
        </Alert>
      )}
      <Box
        component="form"
        aria-label="App login settings"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={{ position: 'relative' }}
      >
        <Box inert={busy}>
          <FormSectionCard
            title="App login rules"
            icon="mdi:account-supervisor-outline"
            descriptionTooltip="Not needed: no account. Optional: available without holding setup open. Required: the account must be prepared before setup is complete."
          >
            <Box component="fieldset" disabled={locked} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1,
                  }}
                >
                  {(
                    [
                      ['studentAccess', 'Student app login'],
                      ['guardianAccess', 'Parent / Guardian app login'],
                    ] as const
                  ).map(([field, label]) => {
                    const error = formik.touched[field] && formik.errors[field];
                    return (
                      <ShakingTextField key={field} error={Boolean(error)}>
                        <CustomSelect
                          fullWidth
                          size="small"
                          name={field}
                          label={label}
                          labelId={`app-login-${field}-label`}
                          SelectDisplayProps={{ 'aria-labelledby': `app-login-${field}-label` }}
                          options={appLoginAccessOptions}
                          optionDescriptionKey="description"
                          value={formik.values[field]}
                          disabled={locked}
                          onChange={(value) => formik.setFieldValue(field, value)}
                          onBlur={formik.handleBlur}
                          error={Boolean(error)}
                          helperText={
                            error ||
                            appLoginAccessOptions.find(
                              (option) => option.value === formik.values[field]
                            )?.description
                          }
                        />
                      </ShakingTextField>
                    );
                  })}
                </Box>
                <Divider />
                <Stack spacing={1}>
                  <Typography id="app-login-delivery-label" variant="subtitle2">
                    Send login details
                  </Typography>
                  <RadioGroup
                    aria-labelledby="app-login-delivery-label"
                    name="deliveryMode"
                    value={formik.values.deliveryMode}
                    onChange={formik.handleChange}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 1,
                    }}
                  >
                    {deliveryChoices.map((choice) => {
                      const selected = formik.values.deliveryMode === choice.value;
                      return (
                        <Paper
                          key={choice.value}
                          component="label"
                          variant="outlined"
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            p: 1.5,
                            borderColor: !locked && selected ? 'primary.main' : 'divider',
                            bgcolor: !locked && selected ? 'action.selected' : 'background.paper',
                            color: locked ? 'text.disabled' : 'text.primary',
                            cursor: locked ? 'default' : 'pointer',
                          }}
                        >
                          <Radio
                            size="small"
                            value={choice.value}
                            disabled={locked}
                            inputProps={{ 'aria-label': choice.title }}
                          />
                          <Box sx={{ minWidth: 0, pt: 0.5 }}>
                            <Typography variant="subtitle2">{choice.title}</Typography>
                            <Typography
                              variant="body2"
                              color={locked ? 'text.disabled' : 'text.secondary'}
                            >
                              {choice.description}
                            </Typography>
                          </Box>
                        </Paper>
                      );
                    })}
                  </RadioGroup>
                </Stack>
                {formik.values.deliveryMode === 'automatic' && (
                  <Box sx={{ width: { xs: 1, md: '50%' }, pr: { md: 0.5 } }}>
                    <ShakingTextField
                      error={Boolean(formik.touched.sendingTime && formik.errors.sendingTime)}
                    >
                      <CustomSelect
                        fullWidth
                        size="small"
                        name="sendingTime"
                        label="When to send"
                        labelId="app-login-sending-time-label"
                        SelectDisplayProps={{ 'aria-labelledby': 'app-login-sending-time-label' }}
                        options={appLoginTimingOptions}
                        value={formik.values.sendingTime}
                        disabled={locked}
                        onChange={(value) => formik.setFieldValue('sendingTime', value)}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.sendingTime && formik.errors.sendingTime)}
                        helperText={
                          formik.touched.sendingTime ? formik.errors.sendingTime : undefined
                        }
                      />
                    </ShakingTextField>
                  </Box>
                )}
              </Stack>
            </Box>
            {formik.status && <Alert severity="error">{formik.status}</Alert>}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify
                  icon="mdi:information-outline"
                  width={18}
                  sx={{ color: 'info.main', flexShrink: 0 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Only saved profile emails are used.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  disabled={busy || !formik.dirty}
                  onClick={() => requestNavigation(() => formik.resetForm())}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  color="inherit"
                  loading={busy}
                  disabled={!canConfigure || !formik.dirty || !formik.isValid}
                  startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
                >
                  Save Settings
                </Button>
              </Stack>
            </Stack>
          </FormSectionCard>
        </Box>
        {busy && (
          <Stack
            role="status"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'background.paper',
              opacity: 0.9,
              borderRadius: 2,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">Saving login settings…</Typography>
          </Stack>
        )}
      </Box>
      <Accordion
        disableGutters
        variant="outlined"
        sx={{ borderRadius: 2, '&::before': { display: 'none' } }}
      >
        <AccordionSummary
          id="app-login-help"
          aria-controls="app-login-help-content"
          expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon="mdi:clipboard-check-outline"
              width={22}
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="subtitle2">What is checked automatically?</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails id="app-login-help-content">
          <Stack divider={<Divider />}>
            {automaticChecks.map((check) => (
              <Stack
                key={check.label}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                spacing={0.5}
                sx={{ py: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify
                    icon={check.icon}
                    width={20}
                    sx={{ color: 'text.secondary', flexShrink: 0 }}
                  />
                  <Typography variant="body2">{check.label}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {check.source}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Accounts are prepared after activation. Missing emails need a saved-profile correction.
            Staff chooses the recipient when several parents are saved. New account owners change
            their temporary password on first login; existing passwords are kept.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {confirmation}
    </Box>
  );
}
