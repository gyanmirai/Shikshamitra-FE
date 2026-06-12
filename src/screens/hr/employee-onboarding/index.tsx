'use client';

import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import {
  Box,
  Chip,
  Grid,
  Step,
  Paper,
  Stack,
  Table,
  Button,
  Drawer,
  Dialog,
  Select,
  Stepper,
  Tooltip,
  MenuItem,
  TableRow,
  Checkbox,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  StepLabel,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  TableContainer,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  useGetEmployeeApplicationQuery,
  useGetEmployeeApplicationsQuery,
  useDeleteEmployeeApplicationMutation,
  useFinalizeEmployeeApplicationMutation,
  useLazyGetEmployeeApplicationPhotoQuery,
  useLazyGetEmployeeApplicationResumeQuery,
  useCreateEmployeeApplicationInviteMutation,
  useUpdateEmployeeApplicationStatusMutation,
  useRegenerateEmployeeApplicationLinkMutation,
} from 'src/redux/hr/employeeOnboardingApi';

import {
  EmployeeApplicationStatus,
  EMPLOYEE_APPLICATION_STATUSES,
  canFinalizeEmployeeApplication,
  getEmployeeApplicationStatusColor,
  getEmployeeApplicationStatusLabel,
  normalizeEmployeeApplicationStatus,
} from './status';

type InviteFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  positionAppliedFor: string;
  departmentAppliedFor: string;
};

type FinalizeFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  religion: string;
  casteType: string;
  familyCaste: string;
  maritalStatus: string;
  bloodGroup: string;
  email: string;
  mobileNo: string;
  secondaryMobileNo: string;
  panNo: string;
  adharNo: string;
  doj: string;
  isTeaching: boolean;
  department: string;
  roleId: string;
  shiftId: string;
  organizationIds: string;
  address1: string;
  address2: string;
  address3: string;
  countryName: string;
  countryIsoCode: string;
  stateName: string;
  stateIsoCode: string;
  city: string;
  pinCode: string;
  useSubmittedPhoto: boolean;
  attachResumeAsDocument: boolean;
};

const defaultInviteForm: InviteFormState = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  mobileNo: '',
  positionAppliedFor: '',
  departmentAppliedFor: '',
};

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD MMM YYYY') : '-');

const toDateInputValue = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD') : '';

const copyToClipboard = async (value: string, label = 'Link') => {
  await navigator.clipboard.writeText(value);
  shikshaMitraToast.success({ message: `${label} copied` });
};

const buildPublicLink = (path: string) =>
  typeof window === 'undefined' ? path : `${window.location.origin}${path}`;

const buildFinalizeInitialValues = (application: EmployeeApplication): FinalizeFormState => ({
  firstName: application.firstName || '',
  middleName: application.middleName || '',
  lastName: application.lastName || '',
  dob: toDateInputValue(application.dateOfBirth),
  gender: application.gender ? String(application.gender) : '',
  religion: application.religion || '',
  casteType:
    application.casteType !== null && application.casteType !== undefined
      ? String(application.casteType)
      : '',
  familyCaste: application.familyCaste || '',
  maritalStatus:
    application.maritalStatus !== null && application.maritalStatus !== undefined
      ? String(application.maritalStatus)
      : '',
  bloodGroup:
    application.bloodGroup !== null && application.bloodGroup !== undefined
      ? String(application.bloodGroup)
      : '',
  email: application.email || '',
  mobileNo: application.mobileNo || '',
  secondaryMobileNo: application.secondaryMobileNo || '',
  panNo: '',
  adharNo: '',
  doj: dayjs().format('YYYY-MM-DD'),
  isTeaching: true,
  department: application.departmentAppliedFor || '',
  roleId: '',
  shiftId: '',
  organizationIds: '',
  address1: application.address1 || '',
  address2: application.address2 || '',
  address3: application.address3 || '',
  countryName: application.country?.name || 'India',
  countryIsoCode: application.country?.isoCode || 'IN',
  stateName: application.state?.name || '',
  stateIsoCode: application.state?.isoCode || '',
  city: application.city || '',
  pinCode: application.pinCode || '',
  useSubmittedPhoto: application.hasPhoto,
  attachResumeAsDocument: application.hasResume,
});

const toNullableNumber = (value: string) => (value === '' ? null : Number(value));

const parseOrganizationIds = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function StatusChip({ status }: { status: EmployeeApplication['status'] }) {
  return (
    <Chip
      size="small"
      label={getEmployeeApplicationStatusLabel(status)}
      color={getEmployeeApplicationStatusColor(status)}
      variant="outlined"
    />
  );
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<InviteFormState>(defaultInviteForm);
  const [createInvite, { isLoading }] = useCreateEmployeeApplicationInviteMutation();

  const updateField = (field: keyof InviteFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleCreate = async () => {
    try {
      const result = await createInvite(form).unwrap();
      await copyToClipboard(buildPublicLink(result.publicPath), 'Application link');
      shikshaMitraToast.success({ message: 'Invite created' });
      setForm(defaultInviteForm);
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Could not create invite' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="employee-onboarding-invite-dialog"
    >
      <DialogTitle>Create onboarding invite</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="First name"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Middle name"
              value={form.middleName}
              onChange={(event) => updateField('middleName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Last name"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Mobile no."
              value={form.mobileNo}
              onChange={(event) => updateField('mobileNo', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Position"
              value={form.positionAppliedFor}
              onChange={(event) => updateField('positionAppliedFor', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Department"
              value={form.departmentAppliedFor}
              onChange={(event) => updateField('departmentAppliedFor', event.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={isLoading || (!form.email && !form.mobileNo)}
          startIcon={<Iconify icon="mdi:link-plus" />}
        >
          Create link
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailDrawer({
  application,
  open,
  onClose,
  onFinalize,
}: {
  application?: EmployeeApplication;
  open: boolean;
  onClose: () => void;
  onFinalize: (application: EmployeeApplication) => void;
}) {
  const [status, setStatus] = useState<EmployeeApplicationStatus>(
    EmployeeApplicationStatus.Screening
  );
  const [reason, setReason] = useState('');
  const [updateStatus, { isLoading: statusLoading }] = useUpdateEmployeeApplicationStatusMutation();
  const [regenerateLink, { isLoading: regenerateLoading }] =
    useRegenerateEmployeeApplicationLinkMutation();
  const [deleteApplication, { isLoading: deleteLoading }] = useDeleteEmployeeApplicationMutation();
  const [downloadResume] = useLazyGetEmployeeApplicationResumeQuery();
  const [downloadPhoto] = useLazyGetEmployeeApplicationPhotoQuery();

  if (!application) {
    return null;
  }

  const normalizedStatus = normalizeEmployeeApplicationStatus(application.status);

  const handleStatusUpdate = async (nextStatus = status) => {
    try {
      await updateStatus({ id: application.id, body: { status: nextStatus, reason } }).unwrap();
      shikshaMitraToast.success({ message: 'Status updated' });
    } catch {
      shikshaMitraToast.error({ message: 'Could not update status' });
    }
  };

  const handleRegenerate = async () => {
    try {
      const result = await regenerateLink(application.id).unwrap();
      await copyToClipboard(buildPublicLink(result.publicPath), 'New application link');
      shikshaMitraToast.success({ message: 'Link regenerated' });
    } catch {
      shikshaMitraToast.error({ message: 'Could not regenerate link' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApplication(application.id).unwrap();
      shikshaMitraToast.success({ message: 'Application deleted' });
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Could not delete application' });
    }
  };

  const handleDownload = async (kind: 'resume' | 'photo') => {
    try {
      const response =
        kind === 'resume'
          ? await downloadResume(application.id).unwrap()
          : await downloadPhoto(application.id).unwrap();
      downloadBlob(
        response,
        kind === 'resume'
          ? application.resumeFileName || `${application.applicationNumber}-resume`
          : application.photoFileName || `${application.applicationNumber}-photo`
      );
    } catch {
      shikshaMitraToast.error({ message: `Could not download ${kind}` });
    }
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={onClose}
      PaperProps={{ sx: { width: 480, maxWidth: '100%' } }}
    >
      <Box sx={{ p: 3 }} data-testid="employee-onboarding-detail-drawer">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box>
              <Typography variant="h6">{application.fullName || 'Candidate'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {application.applicationNumber}
              </Typography>
            </Box>
            <StatusChip status={application.status} />
          </Stack>

          <Stack spacing={1.2}>
            <Typography variant="subtitle2">Application</Typography>
            <Typography variant="body2">
              Position: {application.positionAppliedFor || '-'}
            </Typography>
            <Typography variant="body2">
              Department: {application.departmentAppliedFor || '-'}
            </Typography>
            <Typography variant="body2">Email: {application.email || '-'}</Typography>
            <Typography variant="body2">Mobile: {application.mobileNo || '-'}</Typography>
            <Typography variant="body2">
              Submitted: {formatDate(application.submittedAt)}
            </Typography>
            <Typography variant="body2">
              Link expires: {formatDate(application.tokenExpiresAt)}
            </Typography>
          </Stack>

          <Stack spacing={1.2}>
            <Typography variant="subtitle2">Candidate details</Typography>
            <Typography variant="body2">
              Qualification: {application.qualificationSummary || '-'}
            </Typography>
            <Typography variant="body2">Skills: {application.skillsSummary || '-'}</Typography>
            <Typography variant="body2">
              Address:{' '}
              {[
                application.address1,
                application.address2,
                application.city,
                application.state?.name,
              ]
                .filter(Boolean)
                .join(', ') || '-'}
            </Typography>
          </Stack>

          <Stack spacing={1.2} data-testid="employee-onboarding-work-experience-list">
            <Typography variant="subtitle2">Work experience</Typography>
            {(application.workExperiences || []).length ? (
              application.workExperiences?.map((experience, index) => (
                <Box key={`${experience.mediumStageName || 'experience'}-${index}`}>
                  <Typography variant="body2">
                    {experience.mediumStageName || '-'}
                    {experience.designation ? `, ${experience.designation}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[experience.department, experience.city].filter(Boolean).join(' - ') || '-'}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No work experience submitted.
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              disabled={!application.hasResume}
              onClick={() => handleDownload('resume')}
              startIcon={<Iconify icon="mdi:file-download-outline" />}
            >
              Resume
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={!application.hasPhoto}
              onClick={() => handleDownload('photo')}
              startIcon={<Iconify icon="mdi:image-outline" />}
            >
              Photo
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Status action</Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(event) =>
                  setStatus(Number(event.target.value) as EmployeeApplicationStatus)
                }
              >
                {EMPLOYEE_APPLICATION_STATUSES.filter(
                  (item) => item !== EmployeeApplicationStatus.Finalized
                ).map((item) => (
                  <MenuItem key={item} value={item}>
                    {getEmployeeApplicationStatusLabel(item)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              multiline
              minRows={2}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => handleStatusUpdate()}
                disabled={statusLoading || normalizedStatus === EmployeeApplicationStatus.Finalized}
              >
                Update
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Rejected)}
                disabled={statusLoading || normalizedStatus === EmployeeApplicationStatus.Finalized}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Withdrawn)}
                disabled={statusLoading || normalizedStatus === EmployeeApplicationStatus.Finalized}
              >
                Withdraw
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={handleRegenerate}
              disabled={
                regenerateLoading || normalizedStatus === EmployeeApplicationStatus.Finalized
              }
              startIcon={<Iconify icon="mdi:link-variant-plus" />}
              data-testid="employee-onboarding-regenerate-link"
            >
              Regenerate link
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => onFinalize(application)}
              disabled={!canFinalizeEmployeeApplication(application.status)}
              startIcon={<Iconify icon="mdi:account-check-outline" />}
              data-testid="employee-onboarding-detail-finalize"
            >
              Finalize
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={handleDelete}
              disabled={deleteLoading || normalizedStatus === EmployeeApplicationStatus.Finalized}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

function FinalizeDialog({
  application,
  open,
  onClose,
}: {
  application?: EmployeeApplication;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FinalizeFormState | null>(null);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery(undefined);
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsQuery(undefined);
  const [finalizeApplication, { isLoading }] = useFinalizeEmployeeApplicationMutation();

  useEffect(() => {
    if (application && open) {
      setForm(buildFinalizeInitialValues(application));
      setStep(0);
    }
  }, [application, open]);

  if (!application || !form) {
    return null;
  }

  const updateField = (field: keyof FinalizeFormState, value: string | boolean) =>
    setForm((current) => (current ? { ...current, [field]: value } : current));

  const canSubmit =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.mobileNo &&
    form.panNo &&
    form.adharNo &&
    form.doj &&
    form.roleId &&
    form.shiftId &&
    form.address1 &&
    form.address2 &&
    form.countryName &&
    form.stateName &&
    form.city;

  const handleFinalize = async () => {
    try {
      await finalizeApplication({
        id: application.id,
        body: {
          personalInfo: {
            firstName: form.firstName,
            middleName: form.middleName,
            lastName: form.lastName,
            dob: form.dob || null,
            gender: toNullableNumber(form.gender),
            religion: form.religion || null,
            casteType: toNullableNumber(form.casteType),
            familyCaste: form.familyCaste || null,
            maritalStatus: toNullableNumber(form.maritalStatus),
            bloodGroup: toNullableNumber(form.bloodGroup),
            email: form.email,
            mobileNo: form.mobileNo,
            secondaryMobileNo: form.secondaryMobileNo || null,
            panNo: form.panNo,
            adharNo: form.adharNo,
            doj: form.doj,
            isTeaching: form.isTeaching,
            department: form.department || null,
            roleId: form.roleId,
            shiftId: form.shiftId,
            organizationIds: parseOrganizationIds(form.organizationIds),
            address1: form.address1,
            address2: form.address2,
            address3: form.address3 || null,
            country: { name: form.countryName, isoCode: form.countryIsoCode || 'IN' },
            state: { name: form.stateName, isoCode: form.stateIsoCode },
            city: form.city,
            pinCode: form.pinCode || null,
          },
          workExperiences: application.workExperiences || [],
          useSubmittedPhoto: form.useSubmittedPhoto,
          attachResumeAsDocument: form.attachResumeAsDocument,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Employee finalized' });
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Could not finalize onboarding' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      data-testid="employee-onboarding-finalize-dialog"
    >
      <DialogTitle>Finalize onboarding</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stepper activeStep={step} alternativeLabel>
            {['Review', 'Employee fields', 'Confirm'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Candidate</Typography>
                <Typography variant="body2">{application.fullName || '-'}</Typography>
                <Typography variant="body2">{application.email || '-'}</Typography>
                <Typography variant="body2">{application.mobileNo || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Application</Typography>
                <Typography variant="body2">
                  Position: {application.positionAppliedFor || '-'}
                </Typography>
                <Typography variant="body2">
                  Department: {application.departmentAppliedFor || '-'}
                </Typography>
                <Typography variant="body2">
                  Submitted: {formatDate(application.submittedAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Experience</Typography>
                <Typography variant="body2">
                  {(application.workExperiences || []).length
                    ? `${application.workExperiences?.length} work experience record(s) will be copied.`
                    : 'No work experience submitted.'}
                </Typography>
              </Grid>
            </Grid>
          )}

          {step === 1 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="First name"
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Middle name"
                  value={form.middleName}
                  onChange={(event) => updateField('middleName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Last name"
                  value={form.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date of birth"
                  type="date"
                  value={form.dob}
                  onChange={(event) => updateField('dob', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Gender"
                  value={form.gender}
                  onChange={(event) => updateField('gender', event.target.value)}
                >
                  <MenuItem value="">Not selected</MenuItem>
                  <MenuItem value="1">Male</MenuItem>
                  <MenuItem value="2">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Religion"
                  value={form.religion}
                  onChange={(event) => updateField('religion', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Category"
                  value={form.casteType}
                  onChange={(event) => updateField('casteType', event.target.value)}
                >
                  <MenuItem value="">Not selected</MenuItem>
                  <MenuItem value="0">General</MenuItem>
                  <MenuItem value="1">OBC</MenuItem>
                  <MenuItem value="2">SC</MenuItem>
                  <MenuItem value="3">ST</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Family caste"
                  value={form.familyCaste}
                  onChange={(event) => updateField('familyCaste', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Marital status"
                  value={form.maritalStatus}
                  onChange={(event) => updateField('maritalStatus', event.target.value)}
                >
                  <MenuItem value="">Not selected</MenuItem>
                  <MenuItem value="0">Unmarried</MenuItem>
                  <MenuItem value="1">Married</MenuItem>
                  <MenuItem value="2">Divorced</MenuItem>
                  <MenuItem value="3">Widowed</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Mobile no."
                  value={form.mobileNo}
                  onChange={(event) => updateField('mobileNo', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Secondary mobile no."
                  value={form.secondaryMobileNo}
                  onChange={(event) => updateField('secondaryMobileNo', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="PAN"
                  value={form.panNo}
                  onChange={(event) => updateField('panNo', event.target.value.toUpperCase())}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Aadhaar no."
                  value={form.adharNo}
                  onChange={(event) => updateField('adharNo', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Joining date"
                  type="date"
                  value={form.doj}
                  onChange={(event) => updateField('doj', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Employee group"
                  value={form.isTeaching ? 'teaching' : 'nonTeaching'}
                  onChange={(event) => updateField('isTeaching', event.target.value === 'teaching')}
                >
                  <MenuItem value="teaching">Teaching</MenuItem>
                  <MenuItem value="nonTeaching">Non-teaching</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Department"
                  value={form.department}
                  onChange={(event) => updateField('department', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  required
                  label="Role"
                  value={form.roleId}
                  onChange={(event) => updateField('roleId', event.target.value)}
                  disabled={rolesLoading}
                >
                  {(rolesData?.items || []).map((role: any) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  required
                  label="Shift"
                  value={form.shiftId}
                  onChange={(event) => updateField('shiftId', event.target.value)}
                  disabled={shiftsLoading}
                >
                  {(shiftsData?.items || []).map((shift: any) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.shiftName || shift.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Organization IDs"
                  value={form.organizationIds}
                  onChange={(event) => updateField('organizationIds', event.target.value)}
                  placeholder="Comma-separated stage IDs"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Address line 1"
                  value={form.address1}
                  onChange={(event) => updateField('address1', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Address line 2"
                  value={form.address2}
                  onChange={(event) => updateField('address2', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Country"
                  value={form.countryName}
                  onChange={(event) => updateField('countryName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Country code"
                  value={form.countryIsoCode}
                  onChange={(event) =>
                    updateField('countryIsoCode', event.target.value.toUpperCase())
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="State"
                  value={form.stateName}
                  onChange={(event) => updateField('stateName', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="State code"
                  value={form.stateIsoCode}
                  onChange={(event) =>
                    updateField('stateIsoCode', event.target.value.toUpperCase())
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="City"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pin code"
                  value={form.pinCode}
                  onChange={(event) => updateField('pinCode', event.target.value)}
                />
              </Grid>
            </Grid>
          )}

          {step === 2 && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">Final review</Typography>
              <Typography variant="body2">
                Employee/user creation will happen now for {form.firstName} {form.lastName}.
              </Typography>
              <Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.useSubmittedPhoto}
                      disabled={!application.hasPhoto}
                      onChange={(event) => updateField('useSubmittedPhoto', event.target.checked)}
                    />
                  }
                  label="Use submitted photo as profile picture"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.attachResumeAsDocument}
                      disabled={!application.hasResume}
                      onChange={(event) =>
                        updateField('attachResumeAsDocument', event.target.checked)
                      }
                    />
                  }
                  label="Attach submitted resume to employee documents"
                />
              </Stack>
              {!canSubmit && (
                <Typography variant="body2" color="error">
                  Complete required employee fields before finalizing.
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
          Back
        </Button>
        {step < 2 ? (
          <Button variant="contained" onClick={() => setStep((current) => current + 1)}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleFinalize}
            disabled={isLoading || !canSubmit}
            startIcon={<Iconify icon="mdi:account-check-outline" />}
          >
            Finalize
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function EmployeeOnboardingScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finalizeApplication, setFinalizeApplication] = useState<EmployeeApplication | undefined>();
  const finalizeApplicationId = finalizeApplication?.id;
  const queryArgs = useMemo(
    () => ({
      search,
      status: statusFilter,
      skipCount: 0,
      maxResultCount: 50,
    }),
    [search, statusFilter]
  );

  const { data, isFetching } = useGetEmployeeApplicationsQuery(queryArgs);
  const { data: detailData } = useGetEmployeeApplicationQuery(selectedId || '', {
    skip: !selectedId,
  });
  const { data: finalizeDetailData } = useGetEmployeeApplicationQuery(finalizeApplicationId || '', {
    skip: !finalizeApplicationId,
  });

  const applications = data?.items || [];
  const selectedApplication = detailData || applications.find((item) => item.id === selectedId);

  return (
    <Box sx={{ p: 3 }} data-testid="employee-onboarding-page">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4">Employee Onboarding</Typography>
            <Typography variant="body2" color="text.secondary">
              Candidate applications and final employee enrollment.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:link-plus" />}
            onClick={() => setInviteOpen(true)}
            data-testid="employee-onboarding-create-invite"
          >
            Create invite
          </Button>
        </Stack>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 1 }}
          data-testid="employee-onboarding-filters"
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ minWidth: 280 }}
            />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(String(event.target.value))}
              >
                <MenuItem value="">All statuses</MenuItem>
                {EMPLOYEE_APPLICATION_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {getEmployeeApplicationStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isFetching && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Loading
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 1 }}
          data-testid="employee-onboarding-table"
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow
                  hover
                  key={application.id}
                  data-testid="employee-onboarding-row"
                  data-application-id={application.id}
                >
                  <TableCell>
                    <Typography variant="subtitle2">
                      {application.fullName || 'Candidate'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.email || application.mobileNo || application.applicationNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{application.positionAppliedFor || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.departmentAppliedFor || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={application.status} />
                  </TableCell>
                  <TableCell>{formatDate(application.submittedAt)}</TableCell>
                  <TableCell>{formatDate(application.tokenExpiresAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Open details">
                      <IconButton
                        onClick={() => setSelectedId(application.id)}
                        data-testid="employee-onboarding-row-details"
                      >
                        <Iconify icon="mdi:eye-outline" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Finalize onboarding">
                      <span>
                        <IconButton
                          color="success"
                          disabled={!canFinalizeEmployeeApplication(application.status)}
                          onClick={() => setFinalizeApplication(application)}
                          data-testid="employee-onboarding-row-finalize"
                        >
                          <Iconify icon="mdi:account-check-outline" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!applications.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
                      <Iconify icon="mdi:account-search-outline" width={42} />
                      <Typography variant="body2" color="text.secondary">
                        No applications found.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
        <DetailDrawer
          open={Boolean(selectedId)}
          application={selectedApplication}
          onClose={() => setSelectedId(null)}
          onFinalize={(application) => setFinalizeApplication(application)}
        />
        <FinalizeDialog
          open={Boolean(finalizeApplication && finalizeDetailData)}
          application={finalizeDetailData}
          onClose={() => setFinalizeApplication(undefined)}
        />
      </Stack>
    </Box>
  );
}
