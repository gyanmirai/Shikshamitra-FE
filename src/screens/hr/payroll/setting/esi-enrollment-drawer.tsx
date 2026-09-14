'use client';

import type {
  EsiEnrollment,
  EsiEmployeeImpact,
  EsiStatutoryOverride,
} from 'src/redux/hr/statutory-scheme-api';

import { Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
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

import { formatEsiCurrency, enrollmentStatusLabel } from './esi-statutory-utils';

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
  EmployeeAmount: 'Employee amount',
  EmployerAmount: 'Employer amount',
};

type EsiEnrollmentDrawerProps = {
  employee: EsiEmployeeImpact | null;
  open: boolean;
  canManageEnrollment: boolean;
  canApproveOverride: boolean;
  onClose: () => void;
  onSaved: () => Promise<unknown>;
  onAddOverride: () => void;
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
    skip: !employeeId || !open,
  });
  const enrollmentData = enrollmentQuery.data;
  const [updateEnrollment, updateState] = useUpdateEsiEnrollmentMutation();
  const [form, setForm] = useState<EnrollmentForm>(EMPTY_FORM);

  useEffect(() => {
    if (!enrollmentData) return;
    const data = enrollmentData;
    setForm({
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
    });
  }, [enrollmentData]);

  const isCovered = form.status === 'Covered';
  const isRegistrationPending = form.status === 'RegistrationPending';
  const isExited = form.status === 'Exited';
  const showCoverageFields = isCovered || isRegistrationPending;
  const showPwdRelief = form.wageCeilingCategory === 'PersonWithDisability';
  const reliefInvalid =
    form.employerShareReliefEligible &&
    (!form.employerShareReliefFrom || !form.disabilityEvidenceReference?.trim());
  const formInvalid =
    (isCovered && (!form.insuranceNumber?.trim() || !form.coveredFrom)) ||
    (isExited && !form.coveredTo) ||
    reliefInvalid;

  const save = async () => {
    if (!employee || formInvalid) return;
    const hidesCoverage = form.status === 'NotCovered' || form.status === 'PendingReview';
    try {
      await updateEnrollment({
        employeeId: employee.employeeId,
        body: {
          ...form,
          insuranceNumber: hidesCoverage ? null : form.insuranceNumber?.trim() || null,
          coveredFrom: hidesCoverage ? null : form.coveredFrom || null,
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
      await onSaved();
      onClose();
    } catch {
      shikshaMitraToast.error({
        message: 'The enrollment could not be saved. Review the highlighted fields and try again.',
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={updateState.isLoading ? undefined : onClose}
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
            <Typography variant="h6">Employee ESI details</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {employee?.employeeName} · {employee?.employeeIdentifier || 'No employee code'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close employee ESI details"
            onClick={onClose}
            sx={{ width: 44, height: 44 }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: 'grid', gap: 2.5, overflowY: 'auto' }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Contribution details
            </Typography>
            <Grid container spacing={1.25}>
              {[
                ['Coverage', employee?.coverageDecisionLabel || 'Not available'],
                ['ESI wages', formatEsiCurrency(employee?.statutoryWages || 0)],
                ['Employee deduction', formatEsiCurrency(employee?.employeeContribution || 0)],
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

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enrollment
            </Typography>
            {enrollmentQuery.isFetching ? (
              <Box display="grid" gap={1}>
                <Skeleton height={56} />
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Box>
            ) : null}
            {enrollmentQuery.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => enrollmentQuery.refetch()}>Retry</Button>}
              >
                Enrollment details could not be loaded.
              </Alert>
            ) : null}
            {enrollmentQuery.data && !enrollmentQuery.isFetching ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth disabled={!canManageEnrollment}>
                    <InputLabel>Enrollment status</InputLabel>
                    <Select
                      label="Enrollment status"
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as EsiEnrollment['status'],
                        }))
                      }
                    >
                      {(
                        [
                          'PendingReview',
                          'RegistrationPending',
                          'Covered',
                          'NotCovered',
                          'Exited',
                        ] as EsiEnrollment['status'][]
                      ).map((status) => (
                        <MenuItem key={status} value={status}>
                          {enrollmentStatusLabel(status)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth disabled={!canManageEnrollment}>
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
                  <>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        required={isCovered}
                        disabled={!canManageEnrollment}
                        label="ESI insurance number"
                        value={form.insuranceNumber}
                        error={isCovered && !form.insuranceNumber?.trim()}
                        helperText={
                          isRegistrationPending
                            ? 'Optional while registration is pending.'
                            : 'Required for covered employees.'
                        }
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            insuranceNumber: event.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required={isCovered}
                        disabled={!canManageEnrollment}
                        type="date"
                        label="Covered from"
                        value={form.coveredFrom}
                        error={isCovered && !form.coveredFrom}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, coveredFrom: event.target.value }))
                        }
                      />
                    </Grid>
                    {isCovered ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          disabled={!canManageEnrollment}
                          type="date"
                          label="Contribution period ends"
                          value={form.contributionPeriodEnd}
                          slotProps={{ inputLabel: { shrink: true } }}
                          helperText="Use when coverage continues above the wage ceiling."
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              contributionPeriodEnd: event.target.value,
                            }))
                          }
                        />
                      </Grid>
                    ) : null}
                  </>
                ) : null}

                {isExited ? (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      disabled={!canManageEnrollment}
                      type="date"
                      label="Coverage ended"
                      value={form.coveredTo}
                      error={!form.coveredTo}
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, coveredTo: event.target.value }))
                      }
                    />
                  </Grid>
                ) : null}

                {showPwdRelief ? (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        disabled={!canManageEnrollment}
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
                            disabled={!canManageEnrollment}
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
                            disabled={!canManageEnrollment}
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
                            disabled={!canManageEnrollment}
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
                    disabled={!canManageEnrollment}
                    label={isExited ? 'Exit reason' : 'Status reason'}
                    value={form.statusReason}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, statusReason: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            ) : null}
          </Box>

          <Divider />
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Typography variant="subtitle1">Audited overrides</Typography>
              {canApproveOverride ? (
                <Button onClick={onAddOverride} sx={{ minHeight: 44 }}>
                  Add override
                </Button>
              ) : null}
            </Box>
            {overridesQuery.isFetching ? <Skeleton height={72} /> : null}
            {overridesQuery.isError ? (
              <Alert severity="error">Override history could not be loaded.</Alert>
            ) : null}
            {!overridesQuery.isFetching && !overridesQuery.data?.length ? (
              <Typography variant="body2" color="text.secondary">
                No audited overrides for this employee.
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
            <Button onClick={onClose} disabled={updateState.isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={save}
              disabled={formInvalid || updateState.isLoading || !enrollmentQuery.data}
            >
              {updateState.isLoading ? 'Saving…' : 'Save enrollment'}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
}
