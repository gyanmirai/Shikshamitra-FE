'use client';

import type {
  EsiEnrollment,
  EsiEmployeeImpact,
  EsiStatutoryOverride,
} from 'src/redux/hr/statutory-scheme-api';

import { Close } from '@mui/icons-material';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetEsiOverridesQuery,
  useGetEsiEnrollmentQuery,
  useUpdateEsiEnrollmentMutation,
} from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Button,
  Drawer,
  Select,
  Switch,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { formatEsiCurrency } from './esi-statutory-utils';

type EnrollmentForm = Omit<EsiEnrollment, 'id' | 'employeeId' | 'schemeCode'>;

const EMPTY_FORM: EnrollmentForm = {
  status: 'PendingReview',
  wageCeilingCategory: 'Standard',
  insuranceNumber: '',
  coveredFrom: '',
  coveredTo: '',
  contributionPeriodEnd: '',
  statusReason: '',
  employerShareReliefEligible: false,
  employerShareReliefFrom: '',
  employerShareReliefTo: '',
  disabilityEvidenceReference: '',
};

const overrideLabels: Record<EsiStatutoryOverride['overrideType'], string> = {
  ForceCovered: 'Forced covered',
  ForceNotCovered: 'Forced not covered',
  EmployeeAmount: 'Staff amount',
  EmployerAmount: 'Employer amount',
};

type EsiEnrollmentDrawerProps = {
  employee:
    | (Pick<EsiEmployeeImpact, 'employeeId' | 'employeeName' | 'employeeIdentifier'> &
        Partial<EsiEmployeeImpact>)
    | null;
  open: boolean;
  canManageEnrollment: boolean;
  canApproveOverride: boolean;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  onAddOverride?: () => void;
};

export function EsiEnrollmentDrawer({
  employee,
  open,
  canManageEnrollment,
  canApproveOverride,
  onClose,
  onSaved,
  onAddOverride,
}: EsiEnrollmentDrawerProps) {
  const employeeId = employee?.employeeId || '';
  const enrollmentQuery = useGetEsiEnrollmentQuery(employeeId, { skip: !employeeId || !open });
  const overridesQuery = useGetEsiOverridesQuery(employeeId, {
    skip: !employeeId || !open || !onAddOverride,
  });
  const enrollmentData = enrollmentQuery.currentData;
  const [updateEnrollment, updateState] = useUpdateEsiEnrollmentMutation();
  const [form, setForm] = useState<EnrollmentForm>(EMPTY_FORM);
  const initializedEmployee = useRef('');
  const baseline = useRef<EnrollmentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const busy = saving || updateState.isLoading || (!enrollmentData && enrollmentQuery.isFetching);
  const dirty =
    open &&
    initializedEmployee.current === employeeId &&
    JSON.stringify(form) !== JSON.stringify(baseline.current);
  const { requestNavigation, confirmation } = useUnsavedNavigation(dirty);
  const close = () => {
    if (!busy) requestNavigation(onClose);
  };

  useEffect(() => {
    if (!open) {
      initializedEmployee.current = '';
      return;
    }
    if (!enrollmentData || initializedEmployee.current === employeeId) return;
    initializedEmployee.current = employeeId;
    const data = enrollmentData;
    const initial: EnrollmentForm = {
      status: data.status,
      wageCeilingCategory: data.wageCeilingCategory,
      insuranceNumber: data.insuranceNumber || '',
      coveredFrom: data.coveredFrom?.slice(0, 10) || '',
      coveredTo: data.coveredTo?.slice(0, 10) || '',
      contributionPeriodEnd: data.contributionPeriodEnd?.slice(0, 10) || '',
      statusReason: data.statusReason || '',
      employerShareReliefEligible: data.employerShareReliefEligible,
      employerShareReliefFrom: data.employerShareReliefFrom?.slice(0, 10) || '',
      employerShareReliefTo: data.employerShareReliefTo?.slice(0, 10) || '',
      disabilityEvidenceReference: data.disabilityEvidenceReference || '',
    };
    baseline.current = initial;
    setForm(initial);
  }, [employeeId, enrollmentData, open]);

  const isCovered = form.status !== 'RegistrationPending';
  const isRegistrationPending = form.status === 'RegistrationPending';
  const showCoverageFields = true;
  const showPwdRelief = form.wageCeilingCategory === 'PersonWithDisability';
  const reliefInvalid =
    form.employerShareReliefEligible &&
    (!form.employerShareReliefFrom || !form.disabilityEvidenceReference?.trim());
  const formInvalid = (isCovered && !form.insuranceNumber?.trim()) || reliefInvalid;

  const save = async () => {
    if (!employee || formInvalid || busy) return;
    setSaving(true);
    try {
      await updateEnrollment({
        employeeId: employee.employeeId,
        body: {
          ...form,
          insuranceNumber: form.insuranceNumber?.trim() || null,
          coveredFrom: form.coveredFrom || null,
          coveredTo: form.coveredTo || null,
          contributionPeriodEnd: isCovered ? form.contributionPeriodEnd || null : null,
          statusReason: form.statusReason?.trim() || null,
          employerShareReliefEligible: showPwdRelief && form.employerShareReliefEligible,
          employerShareReliefFrom:
            showPwdRelief && form.employerShareReliefEligible
              ? form.employerShareReliefFrom || null
              : null,
          employerShareReliefTo:
            showPwdRelief && form.employerShareReliefEligible
              ? form.employerShareReliefTo || null
              : null,
          disabilityEvidenceReference:
            showPwdRelief && form.employerShareReliefEligible
              ? form.disabilityEvidenceReference?.trim() || null
              : null,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'ESI enrollment saved.' });
      baseline.current = form;
      onClose();
      try {
        await onSaved();
      } catch {
        shikshaMitraToast.error({
          message: 'Enrollment saved. Refresh the staff details to see the latest status.',
        });
      }
    } catch {
      shikshaMitraToast.error({
        message: 'The enrollment could not be saved. Review the highlighted fields and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100vw' },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box minWidth={0}>
            <Typography variant="h6">Staff ESIC details</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {employee?.employeeName}
              {employee?.employeeIdentifier ? ` · ${employee.employeeIdentifier}` : ''}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close staff ESIC details"
            disabled={busy}
            onClick={close}
            sx={{ width: 44, height: 44 }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: 'grid', gap: 2.5, overflowY: 'auto' }}>
          {employee?.statutoryWages !== undefined && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Contribution details
              </Typography>
              <Grid container spacing={1.25}>
                {[
                  ['Coverage', employee?.coverageDecisionLabel || 'Not available'],
                  ['ESI wages', formatEsiCurrency(employee?.statutoryWages || 0)],
                  ['Staff deduction', formatEsiCurrency(employee?.employeeContribution || 0)],
                  ['Employer contribution', formatEsiCurrency(employee?.employerContribution || 0)],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {employee?.statutoryWages !== undefined && <Divider />}

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enrollment
            </Typography>
            {!enrollmentData && enrollmentQuery.isFetching ? (
              <Box display="grid" gap={1}>
                <Skeleton height={56} />
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Box>
            ) : null}
            {enrollmentQuery.isError ? (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => enrollmentQuery.refetch()}>
                    Retry
                  </Button>
                }
              >
                Enrollment details could not be loaded.
              </Alert>
            ) : null}
            {enrollmentData ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    label="Registration pending"
                    control={
                      <Switch
                        disabled={!canManageEnrollment || busy}
                        checked={isRegistrationPending}
                        onChange={(_, checked) =>
                          setForm((current) => ({
                            ...current,
                            status: checked ? 'RegistrationPending' : 'PendingReview',
                          }))
                        }
                      />
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" disabled={!canManageEnrollment || busy}>
                    <InputLabel>Wage ceiling category</InputLabel>
                    <Select
                      label="Wage ceiling category"
                      value={form.wageCeilingCategory}
                      onChange={(event) => {
                        const wageCeilingCategory = event.target
                          .value as EsiEnrollment['wageCeilingCategory'];
                        setForm((current) => ({
                          ...current,
                          wageCeilingCategory,
                          ...(wageCeilingCategory === 'Standard'
                            ? {
                                employerShareReliefEligible: false,
                                employerShareReliefFrom: '',
                                employerShareReliefTo: '',
                                disabilityEvidenceReference: '',
                              }
                            : {}),
                        }));
                      }}
                    >
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="PersonWithDisability">Person with disability</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {showCoverageFields ? (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required={isCovered}
                      disabled={!canManageEnrollment || busy}
                      label="ESIC insurance number"
                      size="small"
                      value={form.insuranceNumber}
                      error={isCovered && !form.insuranceNumber?.trim()}
                      helperText={
                        isRegistrationPending
                          ? 'Required before activation or covered payroll finalization.'
                          : undefined
                      }
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          insuranceNumber: event.target.value,
                        }))
                      }
                    />
                  </Grid>
                ) : null}

                {showPwdRelief ? (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        disabled={!canManageEnrollment || busy}
                        control={
                          <Switch
                            checked={form.employerShareReliefEligible}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                employerShareReliefEligible: event.target.checked,
                              }))
                            }
                          />
                        }
                        label="Employer-share relief applies"
                      />
                    </Grid>
                    {form.employerShareReliefEligible ? (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            required
                            disabled={!canManageEnrollment || busy}
                            type="date"
                            label="Relief from"
                            value={form.employerShareReliefFrom}
                            error={!form.employerShareReliefFrom}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                employerShareReliefFrom: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            disabled={!canManageEnrollment || busy}
                            type="date"
                            label="Relief to"
                            value={form.employerShareReliefTo}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                employerShareReliefTo: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            required
                            disabled={!canManageEnrollment || busy}
                            label="Disability evidence reference"
                            value={form.disabilityEvidenceReference}
                            error={!form.disabilityEvidenceReference?.trim()}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                disabilityEvidenceReference: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                      </>
                    ) : null}
                  </>
                ) : null}

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={!canManageEnrollment || busy}
                    label="Notes"
                    value={form.statusReason}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, statusReason: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            ) : null}
          </Box>

          {onAddOverride && (
            <>
              <Divider />
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                  <Typography variant="subtitle1">Audited overrides</Typography>
                  {canApproveOverride ? (
                    <Button
                      onClick={() => requestNavigation(onAddOverride)}
                      disabled={busy}
                      size="small"
                    >
                      Add override
                    </Button>
                  ) : null}
                </Box>
                {overridesQuery.isFetching ? <Skeleton height={72} /> : null}
                {overridesQuery.isError ? (
                  <Alert severity="error">Override history could not be loaded.</Alert>
                ) : null}
                {!overridesQuery.isFetching &&
                !overridesQuery.isError &&
                !overridesQuery.data?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    No audited overrides for this staff member.
                  </Typography>
                ) : null}
                <Box display="grid" gap={1} mt={1}>
                  {(overridesQuery.data || []).map((item) => (
                    <Box
                      key={item.id}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}
                    >
                      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={overrideLabels[item.overrideType]} />
                        <Typography variant="caption" color="text.secondary">
                          {item.effectiveFrom.slice(0, 10)} to {item.effectiveTo.slice(0, 10)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" mt={0.75}>
                        {item.reason}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>

        {canManageEnrollment ? (
          <Box
            sx={{
              mt: 'auto',
              px: 2.5,
              py: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              bottom: 0,
            }}
          >
            <Button size="small" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={save}
              disabled={formInvalid || busy || !enrollmentData || enrollmentQuery.isError}
            >
              {updateState.isLoading ? 'Saving…' : 'Save enrollment'}
            </Button>
          </Box>
        ) : null}
      </Box>
      {confirmation}
    </Drawer>
  );
}
