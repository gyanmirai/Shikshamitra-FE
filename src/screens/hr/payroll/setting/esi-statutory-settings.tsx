'use client';

import type { RootState } from 'src/redux/store';
import type { EsiEmployeeImpact } from 'src/redux/hr/statutory-scheme-api';
import type {
  EsiConfigurationDraft,
  EsiConfigurationSettings,
} from 'src/redux/hr/esi-configuration-api';

import Link from 'next/link';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetEsiRuleQuery, usePreviewEsiImpactQuery } from 'src/redux/hr/statutory-scheme-api';
import {
  useGetEsiConfigurationQuery,
  useSaveEsiConfigurationMutation,
} from 'src/redux/hr/esi-configuration-api';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Alert,
  Button,
  Switch,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import EsiOverrideDialog from './esi-override-dialog';
import { EsiEnrollmentDrawer } from './esi-enrollment-drawer';
import { useEsiUnsavedNavigation } from './esi-unsaved-navigation';
import { EsiConfigurationEmployees } from './esi-configuration-employees';
import { esiCalculationHelp, EsiAutomaticCalculation } from './esi-automatic-calculation';
import { toApiMonth, formatEsiCurrency, formatPayrollMonth } from './esi-statutory-utils';
import {
  configurationValues,
  configurationPayload,
  validateConfiguration,
} from './esi-configuration-form';

// The content owns scrolling; actions stay at the workspace edge at every breakpoint.
const settingsFooterSx = {
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1,
  borderTop: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
  px: { xs: 1.5, sm: 2 },
  pt: 1,
  pb: 'max(8px, env(safe-area-inset-bottom, 0px))',
};

export const isStalePreviewError = (error: unknown) =>
  parseApiProblemDetail(error).errorCode === 'ESI_PREVIEW_STALE';

export default function EsiStatutorySettings() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemes
  );
  const query = useGetEsiConfigurationQuery(undefined, { skip: !canView });
  if (!canView) return <Alert severity="info">You do not have access to ESIC settings.</Alert>;
  if (query.data?.current) return <ConfigurationForm settings={query.data} />;
  if (query.isError || query.data)
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        ESIC settings could not be loaded.
      </Alert>
    );
  return (
    <Box
      aria-busy="true"
      aria-label="Loading ESIC settings"
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
        <FormSectionCard
          icon={GlobalIcons.lockIcon}
          title="ESIC"
          descriptionTooltip="School ESIC payroll settings."
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <Skeleton width={190} height={36} />
            </Grid>
            {[0, 1].map((key) => (
              <Grid key={key} size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={40} />
              </Grid>
            ))}
          </Grid>
        </FormSectionCard>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={44} />
        ))}
      </Stack>
      <Box component="footer" sx={settingsFooterSx}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          disabled
        >
          Cancel
        </Button>
        <SubmitButton
          buttonText="Save"
          disabled
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        />
      </Box>
    </Box>
  );
}

function ConfigurationForm({ settings }: { settings: EsiConfigurationSettings }) {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions = hrPermissions.payroll.settings.statutorySchemeActions;
  const canEdit =
    settings.hasSchoolWideScope &&
    hasGrantedPermission(permissions, actions.edit) &&
    hasGrantedPermission(permissions, actions.activate) &&
    hasGrantedPermission(permissions, actions.configureCalculation);
  const canManageEnrollment = hasGrantedPermission(permissions, actions.manageEnrollment);
  const canApproveOverride = hasGrantedPermission(permissions, actions.approveOverride);
  const [save, saveState] = useSaveEsiConfigurationMutation();
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [employee, setEmployee] = useState<EsiEmployeeImpact | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [employees, setEmployees] = useState<'all' | 'needsAttention' | null>(null);
  const requestPending = useRef(false);
  const request = useRef<{ signature: string; key: string } | null>(null);
  const form = useFormik<EsiConfigurationDraft>({
    initialValues: configurationValues(settings),
    validate: validateConfiguration,
    onSubmit: async (values) => {
      if (!canEdit || requestPending.current) return;
      requestPending.current = true;
      setError('');
      const payload = configurationPayload(values);
      const signature = JSON.stringify(payload);
      if (request.current?.signature !== signature)
        request.current = { signature, key: crypto.randomUUID() };
      try {
        const result = await save({ ...payload, idempotencyKey: request.current.key }).unwrap();
        form.resetForm({ values: configurationValues(result) });
        request.current = null;
        shikshaMitraToast.success({ message: 'ESIC settings saved.' });
      } catch (failure) {
        setError(
          isStalePreviewError(failure)
            ? 'Settings changed. Cancel your edits to load the latest settings before saving.'
            : 'ESIC settings could not be saved. Your changes are preserved. Try again.'
        );
      } finally {
        requestPending.current = false;
      }
    },
  });
  const busy = saveState.isLoading;
  const navigation = useEsiUnsavedNavigation(form.dirty, router.push);
  useEffect(() => {
    if (!form.dirty && !busy) form.resetForm({ values: configurationValues(settings) });
    // Keep the original concurrency token while a user has unsaved changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
  useEffect(() => {
    if (!form.dirty) return undefined;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [form.dirty]);
  const [previewDraft, setPreviewDraft] = useState<EsiConfigurationDraft | undefined>();
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setPreviewDraft(
          form.dirty && Object.keys(validateConfiguration(form.values)).length === 0 && canEdit
            ? configurationPayload(form.values)
            : undefined
        ),
      500
    );
    return () => clearTimeout(timer);
  }, [form.values, form.dirty, canEdit]);
  const month = form.values.effectiveMonth || settings.suggestedEffectiveMonth;
  const effectiveOn = `${month}-01`;
  const rules = useGetEsiRuleQuery(effectiveOn, { skip: !form.values.enabled });
  const attention = usePreviewEsiImpactQuery(
    { monthYear: toApiMonth(month), pageSize: 10, configurationDraft: previewDraft },
    { skip: !form.values.enabled || Boolean(previewDraft && previewDraft.effectiveMonth !== month) }
  );
  const refreshPreview = async () => {
    if (settings.current?.enabled) await attention.refetch();
  };
  const field = (name: 'registrationNumber' | 'coveredSince') => ({
    name,
    value: form.values[name] ?? '',
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: Boolean(form.touched[name] && form.errors[name]),
    helperText: form.touched[name] ? form.errors[name] : undefined,
    disabled: !canEdit || busy,
    fullWidth: true,
    size: 'small' as const,
  });
  return (
    <>
      <Box
        component="form"
        aria-label="ESIC settings form"
        onSubmit={form.handleSubmit}
        noValidate
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          role="region"
          aria-label="ESIC school settings"
          spacing={2}
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehaviorY: 'contain',
            scrollPaddingBlock: 2,
            pb: 2,
            pr: 0.5,
          }}
        >
          <FormBusyRegion busy={busy} label="Saving ESIC settings…">
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <FormSectionCard
                icon={GlobalIcons.lockIcon}
                title="ESIC"
                sx={{ minWidth: 0, flexShrink: 0 }}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip={esiCalculationHelp(rules.data)}
                actionFullWidthOnMobile
                action={
                  settings.history.length > 0 && (
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon={GlobalIcons.history} width={18} />}
                      aria-expanded={historyOpen}
                      aria-controls="esi-change-history"
                      disabled={busy}
                      onClick={() => setHistoryOpen(!historyOpen)}
                    >
                      {historyOpen ? 'Hide History' : 'Change History'}
                    </Button>
                  )
                }
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{
                        px: 1.5,
                        py: 1,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography id="esic-payroll-enable-label" variant="subtitle2">
                          Calculate ESIC in ShikshaMitra
                        </Typography>
                        <Typography
                          id="esic-payroll-enable-description"
                          variant="caption"
                          color="text.secondary"
                        >
                          Automatically calculate contributions for eligible staff.
                        </Typography>
                      </Box>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={0.5}
                        alignItems="center"
                        sx={{ flexShrink: 0, alignSelf: 'center' }}
                      >
                        <Switch
                          name="enabled"
                          checked={form.values.enabled}
                          onChange={form.handleChange}
                          disabled={!canEdit || busy}
                          slotProps={{
                            input: {
                              'aria-labelledby': 'esic-payroll-enable-label',
                              'aria-describedby': 'esic-payroll-enable-description',
                            },
                          }}
                        />
                        <Chip
                          size="small"
                          label={
                            form.dirty
                              ? 'Unsaved changes'
                              : form.values.enabled
                                ? 'Enabled'
                                : 'Handled externally'
                          }
                          color={form.values.enabled ? 'success' : 'default'}
                          variant="soft"
                          aria-live="polite"
                          sx={{ height: 22 }}
                        />
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      label="Changes effective from"
                      type="month"
                      size="small"
                      fullWidth
                      value={form.values.effectiveMonth ?? ''}
                      disabled={!canEdit || busy}
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={Boolean(form.errors.effectiveMonth)}
                      helperText={form.errors.effectiveMonth}
                      onChange={(event) => {
                        const effectiveMonth = event.target.value;
                        const version =
                          settings.history.find(
                            (item) => !item.isCancelled && item.effectiveMonth <= effectiveMonth
                          ) ?? settings.current;
                        form.setFieldValue('effectiveMonth', effectiveMonth);
                        if (version)
                          form.setFieldValue('concurrencyStamp', version.concurrencyStamp);
                      }}
                    />
                  </Grid>
                  {form.values.enabled && (
                    <Grid size={12}>
                      <EsiAutomaticCalculation rules={rules} />
                    </Grid>
                  )}
                  {form.values.enabled && (
                    <>
                      <Grid size={12}>
                        <TextField
                          label="ESIC registration number"
                          {...field('registrationNumber')}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Button
                          type="button"
                          size="small"
                          disabled={busy}
                          aria-expanded={registrationOpen}
                          aria-controls="esi-coverage-details"
                          onClick={() => setRegistrationOpen(!registrationOpen)}
                        >
                          {registrationOpen ? 'Hide registration details' : 'Registration details'}
                        </Button>
                        {registrationOpen && (
                          <Box id="esi-coverage-details" sx={{ mt: 1 }}>
                            <TextField
                              label="Coverage start date"
                              type="date"
                              slotProps={{ inputLabel: { shrink: true } }}
                              {...field('coveredSince')}
                            />
                          </Box>
                        )}
                      </Grid>
                    </>
                  )}
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Applies from the selected month. Locked payroll and issued payslips stay
                      unchanged.
                    </Typography>
                  </Grid>
                  {!form.values.enabled && (
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        ESIC is handled outside ShikshaMitra. Contributions are omitted from payroll
                        and payslips.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </FormSectionCard>
              {form.dirty &&
                previewDraft &&
                attention.data &&
                typeof attention.data.summary.employeeContributionTotal === 'number' && (
                  <Alert severity={attention.isError ? 'error' : 'info'}>
                    {attention.isFetching
                      ? 'Updating draft impact…'
                      : `Draft impact: ${attention.data.summary.coveredEmployeeCount} staff covered. Employee ESIC ${formatEsiCurrency(attention.data.summary.employeeContributionTotal)}, employer ESIC ${formatEsiCurrency(attention.data.summary.employerContributionTotal)}.`}{' '}
                    Staff issues remain visible for review before payroll locking.
                  </Alert>
                )}
              {historyOpen && (
                <FormSectionCard
                  icon={GlobalIcons.history}
                  title="Change History"
                  sx={{ minWidth: 0, flexShrink: 0 }}
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                  descriptionTooltip="Saved ESIC settings by effective payroll month. Superseded settings remain in the history."
                >
                  <Stack
                    id="esi-change-history"
                    spacing={1}
                    divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
                  >
                    {settings.history.map((version) => (
                      <Typography key={version.id} variant="body2">
                        {version.effectiveMonth === '1900-01'
                          ? 'School default'
                          : formatPayrollMonth(version.effectiveMonth)}
                        : {version.enabled ? 'Calculated in ShikshaMitra' : 'Handled externally'}
                        {version.isCancelled ? ' (superseded)' : ''}
                      </Typography>
                    ))}
                  </Stack>
                </FormSectionCard>
              )}
              {attention.data?.summary.blockingIssues?.some(
                (issue) => issue.resolutionTarget === 'earningClassifications'
              ) && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      component={Link}
                      href={hrPaths.payroll.settings.earningComponents}
                      size="small"
                    >
                      Review earnings
                    </Button>
                  }
                >
                  Review ESIC treatment for salary components before running payroll.
                </Alert>
              )}
              {settings.current?.enabled && (
                <Box>
                  <Alert
                    severity={
                      (attention.data?.summary.employeesNeedingAttention ?? 0) > 0
                        ? 'warning'
                        : 'info'
                    }
                    sx={{
                      alignItems: 'center',
                      '& .MuiAlert-action': { alignSelf: 'center', pt: 0 },
                    }}
                    action={
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        disabled={busy || attention.isError || !attention.data}
                        aria-expanded={Boolean(employees)}
                        aria-controls="esi-staff-review"
                        onClick={() =>
                          setEmployees(
                            employees
                              ? null
                              : (attention.data?.summary.employeesNeedingAttention ?? 0) > 0
                                ? 'needsAttention'
                                : 'all'
                          )
                        }
                      >
                        {employees ? 'Hide Staff' : 'Review Staff'}
                      </Button>
                    }
                  >
                    {attention.isError
                      ? 'Staff review is unavailable.'
                      : !attention.data
                        ? 'Checking staff ESIC status…'
                        : (attention.data.summary.employeesNeedingAttention ?? 0) > 0
                          ? `${attention.data.summary.employeesNeedingAttention} staff need attention before payroll.`
                          : 'No staff issues found for this payroll month.'}
                  </Alert>
                  {attention.isError && (
                    <Alert
                      severity="error"
                      action={
                        <Button size="small" onClick={() => attention.refetch()}>
                          Retry
                        </Button>
                      }
                    >
                      Staff details could not be loaded.
                    </Alert>
                  )}
                  {employees && (
                    <Box id="esi-staff-review" sx={{ mt: 2 }}>
                      <EsiConfigurationEmployees
                        key={employees}
                        month={month}
                        readiness={employees}
                        canManageEnrollment={canManageEnrollment}
                        canApproveOverride={canApproveOverride}
                        onOpenEmployee={setEmployee}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </FormBusyRegion>
        </Stack>
        {canEdit && (
          <Box component="footer" role="group" aria-label="ESIC form actions" sx={settingsFooterSx}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              disabled={busy}
              onClick={() =>
                navigation.requestNavigation(() => {
                  form.resetForm({ values: configurationValues(settings) });
                  setError('');
                  request.current = null;
                })
              }
            >
              Cancel
            </Button>
            <SubmitButton
              buttonText="Save"
              loading={busy}
              disabled={busy || !form.dirty}
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            />
          </Box>
        )}
      </Box>
      <EsiEnrollmentDrawer
        employee={employee}
        open={Boolean(employee) && !overrideOpen}
        canManageEnrollment={canManageEnrollment}
        canApproveOverride={canApproveOverride}
        onClose={() => setEmployee(null)}
        onSaved={refreshPreview}
        onAddOverride={() => setOverrideOpen(true)}
      />
      {canApproveOverride && (
        <EsiOverrideDialog
          employee={employee}
          month={month}
          open={overrideOpen}
          onClose={() => setOverrideOpen(false)}
          onSaved={refreshPreview}
        />
      )}
      {navigation.confirmation}
    </>
  );
}
