'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPermissions } from 'src/constants/student-menu';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Button,
  Switch,
  Divider,
  Typography,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';

const accessSchema = Yup.object({
  studentAccount: Yup.boolean().required(),
  guardianAccount: Yup.boolean().required(),
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

/** Only account requirements are editable; admission requirements keep their own source. */
export default function PortalAccessSettingsScreen() {
  const { settings, scope, applyReadinessAccess } = useOnboardingSettings();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canConfigure = hasGrantedPermission(permissions, studentPermissions.onboarding.settings);
  const router = useRouter();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      studentAccount: settings.readinessAccess.studentAccount,
      guardianAccount: settings.readinessAccess.guardianAccount,
    },
    validationSchema: accessSchema,
    onSubmit: async (values, helpers) => {
      if (!canConfigure) return;
      helpers.setStatus(undefined);
      try {
        await applyReadinessAccess({ ...settings.readinessAccess, ...values });
        helpers.resetForm({ values });
      } catch {
        helpers.setStatus(
          'Login settings could not be saved. Your changes are still here; retry saving.'
        );
      }
    },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: formik.isSubmitting,
  });
  const busy = formik.isSubmitting;
  const choices = [
    {
      field: 'studentAccount' as const,
      title: 'Student login required',
      icon: 'mdi:account-school-outline',
      required: 'Student portal access is required to complete onboarding.',
      optional: 'Student portal access is optional.',
      emailSource: "Uses the student's saved email.",
    },
    {
      field: 'guardianAccount' as const,
      title: 'Parent/Guardian login required',
      icon: 'mdi:account-supervisor-outline',
      required: 'Parent/Guardian portal access is required to complete onboarding.',
      optional: 'Parent/Guardian portal access is optional.',
      emailSource: "Uses the selected parent/guardian's saved email.",
    },
  ];

  return (
    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Choose who needs portal access. Admission requirements are applied automatically.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {scope.level === 'academic-year' ? scope.academicYearName : 'All academic years'}
          {' · Applies to all admissions'}
        </Typography>
      </Stack>
      {!canConfigure && (
        <Alert severity="info">
          You can view these settings. Editing requires onboarding settings permission.
        </Alert>
      )}
      <Box
        component="form"
        aria-label="Portal access settings"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={{ position: 'relative' }}
      >
        <Box
          component="fieldset"
          disabled={busy || !canConfigure}
          inert={busy}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            {choices.map((choice) => (
              <FormSectionCard
                key={choice.field}
                title={choice.title}
                icon={choice.icon}
                titleTypographyProps={{ component: 'h3' }}
                action={
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        size="small"
                        name={choice.field}
                        checked={formik.values[choice.field]}
                        onChange={formik.handleChange}
                        disabled={busy || !canConfigure}
                        slotProps={{ input: { 'aria-label': choice.title } }}
                      />
                    }
                    label={formik.values[choice.field] ? 'Yes' : 'No'}
                  />
                }
              >
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    {formik.values[choice.field] ? choice.required : choice.optional}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {choice.emailSource}
                  </Typography>
                </Stack>
              </FormSectionCard>
            ))}
          </Box>
        </Box>
        {formik.status && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {formik.status}
          </Alert>
        )}
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ py: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={busy || !formik.dirty}
            onClick={() => requestNavigation(() => formik.resetForm())}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            loading={busy}
            disabled={!canConfigure || !formik.dirty || !formik.isValid}
            startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
          >
            Save Settings
          </Button>
        </Stack>
        {busy && (
          <Stack
            role="status"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', opacity: 0.9 }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2">Saving login settings…</Typography>
          </Stack>
        )}
      </Box>
      <FormSectionCard
        title="Automatic onboarding checks"
        icon="mdi:clipboard-check-outline"
        titleTypographyProps={{ component: 'h3' }}
        descriptionTooltip="These checks come from the approved admission and saved school setup. They are not additional settings."
      >
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
      </FormSectionCard>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Required accounts are prepared after enrollment activation. If a required email is
          missing, staff can update it in the student&apos;s onboarding case. Account owners set
          their password using Forgot password.
        </Typography>
      </Paper>
      {confirmation}
    </Box>
  );
}
