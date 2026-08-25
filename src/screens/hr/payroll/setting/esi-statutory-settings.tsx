'use client';

import type { RootState } from 'src/redux/store';
import type {
  EsiEnrollment,
  EsiEmployeeImpact,
  EsiComponentTreatment,
} from 'src/redux/hr/statutory-scheme-api';

import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Edit, Save, Gavel, Refresh, CheckCircle, VerifiedUser } from '@mui/icons-material';
import {
  useGetEsiRuleQuery,
  useActivateEsiMutation,
  useGetEsiEnrollmentQuery,
  usePreviewEsiImpactMutation,
  useGetEsiEstablishmentQuery,
  useUpdateEsiEnrollmentMutation,
  useGetEsiComponentTreatmentsQuery,
  useConfigureEsiEstablishmentMutation,
  useUpdateEsiComponentTreatmentsMutation,
} from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Grid,
  Link,
  Alert,
  Table,
  Button,
  Dialog,
  Select,
  Switch,
  Divider,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import EsiOverrideDialog from './esi-override-dialog';

const tabs = ['applicability', 'wages', 'employees', 'review'] as const;
type TabValue = (typeof tabs)[number];

const treatmentOptions: Array<{
  value: EsiComponentTreatment['treatment'];
  label: string;
  help: string;
}> = [
  {
    value: 'Included',
    label: 'Included In ESI Wages',
    help: 'Counts fully toward statutory wages.',
  },
  {
    value: 'SpecifiedExclusion',
    label: 'Specified Exclusion',
    help: 'Excluded, subject to the statutory 50% aggregate cap.',
  },
  { value: 'OtherExclusion', label: 'Other Exclusion', help: 'Excluded from statutory wages.' },
  { value: 'InKind', label: 'In-Kind Remuneration', help: 'Included up to the statutory cap.' },
  {
    value: 'Unclassified',
    label: 'Needs Classification',
    help: 'Blocks ESI activation and payroll lock.',
  },
];

const statusLabels: Record<string, string> = {
  Draft: 'Setup Needed',
  Ready: 'Ready For Review',
  Active: 'Active',
  Suspended: 'Suspended',
};

const issueLabels: Record<string, string> = {
  ESI_ESTABLISHMENT_INACTIVE: 'Complete the establishment registration details.',
  ESI_WAGE_CLASSIFICATION_REQUIRED: 'Classify every active earning component.',
  ESI_ENROLLMENT_REVIEW_REQUIRED: 'Review employee ESI enrollment.',
  ESI_INSURANCE_NUMBER_REQUIRED: 'Add the employee insurance number or mark registration pending.',
  ESI_PWD_RELIEF_EVIDENCE_REQUIRED:
    'Add valid PwD relief dates and disability evidence, or turn off employer-share relief.',
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const toApiMonth = (value: string) => {
  const [year, month] = value.split('-');
  return `${month}-${year}`;
};

const getMonthEnd = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return `${value}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
};

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

function SummaryCard({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {help}
      </Typography>
    </Box>
  );
}

function EnrollmentDialog({
  employee,
  open,
  onClose,
  onSaved,
}: {
  employee: EsiEmployeeImpact | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { data, isFetching, isError } = useGetEsiEnrollmentQuery(employee?.employeeId || '', {
    skip: !employee,
  });
  const [updateEnrollment, updateState] = useUpdateEsiEnrollmentMutation();
  const [form, setForm] = useState<Omit<EsiEnrollment, 'id' | 'employeeId' | 'schemeCode'>>({
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
  });

  useEffect(() => {
    if (!data) return;
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
  }, [data]);

  const save = async () => {
    if (!employee) return;
    try {
      await updateEnrollment({
        employeeId: employee.employeeId,
        body: {
          ...form,
          insuranceNumber: form.insuranceNumber || null,
          coveredFrom: form.coveredFrom || null,
          coveredTo: form.coveredTo || null,
          contributionPeriodEnd: form.contributionPeriodEnd || null,
          statusReason: form.statusReason || null,
          employerShareReliefFrom: form.employerShareReliefFrom || null,
          employerShareReliefTo: form.employerShareReliefTo || null,
          disabilityEvidenceReference: form.disabilityEvidenceReference || null,
        },
      }).unwrap();
      toast.success('ESI enrollment saved.');
      await onSaved();
      onClose();
    } catch {
      toast.error('Unable to save the enrollment. Review the fields and try again.');
    }
  };

  const reliefStartMissing =
    form.employerShareReliefEligible && !form.employerShareReliefFrom;
  const reliefEvidenceMissing =
    form.employerShareReliefEligible && !form.disabilityEvidenceReference?.trim();

  return (
    <Dialog
      open={open}
      onClose={updateState.isLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Review ESI Enrollment</DialogTitle>
      <DialogContent sx={{ overscrollBehavior: 'contain' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {employee?.employeeName}{' '}
          {employee?.employeeIdentifier ? `(${employee.employeeIdentifier})` : ''}
        </Typography>
        {isFetching ? (
          <Box display="flex" justifyContent="center" py={4} aria-label="Loading enrollment…">
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {isError ? (
          <Alert severity="error">
            Unable to load this enrollment. Close the dialog and try again.
          </Alert>
        ) : null}
        {!isFetching && !isError ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Enrollment Status</InputLabel>
                <Select
                  label="Enrollment Status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      status: event.target.value as EsiEnrollment['status'],
                    }))
                  }
                >
                  <MenuItem value="PendingReview">Pending Review</MenuItem>
                  <MenuItem value="RegistrationPending">Registration Pending</MenuItem>
                  <MenuItem value="Covered">Covered</MenuItem>
                  <MenuItem value="NotCovered">Not Covered</MenuItem>
                  <MenuItem value="Exited">Exited</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Wage Ceiling Category</InputLabel>
                <Select
                  label="Wage Ceiling Category"
                  value={form.wageCeilingCategory}
                  onChange={(event) => {
                    const wageCeilingCategory = event.target
                      .value as EsiEnrollment['wageCeilingCategory'];
                    setForm((value) => ({
                      ...value,
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
                  <MenuItem value="PersonWithDisability">Person With Disability</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="insuranceNumber"
                label="ESI Insurance Number"
                autoComplete="off"
                value={form.insuranceNumber}
                onChange={(event) =>
                  setForm((value) => ({ ...value, insuranceNumber: event.target.value }))
                }
                helperText="Optional while registration is pending. Required before a covered payroll can be locked."
              />
            </Grid>
            {form.wageCeilingCategory === 'PersonWithDisability' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.employerShareReliefEligible}
                        onChange={(event) =>
                          setForm((value) => ({
                            ...value,
                            employerShareReliefEligible: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Government-funded employer ESI share is approved"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    This changes funding attribution only. The employee ESI deduction still applies.
                  </Typography>
                </Grid>
                {form.employerShareReliefEligible && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        name="employerShareReliefFrom"
                        type="date"
                        label="Relief From"
                        value={form.employerShareReliefFrom}
                        error={reliefStartMissing}
                        helperText={reliefStartMissing ? 'Relief start date is required.' : undefined}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) =>
                          setForm((value) => ({
                            ...value,
                            employerShareReliefFrom: event.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        name="employerShareReliefTo"
                        type="date"
                        label="Relief To"
                        value={form.employerShareReliefTo}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) =>
                          setForm((value) => ({
                            ...value,
                            employerShareReliefTo: event.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        required
                        name="disabilityEvidenceReference"
                        label="Disability Evidence Reference"
                        value={form.disabilityEvidenceReference}
                        error={reliefEvidenceMissing}
                        onChange={(event) =>
                          setForm((value) => ({
                            ...value,
                            disabilityEvidenceReference: event.target.value,
                          }))
                        }
                        helperText={
                          reliefEvidenceMissing
                            ? 'A verified certificate or approval reference is required.'
                            : 'Reference the verified certificate or approval record.'
                        }
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="coveredFrom"
                type="date"
                label="Covered From"
                value={form.coveredFrom}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setForm((value) => ({ ...value, coveredFrom: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="coveredTo"
                type="date"
                label="Covered To"
                value={form.coveredTo}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setForm((value) => ({ ...value, coveredTo: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                name="contributionPeriodEnd"
                type="date"
                label="Period End"
                value={form.contributionPeriodEnd}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setForm((value) => ({ ...value, contributionPeriodEnd: event.target.value }))
                }
                helperText="Use when coverage continues above the ceiling."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                name="statusReason"
                label="Status Reason"
                autoComplete="off"
                value={form.statusReason}
                onChange={(event) =>
                  setForm((value) => ({ ...value, statusReason: event.target.value }))
                }
              />
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateState.isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={
            isFetching ||
            isError ||
            updateState.isLoading ||
            reliefStartMissing ||
            reliefEvidenceMissing
          }
        >
          {updateState.isLoading ? 'Saving…' : 'Save Enrollment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function EsiStatutorySettings() {
  const searchParams = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.edit
  );
  const canActivate = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.activate
  );
  const canManageEnrollment = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment
  );
  const canApproveOverride = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.approveOverride
  );
  const requestedTab = searchParams.get('tab') as TabValue | null;
  const [activeTab, setActiveTab] = useState<TabValue>(
    requestedTab && tabs.includes(requestedTab) ? requestedTab : 'applicability'
  );
  const [month, setMonth] = useState(searchParams.get('month') || currentMonth());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState<EsiEmployeeImpact | null>(null);
  const [overrideEmployee, setOverrideEmployee] = useState<EsiEmployeeImpact | null>(null);
  const effectiveMonthStart = `${month}-01`;
  const {
    data: rule,
    isLoading: ruleLoading,
    isError: ruleError,
    refetch: refetchRule,
  } = useGetEsiRuleQuery(getMonthEnd(month));
  const {
    data: establishment,
    isLoading: establishmentLoading,
    isError: establishmentError,
    refetch: refetchEstablishment,
  } = useGetEsiEstablishmentQuery();
  const {
    data: componentTreatments,
    isLoading: treatmentsLoading,
    isError: treatmentsError,
    refetch: refetchTreatments,
  } = useGetEsiComponentTreatmentsQuery(effectiveMonthStart);
  const [configureEstablishment, configureState] = useConfigureEsiEstablishmentMutation();
  const [updateTreatments, treatmentUpdateState] = useUpdateEsiComponentTreatmentsMutation();
  const [previewImpact, previewState] = usePreviewEsiImpactMutation();
  const [activate, activateState] = useActivateEsiMutation();
  const [establishmentForm, setEstablishmentForm] = useState({
    registrationNumber: '',
    employeeCount: 0,
    coveredSince: '',
    benefitsActiveFrom: '',
    evidenceReference: '',
  });
  const [treatmentDraft, setTreatmentDraft] = useState<EsiComponentTreatment[]>([]);

  useEffect(() => {
    if (!establishment) return;
    setEstablishmentForm({
      registrationNumber: establishment.registrationNumber || '',
      employeeCount: establishment.employeeCount || 0,
      coveredSince: establishment.coveredSince?.slice(0, 10) || '',
      benefitsActiveFrom: establishment.benefitsActiveFrom?.slice(0, 10) || '',
      evidenceReference: establishment.evidenceReference || '',
    });
  }, [establishment]);

  useEffect(() => {
    if (componentTreatments) setTreatmentDraft(componentTreatments);
  }, [componentTreatments]);

  const setUrlState = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    window.history.replaceState(window.history.state, '', query ? `?${query}` : window.location.pathname);
  };

  const runPreview = async () => {
    try {
      const result = await previewImpact({ monthYear: toApiMonth(month) }).unwrap();
      setPage(0);
      setUrlState({ month });
      return result;
    } catch {
      toast.error('Unable to run the ESI impact preview. Complete the setup and try again.');
      return null;
    }
  };

  const saveEstablishment = async () => {
    try {
      await configureEstablishment({
        jurisdictionCode: 'IN-GJ',
        ...establishmentForm,
        coveredSince: establishmentForm.coveredSince || null,
        benefitsActiveFrom: establishmentForm.benefitsActiveFrom || null,
        evidenceReference: establishmentForm.evidenceReference || null,
      }).unwrap();
      toast.success('Establishment details saved.');
    } catch {
      toast.error('Unable to save establishment details. Review the fields and try again.');
    }
  };

  const saveTreatments = async () => {
    try {
      await updateTreatments({ items: treatmentDraft }).unwrap();
      toast.success('ESI wage classifications saved.');
    } catch {
      toast.error('Unable to save wage classifications. Review the rows and try again.');
    }
  };

  const activateScheme = async () => {
    if (!previewState.data?.canActivate) return;
    try {
      await activate({ monthYear: toApiMonth(month) }).unwrap();
      toast.success('ESI is active for payroll.');
      await refetchEstablishment();
    } catch {
      toast.error('ESI could not be activated. Run the preview again and resolve every blocker.');
    }
  };

  const unclassifiedCount = treatmentDraft.filter(
    (item) => item.treatment === 'Unclassified'
  ).length;
  const employeeRows = previewState.data?.employees || [];
  const visibleRows = employeeRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const loading = ruleLoading || establishmentLoading;
  const loadError = ruleError || establishmentError;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={320}
        aria-label="Loading ESI settings…"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
      {loadError ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                refetchRule();
                refetchEstablishment();
              }}
            >
              Retry
            </Button>
          }
        >
          ESI settings could not be loaded. Retry before making payroll changes.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <VerifiedUser color="primary" aria-hidden="true" />
            <Typography variant="h5" sx={{ textWrap: 'balance' }}>
              Employee State Insurance
            </Typography>
            <Chip
              size="small"
              color={establishment?.status === 'Active' ? 'success' : 'warning'}
              label={statusLabels[establishment?.status || 'Draft']}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760 }}>
            Configure the school once. Payroll then evaluates every employee automatically from
            statutory wages, coverage history, and the effective government rule.
          </Typography>
        </Box>
        {rule ? (
          <Chip
            variant="outlined"
            label={`Rule v${rule.version} · verified ${new Intl.DateTimeFormat('en-IN').format(new Date(rule.sourceVerifiedOn))}`}
          />
        ) : null}
      </Box>

      {rule ? (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label="Standard Ceiling"
              value={currency.format(rule.standardWageCeiling)}
              help="Monthly statutory wages"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label="PWD Ceiling"
              value={currency.format(rule.disabilityWageCeiling)}
              help="Person with disability"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label="Employee Rate"
              value={`${rule.employeePercentage}%`}
              help="Rounded to next rupee"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              label="Employer Rate"
              value={`${rule.employerPercentage}%`}
              help="Tracked outside net pay"
            />
          </Grid>
        </Grid>
      ) : null}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
        <Tabs
          value={activeTab}
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(_, value: TabValue) => {
            setActiveTab(value);
            setUrlState({ tab: value });
          }}
        >
          {[
            ['applicability', '1. Establishment'],
            ['wages', '2. Wage Mapping'],
            ['employees', '3. Employees'],
            ['review', '4. Review & Activate'],
          ].map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              label={label}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {activeTab === 'applicability' ? (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 3 } }}>
          <Typography variant="h6">Establishment Applicability</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
            Record the school&apos;s ESIC registration and effective coverage. Saving changes
            returns an active setup to review status until a fresh impact preview is approved.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                name="registrationNumber"
                label="ESIC Registration Number"
                autoComplete="off"
                disabled={!canEdit}
                value={establishmentForm.registrationNumber}
                onChange={(event) =>
                  setEstablishmentForm((value) => ({
                    ...value,
                    registrationNumber: event.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                name="employeeCount"
                label="Current Employee Count"
                inputProps={{ min: 0, inputMode: 'numeric' }}
                disabled={!canEdit}
                value={establishmentForm.employeeCount}
                onChange={(event) =>
                  setEstablishmentForm((value) => ({
                    ...value,
                    employeeCount: Number(event.target.value),
                  }))
                }
                helperText={`Current statutory threshold: ${rule?.establishmentThreshold ?? 10} employees.`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                name="coveredSince"
                label="Establishment Covered Since"
                disabled={!canEdit}
                value={establishmentForm.coveredSince}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setEstablishmentForm((value) => ({ ...value, coveredSince: event.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                name="benefitsActiveFrom"
                label="Calculate ESI From"
                disabled={!canEdit}
                value={establishmentForm.benefitsActiveFrom}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) =>
                  setEstablishmentForm((value) => ({
                    ...value,
                    benefitsActiveFrom: event.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="evidenceReference"
                label="Evidence Reference"
                autoComplete="off"
                disabled={!canEdit}
                value={establishmentForm.evidenceReference}
                onChange={(event) =>
                  setEstablishmentForm((value) => ({
                    ...value,
                    evidenceReference: event.target.value,
                  }))
                }
                helperText="Registration certificate, portal reference, or internal document location."
              />
            </Grid>
          </Grid>
          {canEdit ? (
            <Box display="flex" justifyContent="flex-end" mt={2.5}>
              <Button
                variant="contained"
                startIcon={<Save aria-hidden="true" />}
                disabled={configureState.isLoading}
                onClick={saveEstablishment}
              >
                {configureState.isLoading ? 'Saving…' : 'Save Establishment'}
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {activeTab === 'wages' ? (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            gap={2}
            alignItems="flex-start"
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h6">ESI Wage Mapping</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Classify each earning component once. Gross salary remains a display total and is
                not used as the legal wage base.
              </Typography>
            </Box>
            <Chip
              color={unclassifiedCount ? 'warning' : 'success'}
              label={`${unclassifiedCount} Need Classification`}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          {treatmentsError ? (
            <Alert
              severity="error"
              action={<Button onClick={() => refetchTreatments()}>Retry</Button>}
            >
              Wage mappings could not be loaded. Retry before activation.
            </Alert>
          ) : null}
          {treatmentsLoading ? <CircularProgress size={28} /> : null}
          {!treatmentsLoading && !treatmentsError && treatmentDraft.length === 0 ? (
            <Alert severity="info">
              Add active earning components before configuring ESI wages.
            </Alert>
          ) : null}
          <Box display="grid" gap={1.25}>
            {treatmentDraft.map((item) => {
              const selected = treatmentOptions.find((option) => option.value === item.treatment);
              return (
                <Grid
                  key={item.componentId}
                  container
                  spacing={1.5}
                  alignItems="center"
                  sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {item.componentName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small" disabled={!canEdit}>
                      <InputLabel>ESI Wage Treatment</InputLabel>
                      <Select
                        label="ESI Wage Treatment"
                        value={item.treatment}
                        onChange={(event) =>
                          setTreatmentDraft((rows) =>
                            rows.map((row) =>
                              row.componentId === item.componentId
                                ? {
                                    ...row,
                                    treatment: event.target
                                      .value as EsiComponentTreatment['treatment'],
                                  }
                                : row
                            )
                          )
                        }
                      >
                        {treatmentOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      {selected?.help}
                    </Typography>
                  </Grid>
                </Grid>
              );
            })}
          </Box>
          {canEdit && treatmentDraft.length ? (
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                startIcon={<Save aria-hidden="true" />}
                disabled={treatmentUpdateState.isLoading}
                onClick={saveTreatments}
              >
                {treatmentUpdateState.isLoading ? 'Saving…' : 'Save Wage Mapping'}
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {activeTab === 'employees' || activeTab === 'review' ? (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            gap={2}
            alignItems="flex-end"
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h6">
                {activeTab === 'employees' ? 'Employee Readiness' : 'Impact Review & Activation'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Preview the selected payroll month before ESI is activated or changed.
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              <TextField
                size="small"
                type="month"
                name="previewMonth"
                label="Payroll Month"
                value={month}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(event) => {
                  setMonth(event.target.value);
                  previewState.reset();
                }}
              />
              <Button
                variant="outlined"
                startIcon={
                  previewState.isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Refresh aria-hidden="true" />
                  )
                }
                disabled={!month || previewState.isLoading}
                onClick={runPreview}
              >
                {previewState.data ? 'Refresh Preview' : 'Run Preview'}
              </Button>
            </Box>
          </Box>

          {!previewState.data ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Run the preview to see covered employees, statutory wages, contributions, and setup
              blockers.
            </Alert>
          ) : (
            <>
              <Grid container spacing={1.5} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryCard
                    label="Employees Reviewed"
                    value={String(previewState.data.employeeCount)}
                    help="Payroll-eligible for this month"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryCard
                    label="Government ESI"
                    value={currency.format(previewState.data.governmentContributionTotal)}
                    help="Approved PwD employer-share relief"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryCard
                    label="Covered"
                    value={String(previewState.data.coveredEmployeeCount)}
                    help="Including period continuation"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryCard
                    label="Employee ESI"
                    value={currency.format(previewState.data.employeeContributionTotal)}
                    help="Total payroll deductions"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <SummaryCard
                    label="Employer ESI"
                    value={currency.format(previewState.data.employerContributionTotal)}
                    help="Additional employer cost"
                  />
                </Grid>
              </Grid>

              {previewState.data.blockingIssueCodes.length ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Resolve Before Activation</Typography>
                  <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
                    {previewState.data.blockingIssueCodes.map((issue) => (
                      <li key={issue}>
                        <Typography variant="body2">{issueLabels[issue] || issue}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              ) : (
                <Alert severity="success" icon={<CheckCircle aria-hidden="true" />} sx={{ mt: 2 }}>
                  The ESI setup is ready for activation for {month}.
                </Alert>
              )}

              <TableContainer sx={{ mt: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                <Table size="small" aria-label="ESI employee impact preview">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">ESI Wages</TableCell>
                      <TableCell align="right">Employee</TableCell>
                      <TableCell align="right">Employer</TableCell>
                      <TableCell align="right">Government</TableCell>
                      <TableCell>Readiness</TableCell>
                      {canManageEnrollment || canApproveOverride ? (
                        <TableCell align="right">Actions</TableCell>
                      ) : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((employee) => (
                      <TableRow key={employee.employeeId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {employee.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.employeeIdentifier || 'No employee code'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={employee.enrollmentStatus.replace(/([a-z])([A-Z])/g, '$1 $2')}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currency.format(employee.statutoryWages)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currency.format(employee.employeeContribution)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currency.format(employee.employerContribution)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {currency.format(employee.governmentContribution)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              employee.issueCodes.length
                                ? 'warning'
                                : employee.isCovered
                                  ? 'success'
                                  : 'default'
                            }
                            label={
                              employee.issueCodes.length
                                ? `${employee.issueCodes.length} Issue${employee.issueCodes.length === 1 ? '' : 's'}`
                                : employee.isCovered
                                  ? 'Ready'
                                  : 'Not Covered'
                            }
                          />
                        </TableCell>
                        {canManageEnrollment || canApproveOverride ? (
                          <TableCell align="right">
                            {canManageEnrollment ? (
                              <IconButton
                                aria-label={`Edit ESI enrollment for ${employee.employeeName}`}
                                onClick={() => setSelectedEmployee(employee)}
                                sx={{ width: 44, height: 44 }}
                              >
                                <Edit fontSize="small" aria-hidden="true" />
                              </IconButton>
                            ) : null}
                            {canApproveOverride ? (
                              <IconButton
                                aria-label={`Add audited ESI exception for ${employee.employeeName}`}
                                onClick={() => setOverrideEmployee(employee)}
                                sx={{ width: 44, height: 44 }}
                              >
                                <Gavel fontSize="small" aria-hidden="true" />
                              </IconButton>
                            ) : null}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={employeeRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_event, value) => setPage(value)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
              />

              {activeTab === 'review' ? (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  flexWrap="wrap"
                  mt={1}
                >
                  <Typography variant="caption" color="text.secondary">
                    Activation creates the system ESI deduction binding. Employee amounts remain
                    rule-calculated and cannot be bypassed by a salary template.
                  </Typography>
                  {canActivate ? (
                    <Button
                      variant="contained"
                      startIcon={<Gavel aria-hidden="true" />}
                      disabled={!previewState.data.canActivate || activateState.isLoading}
                      onClick={activateScheme}
                    >
                      {activateState.isLoading
                        ? 'Activating…'
                        : establishment?.status === 'Active'
                          ? 'Approve Updated Setup'
                          : 'Activate ESI'}
                    </Button>
                  ) : null}
                </Box>
              ) : null}
            </>
          )}
        </Box>
      ) : null}

      {rule?.sourceUrl ? (
        <Typography variant="caption" color="text.secondary">
          Rule source:{' '}
          <Link href={rule.sourceUrl} target="_blank" rel="noopener noreferrer">
            Government of India labour code publication
          </Link>
        </Typography>
      ) : null}

      <EnrollmentDialog
        employee={selectedEmployee}
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onSaved={async () => {
          await runPreview();
        }}
      />
      <EsiOverrideDialog
        employee={overrideEmployee}
        month={month}
        open={Boolean(overrideEmployee)}
        onClose={() => setOverrideEmployee(null)}
        onSaved={async () => {
          await runPreview();
        }}
      />
    </Box>
  );
}
