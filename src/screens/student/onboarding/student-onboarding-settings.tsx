'use client';

import type { RootState } from 'src/redux/store';
import type { StudentOnboardingPolicy } from 'src/redux/student/admissions/student-onboarding-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useGetAdmissionOfferingsQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  FormControlLabel,
} from '@mui/material';
import {
  useGetStudentIdentifierSeriesQuery,
  useGetStudentOnboardingPoliciesQuery,
  useBackfillHistoricalAdmissionsMutation,
  useCreateStudentIdentifierSeriesMutation,
  useCreateStudentOnboardingPolicyMutation,
  useUpdateStudentOnboardingPolicyMutation,
  useDeactivateStudentIdentifierSeriesMutation,
  useGetHistoricalAdmissionReconciliationQuery,
} from 'src/redux/student/admissions/student-onboarding-api';

type AcademicYear = { id: string; name: string };

const defaultPolicy = {
  name: 'Standard onboarding policy',
  offeringId: '',
  standardId: '',
  requireDocuments: true,
  requireFamilyDetails: true,
  requireCommunicationDetails: true,
  requireMedicalDetails: false,
  requireFeeClearance: false,
  requireStudentAccount: true,
  requireGuardianAccount: true,
  requireServiceConsent: false,
  seatReservationMinutes: 1440,
  slaHours: 72,
  isActive: true,
};

export default function StudentOnboardingSettingsScreen() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canConfigure = hasGrantedPermission(permissions, 'Students.Onboarding.Configure');
  const canRepair = hasGrantedPermission(permissions, 'Students.Onboarding.Repair');
  const yearQuery = useGetYearQuery(undefined, { skip: !canConfigure });
  const years = (yearQuery.data?.items ?? []) as AcademicYear[];
  const [academicYearId, setAcademicYearId] = useState('');
  const selectedYearId = academicYearId || years[0]?.id || '';
  const offeringsQuery = useGetAdmissionOfferingsQuery(
    { maxResultCount: 200, skipCount: 0 },
    { skip: !canConfigure }
  );
  const policiesQuery = useGetStudentOnboardingPoliciesQuery(selectedYearId, {
    skip: !selectedYearId || !canConfigure,
  });
  const seriesQuery = useGetStudentIdentifierSeriesQuery(selectedYearId, {
    skip: !selectedYearId || !canConfigure,
  });
  const cyclesQuery = useGetAdmissionCyclesQuery(
    { academicYearId: selectedYearId, maxResultCount: 200, skipCount: 0 },
    { skip: !selectedYearId || !canConfigure }
  );
  const [createPolicy, createPolicyState] = useCreateStudentOnboardingPolicyMutation();
  const [updatePolicy, updatePolicyState] = useUpdateStudentOnboardingPolicyMutation();
  const [createSeries, createSeriesState] = useCreateStudentIdentifierSeriesMutation();
  const [deactivateSeries, deactivateSeriesState] = useDeactivateStudentIdentifierSeriesMutation();
  const reconciliationQuery = useGetHistoricalAdmissionReconciliationQuery(undefined, {
    skip: !canRepair,
  });
  const [backfillHistorical, backfillHistoricalState] = useBackfillHistoricalAdmissionsMutation();
  const [editingPolicy, setEditingPolicy] = useState<StudentOnboardingPolicy | null>(null);
  const [policy, setPolicy] = useState(defaultPolicy);
  const [series, setSeries] = useState({
    code: 'GR-2027',
    name: 'General Register 2027–28',
    prefix: 'GR/27/',
    suffix: '',
    padding: 5,
    startingSequence: 1,
    maximumSequence: '',
    standardId: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveUntil: '',
  });
  const cycleIds = useMemo(
    () => new Set((cyclesQuery.data?.items ?? []).map((cycle) => cycle.id)),
    [cyclesQuery.data?.items]
  );
  const offerings = useMemo(
    () => (offeringsQuery.data?.items ?? []).filter((item) => cycleIds.has(item.admissionCycleId)),
    [cycleIds, offeringsQuery.data?.items]
  );
  const policyFormValid =
    policy.name.trim().length > 0 &&
    policy.name.trim().length <= 120 &&
    policy.seatReservationMinutes >= 5 &&
    policy.seatReservationMinutes <= 10080 &&
    policy.slaHours >= 1 &&
    policy.slaHours <= 8760;
  const maximumSequence = series.maximumSequence ? Number(series.maximumSequence) : undefined;
  const seriesFormValid =
    series.code.trim().length > 0 &&
    series.code.trim().length <= 50 &&
    series.name.trim().length > 0 &&
    series.name.trim().length <= 120 &&
    series.prefix.trim().length <= 40 &&
    series.suffix.trim().length <= 40 &&
    series.padding >= 1 &&
    series.padding <= 20 &&
    series.startingSequence > 0 &&
    (maximumSequence === undefined || maximumSequence >= series.startingSequence) &&
    Boolean(series.effectiveFrom) &&
    (!series.effectiveUntil || series.effectiveUntil > series.effectiveFrom);

  const run = async (work: () => Promise<unknown>, message: string) => {
    try {
      await work();
      shikshaMitraToast.success({ message });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to save onboarding settings',
      });
      return false;
    }
  };

  const selectOffering = (offeringId: string) => {
    const offering = offerings.find((item) => item.id === offeringId);
    setPolicy((current) => ({ ...current, offeringId, standardId: offering?.standardId ?? '' }));
  };

  const loadPolicy = (value: StudentOnboardingPolicy) => {
    setEditingPolicy(value);
    setPolicy({
      name: value.name,
      offeringId: value.offeringId ?? '',
      standardId: value.standardId ?? '',
      requireDocuments: value.requireDocuments,
      requireFamilyDetails: value.requireFamilyDetails,
      requireCommunicationDetails: value.requireCommunicationDetails,
      requireMedicalDetails: value.requireMedicalDetails,
      requireFeeClearance: value.requireFeeClearance,
      requireStudentAccount: value.requireStudentAccount,
      requireGuardianAccount: value.requireGuardianAccount,
      requireServiceConsent: value.requireServiceConsent,
      seatReservationMinutes: value.seatReservationMinutes,
      slaHours: value.slaHours,
      isActive: value.isActive,
    });
  };

  const savePolicy = async () => {
    if (!selectedYearId) return;
    const body = {
      ...policy,
      academicYearId: selectedYearId,
      offeringId: policy.offeringId || null,
      standardId: policy.standardId || null,
    };
    const ok = editingPolicy
      ? await run(
          () =>
            updatePolicy({
              ...body,
              id: editingPolicy.id,
              concurrencyStamp: editingPolicy.concurrencyStamp,
            }).unwrap(),
          'Onboarding policy updated'
        )
      : await run(() => createPolicy(body).unwrap(), 'Onboarding policy created');
    if (ok) {
      setEditingPolicy(null);
      setPolicy(defaultPolicy);
    }
  };

  const saveSeries = async () => {
    if (!selectedYearId) return;
    if (!series.effectiveFrom) {
      shikshaMitraToast.error({ message: 'Effective from is required' });
      return;
    }
    if (series.effectiveUntil && series.effectiveUntil <= series.effectiveFrom) {
      shikshaMitraToast.error({ message: 'Effective until must be after effective from' });
      return;
    }
    const ok = await run(
      () =>
        createSeries({
          academicYearId: selectedYearId,
          standardId: series.standardId || undefined,
          identifierType: 0,
          code: series.code,
          name: series.name,
          prefix: series.prefix,
          suffix: series.suffix,
          padding: Number(series.padding),
          startingSequence: Number(series.startingSequence),
          maximumSequence: series.maximumSequence ? Number(series.maximumSequence) : undefined,
          effectiveFrom: new Date(`${series.effectiveFrom}T00:00:00Z`).toISOString(),
          effectiveUntil: series.effectiveUntil
            ? new Date(`${series.effectiveUntil}T23:59:59Z`).toISOString()
            : undefined,
        }).unwrap(),
      'Identifier series created'
    );
    if (ok) setSeries((current) => ({ ...current, startingSequence: 1 }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Student Onboarding Settings"
        description="Resolve academic-year defaults and class/offering overrides, then configure immutable identifier allocation."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Student Onboarding', href: '/student/onboarding' },
          { name: 'Settings' },
        ]}
      />
      {canConfigure && (
        <>
          <Alert severity="info">
            Resolution order is exact offering/standard override first, then the academic-year
            default. Finance-owned records are never written here; readiness is represented as a
            gate and dispatched through a handoff.
          </Alert>
          <TextField
            select
            size="small"
            label="Academic year"
            value={selectedYearId}
            onChange={(event) => {
              setAcademicYearId(event.target.value);
              setEditingPolicy(null);
            }}
            sx={{ maxWidth: 320 }}
          >
            {years.map((year) => (
              <MenuItem key={year.id} value={year.id}>
                {year.name}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
            <Card sx={{ flex: 1, width: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Onboarding policy</Typography>
                  {editingPolicy && (
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingPolicy(null);
                        setPolicy(defaultPolicy);
                      }}
                    >
                      Create new
                    </Button>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Use no offering for the academic-year default, or choose an offering for a
                  Grade-specific override.
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Policy name"
                    value={policy.name}
                    onChange={(event) =>
                      setPolicy((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <TextField
                    select
                    label="Scope"
                    value={policy.offeringId}
                    onChange={(event) => selectOffering(event.target.value)}
                  >
                    <MenuItem value="">Academic-year default</MenuItem>
                    {offerings.map((offering: AdmissionOfferingListItem) => (
                      <MenuItem key={offering.id} value={offering.id}>
                        {offering.code} · {offering.standardName} · {offering.boardName}{' '}
                        {offering.mediumName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap">
                    {(
                      [
                        ['requireDocuments', 'Verified documents'],
                        ['requireFamilyDetails', 'Family details'],
                        ['requireCommunicationDetails', 'Communication details'],
                        ['requireMedicalDetails', 'Medical clearance'],
                        ['requireFeeClearance', 'Fee clearance'],
                        ['requireStudentAccount', 'Student account'],
                        ['requireGuardianAccount', 'Guardian account'],
                        ['requireServiceConsent', 'Service consent'],
                      ] as const
                    ).map(([key, label]) => (
                      <FormControlLabel
                        key={key}
                        sx={{ width: { sm: '46%' } }}
                        control={
                          <Checkbox
                            checked={policy[key]}
                            onChange={(event) =>
                              setPolicy((current) => ({ ...current, [key]: event.target.checked }))
                            }
                          />
                        }
                        label={label}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Seat reservation minutes"
                      value={policy.seatReservationMinutes}
                      inputProps={{ min: 5, max: 10080 }}
                      error={
                        policy.seatReservationMinutes < 5 || policy.seatReservationMinutes > 10080
                      }
                      helperText="5 to 10,080 minutes"
                      onChange={(event) =>
                        setPolicy((current) => ({
                          ...current,
                          seatReservationMinutes: Number(event.target.value),
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="SLA hours"
                      value={policy.slaHours}
                      inputProps={{ min: 1, max: 8760 }}
                      error={policy.slaHours < 1 || policy.slaHours > 8760}
                      helperText="1 to 8,760 hours"
                      onChange={(event) =>
                        setPolicy((current) => ({
                          ...current,
                          slaHours: Number(event.target.value),
                        }))
                      }
                    />
                  </Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={policy.isActive}
                        onChange={(event) =>
                          setPolicy((current) => ({ ...current, isActive: event.target.checked }))
                        }
                      />
                    }
                    label="Active policy"
                  />
                  <LoadingButton
                    variant="contained"
                    loading={createPolicyState.isLoading || updatePolicyState.isLoading}
                    disabled={!selectedYearId || !policyFormValid}
                    onClick={savePolicy}
                  >
                    {editingPolicy ? 'Update policy' : 'Create policy'}
                  </LoadingButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  {(policiesQuery.data ?? []).map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.offeringId
                            ? 'Offering / standard override'
                            : 'Academic-year default'}{' '}
                          · SLA {item.slaHours}h
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={item.isActive ? 'Active' : 'Inactive'}
                          color={item.isActive ? 'success' : 'default'}
                        />
                        <Button size="small" onClick={() => loadPolicy(item)}>
                          Edit
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ width: { xs: 1, lg: 430 }, flexShrink: 0 }}>
              <CardContent>
                <Typography variant="h6">GR / admission number series</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Preview the next value. Allocations remain immutable even if a case is cancelled.
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Code"
                    value={series.code}
                    onChange={(event) =>
                      setSeries((current) => ({ ...current, code: event.target.value }))
                    }
                  />
                  <TextField
                    label="Name"
                    value={series.name}
                    onChange={(event) =>
                      setSeries((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <TextField
                    select
                    label="Standard applicability"
                    value={series.standardId}
                    onChange={(event) =>
                      setSeries((current) => ({ ...current, standardId: event.target.value }))
                    }
                  >
                    <MenuItem value="">All standards</MenuItem>
                    {Array.from(
                      new Map(offerings.map((item) => [item.standardId, item])).values()
                    ).map((item) => (
                      <MenuItem key={item.standardId} value={item.standardId}>
                        {item.standardName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      label="Prefix"
                      value={series.prefix}
                      inputProps={{ maxLength: 40 }}
                      onChange={(event) =>
                        setSeries((current) => ({ ...current, prefix: event.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Suffix"
                      value={series.suffix}
                      inputProps={{ maxLength: 40 }}
                      onChange={(event) =>
                        setSeries((current) => ({ ...current, suffix: event.target.value }))
                      }
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Padding"
                      value={series.padding}
                      inputProps={{ min: 1, max: 20 }}
                      error={series.padding < 1 || series.padding > 20}
                      onChange={(event) =>
                        setSeries((current) => ({
                          ...current,
                          padding: Number(event.target.value),
                        }))
                      }
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Starting sequence"
                      value={series.startingSequence}
                      inputProps={{ min: 1 }}
                      error={series.startingSequence <= 0}
                      onChange={(event) =>
                        setSeries((current) => ({
                          ...current,
                          startingSequence: Number(event.target.value),
                        }))
                      }
                    />
                  </Stack>
                  <TextField
                    type="number"
                    label="Maximum sequence (optional)"
                    value={series.maximumSequence}
                    inputProps={{ min: series.startingSequence }}
                    error={
                      maximumSequence !== undefined && maximumSequence < series.startingSequence
                    }
                    helperText="Must be greater than or equal to the starting sequence"
                    onChange={(event) =>
                      setSeries((current) => ({ ...current, maximumSequence: event.target.value }))
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Effective from"
                      value={series.effectiveFrom}
                      onChange={(event) =>
                        setSeries((current) => ({ ...current, effectiveFrom: event.target.value }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      label="Effective until (optional)"
                      value={series.effectiveUntil}
                      onChange={(event) =>
                        setSeries((current) => ({ ...current, effectiveUntil: event.target.value }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <Alert severity="success">
                    Preview: {series.prefix}
                    {String(series.startingSequence).padStart(series.padding, '0')}
                    {series.suffix}
                  </Alert>
                  <LoadingButton
                    variant="contained"
                    loading={createSeriesState.isLoading}
                    disabled={!selectedYearId || !seriesFormValid}
                    onClick={saveSeries}
                  >
                    Create series
                  </LoadingButton>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  {(seriesQuery.data ?? []).map((item) => (
                    <Box key={item.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} />
                          {item.isActive && (
                            <LoadingButton
                              size="small"
                              color="warning"
                              loading={deactivateSeriesState.isLoading}
                              onClick={() =>
                                run(
                                  () =>
                                    deactivateSeries({
                                      id: item.id,
                                      concurrencyStamp: item.concurrencyStamp,
                                    }).unwrap(),
                                  'Identifier series deactivated'
                                )
                              }
                            >
                              Deactivate
                            </LoadingButton>
                          )}
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {item.code} · next {item.nextPreview}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </>
      )}
      {!canConfigure && canRepair && (
        <Alert severity="info">
          Your role can review and repair historical admissions. Policy and identifier settings
          require the onboarding configuration permission.
        </Alert>
      )}
      {canRepair && (
        <Card>
          <CardContent>
            <Typography variant="h6">Historical admissions reconciliation</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Status-10 applications remain historical. Only consistent Student and
              StudentEnrollment links are imported; invalid rows are reported without generated
              replacement data.
            </Typography>
            {reconciliationQuery.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                The historical reconciliation preview could not be loaded.
              </Alert>
            )}
            {reconciliationQuery.data && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={`Historical ${reconciliationQuery.data.totalHistoricalApplications}`}
                  />
                  <Chip
                    color="success"
                    label={`Already linked ${reconciliationQuery.data.alreadyLinked}`}
                  />
                  <Chip color="info" label={`Ready ${reconciliationQuery.data.readyToBackfill}`} />
                  <Chip color="error" label={`Invalid ${reconciliationQuery.data.invalid}`} />
                </Stack>
                {reconciliationQuery.data.issues.map((issue) => (
                  <Alert severity="warning" key={issue.applicationId} sx={{ mb: 1 }}>
                    {issue.applicationNumber}: {issue.reason}
                  </Alert>
                ))}
                <LoadingButton
                  variant="contained"
                  color="warning"
                  loading={backfillHistoricalState.isLoading}
                  disabled={reconciliationQuery.data.readyToBackfill === 0}
                  onClick={() =>
                    run(
                      () => backfillHistorical().unwrap(),
                      'Eligible historical admissions were linked to completed onboarding cases'
                    )
                  }
                >
                  Backfill eligible historical admissions
                </LoadingButton>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
