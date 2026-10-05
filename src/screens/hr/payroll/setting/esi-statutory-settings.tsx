'use client';

import type { RootState } from 'src/redux/store';
import type { EsiEmployeeImpact } from 'src/redux/hr/statutory-scheme-api';
import type {
  EsiConfigurationDraft,
  EsiConfigurationSettings,
} from 'src/redux/hr/esi-configuration-api';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ExpandMore } from '@mui/icons-material';
import { useRef, useState, useEffect } from 'react';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetEsiConfigurationQuery,
  useSaveEsiConfigurationMutation,
} from 'src/redux/hr/esi-configuration-api';
import {
  useGetEsiRuleQuery,
  usePreviewEsiImpactQuery,
  useGetEsiComponentTreatmentsQuery,
} from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Switch,
  Skeleton,
  MenuItem,
  TextField,
  Accordion,
  Typography,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import EsiOverrideDialog from './esi-override-dialog';
import { EsiEnrollmentDrawer } from './esi-enrollment-drawer';
import { useEsiUnsavedNavigation } from './esi-unsaved-navigation';
import { EsiConfigurationEmployees } from './esi-configuration-employees';
import { SectionCard } from '../../employee/employee-form-fields/InformationFields';
import { toApiMonth, formatEsiCurrency, formatPayrollMonth } from './esi-statutory-utils';
import {
  configurationValues,
  configurationPayload,
  validateConfiguration,
} from './esi-configuration-form';

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
    <Stack spacing={2} aria-busy="true" aria-label="Loading ESIC settings">
      <SectionCard
        title="ESIC"
        paperProps={{
          sx: { boxShadow: 'none', transition: 'none', '&:hover': { boxShadow: 'none' } },
        }}
      >
        <Grid size={12}>
          <Skeleton width={190} height={36} />
        </Grid>
        {[0, 1].map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 6 }}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
        ))}
      </SectionCard>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} height={44} />
      ))}
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" disabled>
          Cancel
        </Button>
        <Button size="small" variant="contained" disabled>
          Save
        </Button>
      </Stack>
    </Stack>
  );
}

function ConfigurationForm({ settings }: { settings: EsiConfigurationSettings }) {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions = hrPermissions.payroll.settings.statutorySchemeActions;
  const canEdit =
    settings.hasSchoolWideScope &&
    hasGrantedPermission(permissions, actions.edit) &&
    hasGrantedPermission(permissions, actions.activate);
  const canManageEnrollment = hasGrantedPermission(permissions, actions.manageEnrollment);
  const canApproveOverride = hasGrantedPermission(permissions, actions.approveOverride);
  const [save, saveState] = useSaveEsiConfigurationMutation();
  const [error, setError] = useState('');
  const [employee, setEmployee] = useState<EsiEmployeeImpact | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [employees, setEmployees] = useState<'all' | 'needsAttention' | null>(null);
  const request = useRef<{ signature: string; key: string } | null>(null);
  const form = useFormik<EsiConfigurationDraft>({
    initialValues: configurationValues(settings),
    validate: validateConfiguration,
    onSubmit: async (values) => {
      if (!canEdit) return;
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
  const month = settings.suggestedEffectiveMonth;
  const effectiveOn = `${month}-01`;
  const rules = useGetEsiRuleQuery(effectiveOn, { skip: !form.values.enabled });
  const treatments = useGetEsiComponentTreatmentsQuery(effectiveOn, { skip: !form.values.enabled });
  const attention = usePreviewEsiImpactQuery(
    { monthYear: toApiMonth(month), pageSize: 10 },
    { skip: !settings.current?.enabled }
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
      <Box component="form" onSubmit={form.handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <SectionCard
            title="ESIC"
            paperProps={{
              sx: { boxShadow: 'none', transition: 'none', '&:hover': { boxShadow: 'none' } },
            }}
          >
            <Grid size={12}>
              <FormControlLabel
                label="Calculate ESIC in payroll"
                control={
                  <Switch
                    name="enabled"
                    checked={form.values.enabled}
                    onChange={form.handleChange}
                    disabled={!canEdit || busy}
                  />
                }
              />
            </Grid>
            {form.values.enabled && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="ESIC registration number" {...field('registrationNumber')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Coverage start date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...field('coveredSince')}
                  />
                </Grid>
              </>
            )}
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary">
                Applies to current and future unlocked payroll.
              </Typography>
            </Grid>
            {!form.values.enabled && (
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">
                  Turning off platform calculation does not establish a statutory exemption.
                </Typography>
              </Grid>
            )}
          </SectionCard>
          {form.values.enabled && (
            <>
              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">How ESIC is calculated</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {rules.isError ? (
                    <Alert
                      severity="error"
                      action={
                        <Button size="small" onClick={() => rules.refetch()}>
                          Retry
                        </Button>
                      }
                    >
                      Statutory rules could not be loaded.
                    </Alert>
                  ) : rules.data ? (
                    <Typography variant="body2">
                      Staff: {rules.data.employeePercentage}%. Employer:{' '}
                      {rules.data.employerPercentage}%. Monthly eligibility ceiling:{' '}
                      {formatEsiCurrency(rules.data.standardWageCeiling)}; persons with disability:{' '}
                      {formatEsiCurrency(rules.data.disabilityWageCeiling)}. Eligibility and
                      contribution-period continuity are determined from staff facts and payroll
                      history. Each share is rounded up to the next rupee. Staff with average
                      daily wages up to{' '}
                      {formatEsiCurrency(rules.data.employeeShareDailyWageExemption)} are exempt
                      from the staff share; the employer share still applies.
                    </Typography>
                  ) : (
                    <Skeleton />
                  )}
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">Earning classifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Known earnings use statutory defaults. Review custom earnings before applying
                      ESIC.
                    </Typography>
                    {treatments.isError && (
                      <Alert
                        severity="error"
                        action={
                          <Button size="small" onClick={() => treatments.refetch()}>
                            Retry
                          </Button>
                        }
                      >
                        Earning classifications could not be loaded.
                      </Alert>
                    )}
                    {treatments.data?.map((item) => (
                      <TextField
                        key={item.componentId}
                        label={item.componentName}
                        size="small"
                        select
                        fullWidth
                        disabled={!canEdit || busy}
                        value={
                          form.values.treatments.find((x) => x.componentId === item.componentId)
                            ?.treatment ?? item.treatment
                        }
                        onChange={(event) =>
                          form.setFieldValue('treatments', [
                            ...form.values.treatments.filter(
                              (x) => x.componentId !== item.componentId
                            ),
                            { componentId: item.componentId, treatment: event.target.value },
                          ])
                        }
                      >
                        {[
                          'Unclassified',
                          'Included',
                          'SpecifiedExclusion',
                          'OtherExclusion',
                          'InKind',
                        ].map((treatment) => (
                          <MenuItem key={treatment} value={treatment}>
                            {
                              {
                                Unclassified: 'Needs review',
                                Included: 'Included in ESI wages',
                                SpecifiedExclusion: 'Specified exclusion',
                                OtherExclusion: 'Other exclusion',
                                InKind: 'In-kind benefit',
                              }[treatment]
                            }
                          </MenuItem>
                        ))}
                      </TextField>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </>
          )}

          {settings.history.length > 0 && (
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Change history</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {settings.history.map((version) => (
                    <Typography key={version.id} variant="body2">
                      {version.effectiveMonth === '1900-01'
                        ? 'School default'
                        : formatPayrollMonth(version.effectiveMonth)}
                      : ESIC {version.enabled ? 'on' : 'off'}
                      {version.isCancelled ? ' (superseded)' : ''}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
          {settings.current?.enabled && (
            <Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {(attention.data?.summary.employeesNeedingAttention ?? 0) > 0 && (
                  <Button
                    size="small"
                    onClick={() =>
                      setEmployees(employees === 'needsAttention' ? null : 'needsAttention')
                    }
                  >
                    Staff needing attention ({attention.data?.summary.employeesNeedingAttention}
                    )
                  </Button>
                )}
                <Button
                  size="small"
                  onClick={() => setEmployees(employees === 'all' ? null : 'all')}
                >
                  View staff
                </Button>
              </Stack>
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
                <EsiConfigurationEmployees
                  key={employees}
                  month={month}
                  readiness={employees}
                  canManageEnrollment={canManageEnrollment}
                  canApproveOverride={canApproveOverride}
                  onOpenEmployee={setEmployee}
                />
              )}
            </Box>
          )}
          {canEdit && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1}
              sx={{ position: 'sticky', bottom: 0, py: 2, bgcolor: 'background.paper', zIndex: 1 }}
            >
              <Button
                size="small"
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
              <Button size="small" type="submit" variant="contained" disabled={busy || !form.dirty}>
                {busy ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          )}
        </Stack>
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
