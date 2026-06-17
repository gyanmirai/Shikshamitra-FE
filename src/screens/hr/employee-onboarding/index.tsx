'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useAddAccessControlMutation } from 'src/redux/hr/employeeApi';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  Box,
  Card,
  Chip,
  Grid,
  Step,
  Stack,
  Button,
  Dialog,
  Select,
  Stepper,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  StepLabel,
  Typography,
  InputLabel,
  DialogTitle,
  FormControl,
  Autocomplete,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  FormControlLabel,
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
  designation: string;
  qualification: string;
  identificationMark1: string;
  roleId: string;
  shiftId: string;
  academicPermissionStageIds: string;
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

type EmployeeOnboardingListParams = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
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

const onboardingBreadcrumbSx = {
  flexWrap: { xs: 'wrap', sm: 'nowrap' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  rowGap: 1,
  '& > :last-child': {
    width: { xs: '100%', sm: 'auto' },
    display: 'flex',
    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
  },
};

const onboardingBreadcrumbSlotProps = {
  action: {},
  heading: {
    maxWidth: { xs: 'calc(100vw - 140px)', sm: 'none' },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  moreLink: {},
  breadcrumbs: {
    display: { xs: 'none', md: 'block' },
  },
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parsedDate = dayjs(value);

  return parsedDate.isValid() ? parsedDate.format('DD MMM YYYY') : '-';
};

const toDateInputValue = (value?: string | null) =>
  value ? dayjs(value).format('YYYY-MM-DD') : '';

const formatBoolean = (value?: boolean | null) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '-';
};

const copyToClipboard = async (value: string, label = 'Link') => {
  try {
    await navigator.clipboard.writeText(value);
    shikshaMitraToast.success({ message: `${label} copied` });
    return true;
  } catch {
    shikshaMitraToast.warning({ message: `${label} could not be copied` });
    return false;
  }
};

const buildPublicLink = (path: string) =>
  typeof window === 'undefined' ? path : `${window.location.origin}${path}`;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const showInviteEmailDeliveryToast = (
  emailDeliverySucceeded: boolean,
  successMessage: string,
  failureMessage: string,
  emailDeliveryMessage?: string | null
) => {
  if (emailDeliverySucceeded) {
    shikshaMitraToast.success({ message: successMessage });
    return;
  }

  shikshaMitraToast.warning({ message: emailDeliveryMessage || failureMessage });
};

const buildFinalizeInitialValues = (application: EmployeeApplication): FinalizeFormState => {
  const { personalInfo } = application;

  return {
    firstName: personalInfo?.firstName || application.firstName || '',
    middleName: personalInfo?.middleName || application.middleName || '',
    lastName: personalInfo?.lastName || application.lastName || '',
    dob: toDateInputValue(personalInfo?.dateOfBirth || application.dateOfBirth),
    gender:
      personalInfo?.gender !== null && personalInfo?.gender !== undefined
        ? String(personalInfo.gender)
        : application.gender
          ? String(application.gender)
          : '',
    religion: personalInfo?.religion || application.religion || '',
    casteType:
      personalInfo?.casteType !== null && personalInfo?.casteType !== undefined
        ? String(personalInfo.casteType)
        : application.casteType !== null && application.casteType !== undefined
          ? String(application.casteType)
          : '',
    familyCaste: personalInfo?.familyCaste || application.familyCaste || '',
    maritalStatus:
      personalInfo?.maritalStatus !== null && personalInfo?.maritalStatus !== undefined
        ? String(personalInfo.maritalStatus)
        : application.maritalStatus !== null && application.maritalStatus !== undefined
          ? String(application.maritalStatus)
          : '',
    bloodGroup:
      personalInfo?.bloodGroup !== null && personalInfo?.bloodGroup !== undefined
        ? String(personalInfo.bloodGroup)
        : application.bloodGroup !== null && application.bloodGroup !== undefined
          ? String(application.bloodGroup)
          : '',
    email: personalInfo?.email || application.email || '',
    mobileNo: personalInfo?.mobileNo || application.mobileNo || '',
    secondaryMobileNo: personalInfo?.secondaryMobileNo || application.secondaryMobileNo || '',
    panNo: '',
    adharNo: '',
    doj: dayjs().format('YYYY-MM-DD'),
    isTeaching: personalInfo?.isTeaching ?? true,
    department: personalInfo?.department || application.departmentAppliedFor || '',
    designation: personalInfo?.designation || application.positionAppliedFor || '',
    qualification: personalInfo?.qualification || application.qualificationSummary || '',
    identificationMark1: personalInfo?.identificationMark1 || '',
    roleId: '',
    shiftId: '',
    academicPermissionStageIds: '',
    address1: personalInfo?.address1 || application.address1 || '',
    address2: personalInfo?.address2 || application.address2 || '',
    address3: personalInfo?.address3 || application.address3 || '',
    countryName: personalInfo?.country?.name || application.country?.name || 'India',
    countryIsoCode: personalInfo?.country?.isoCode || application.country?.isoCode || 'IN',
    stateName: personalInfo?.state?.name || application.state?.name || '',
    stateIsoCode: personalInfo?.state?.isoCode || application.state?.isoCode || '',
    city: personalInfo?.city || application.city || '',
    pinCode: personalInfo?.pincode || application.pinCode || '',
    useSubmittedPhoto: application.hasPhoto,
    attachResumeAsDocument: application.hasResume,
  };
};

const toNullableNumber = (value: string) => (value === '' ? null : Number(value));

const parseStageIds = (value: string) =>
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
  const emailError = Boolean(form.email) && !isValidEmail(form.email);
  const canCreateInvite = isValidEmail(form.email);

  const updateField = (field: keyof InviteFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleCreate = async () => {
    try {
      const result = await createInvite({ ...form, email: form.email.trim() }).unwrap();
      await copyToClipboard(buildPublicLink(result.publicPath), 'Application link');
      showInviteEmailDeliveryToast(
        result.emailDeliverySucceeded,
        'Invite created and emailed',
        'Invite created, but email failed',
        result.emailDeliveryMessage
      );
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
              required
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              error={emailError}
              helperText={emailError ? 'Enter a valid email address.' : ' '}
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
          disabled={isLoading || !canCreateInvite}
          startIcon={<Iconify icon="mdi:link-plus" />}
        >
          Create link
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value || '-'}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      InputProps={{ readOnly: true }}
    />
  );
}

function DetailSection({
  title,
  children,
  testId,
}: {
  title: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <Card sx={{ p: 2 }} data-testid={testId}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">{title}</Typography>
        {children}
      </Stack>
    </Card>
  );
}

function EmployeeOnboardingDetailView({
  application,
  onBack,
  onFinalize,
  onCopyInviteLink,
  onRegenerateLink,
  onDelete,
  regenerateLoading,
  deleteLoading,
}: {
  application?: EmployeeApplication;
  onBack: () => void;
  onFinalize: (application: EmployeeApplication) => void;
  onCopyInviteLink: (application: EmployeeApplication) => Promise<void>;
  onRegenerateLink: (application: EmployeeApplication) => Promise<void>;
  onDelete: (application: EmployeeApplication, onDeleted?: () => void) => Promise<void>;
  regenerateLoading: boolean;
  deleteLoading: boolean;
}) {
  const [status, setStatus] = useState<EmployeeApplicationStatus>(
    EmployeeApplicationStatus.Screening
  );
  const [reason, setReason] = useState('');
  const [updateStatus, { isLoading: statusLoading }] = useUpdateEmployeeApplicationStatusMutation();
  const [downloadResume] = useLazyGetEmployeeApplicationResumeQuery();
  const [downloadPhoto] = useLazyGetEmployeeApplicationPhotoQuery();

  useEffect(() => {
    if (application) {
      setStatus(normalizeEmployeeApplicationStatus(application.status));
      setReason('');
    }
  }, [application]);

  if (!application) {
    return (
      <Box
        data-testid="employee-onboarding-detail-view"
        sx={{ height: '100%', minWidth: 0, overflowX: 'hidden' }}
      >
        <CustomBreadcrumbs
          heading="Employee Onboarding"
          links={[
            { name: 'HR/Staff', href: hrPaths.dashboard },
            { name: 'Employee' },
            { name: 'Employee Onboarding', onClick: onBack },
            { name: 'Application details' },
          ]}
          sx={onboardingBreadcrumbSx}
          slotProps={onboardingBreadcrumbSlotProps}
          isBack
          onBack={onBack}
        />
        <Card sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading application details...
          </Typography>
        </Card>
      </Box>
    );
  }

  const normalizedStatus = normalizeEmployeeApplicationStatus(application.status);
  const canUpdateStatus = normalizedStatus !== EmployeeApplicationStatus.Finalized;
  const submittedPersonal = application.personalInfo;
  const { familyInfo } = application;
  const { additionalInfo } = application;
  const candidateName =
    application.fullName ||
    [submittedPersonal?.firstName, submittedPersonal?.middleName, submittedPersonal?.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Candidate';
  const candidateEmail = submittedPersonal?.email || application.email;
  const candidateMobile = submittedPersonal?.mobileNo || application.mobileNo;
  const candidateSecondaryMobile =
    submittedPersonal?.secondaryMobileNo || application.secondaryMobileNo;
  const submittedPosition = submittedPersonal?.designation || application.positionAppliedFor;
  const submittedDepartment = submittedPersonal?.department || application.departmentAppliedFor;
  const submittedQualification =
    submittedPersonal?.qualification || application.qualificationSummary;
  const submittedIdentificationMark = submittedPersonal?.identificationMark1;
  const address =
    [
      submittedPersonal?.address1 || application.address1,
      submittedPersonal?.address2 || application.address2,
      submittedPersonal?.city || application.city,
      submittedPersonal?.state?.name || application.state?.name,
      submittedPersonal?.country?.name || application.country?.name,
    ]
      .filter(Boolean)
      .join(', ') || '-';

  const handleStatusUpdate = async (nextStatus = status) => {
    try {
      await updateStatus({ id: application.id, body: { status: nextStatus, reason } }).unwrap();
      shikshaMitraToast.success({ message: 'Status updated' });
    } catch {
      shikshaMitraToast.error({ message: 'Could not update status' });
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
    <Box
      data-testid="employee-onboarding-detail-view"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading={`${candidateName} Application`}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Employee' },
          { name: 'Employee Onboarding', onClick: onBack },
          { name: candidateName },
        ]}
        description={application.applicationNumber || 'Candidate onboarding application details.'}
        sx={onboardingBreadcrumbSx}
        slotProps={onboardingBreadcrumbSlotProps}
        isBack
        onBack={onBack}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            {application.publicPath && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onCopyInviteLink(application)}
                startIcon={<Iconify icon="mdi:content-copy" />}
                data-testid="employee-onboarding-copy-link"
              >
                Copy link
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={() => onRegenerateLink(application)}
              disabled={regenerateLoading || !canUpdateStatus}
              startIcon={<Iconify icon="mdi:link-variant-plus" />}
              data-testid="employee-onboarding-regenerate-link"
            >
              Regenerate
            </Button>
            <Button
              size="small"
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
              size="small"
              variant="text"
              color="error"
              onClick={() => onDelete(application, onBack)}
              disabled={deleteLoading || !canUpdateStatus}
              startIcon={<Iconify icon="mdi:delete-outline" />}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: 'hidden' }}>
        <Card sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6">{candidateName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {[candidateEmail, candidateMobile].filter(Boolean).join(' / ') || '-'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <StatusChip status={application.status} />
              <Typography variant="caption" color="text.secondary">
                Expires {formatDate(application.tokenExpiresAt)}
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={2}>
              <DetailSection title="Application">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Position" value={submittedPosition} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Department" value={submittedDepartment} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Submitted" value={formatDate(application.submittedAt)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Link expires"
                      value={formatDate(application.tokenExpiresAt)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Application no." value={application.applicationNumber} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Mobile" value={candidateMobile} />
                  </Grid>
                </Grid>
              </DetailSection>

              <DetailSection title="Candidate details">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Email" value={candidateEmail} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Secondary mobile" value={candidateSecondaryMobile} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Date of birth"
                      value={formatDate(submittedPersonal?.dateOfBirth || application.dateOfBirth)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DetailField label="Qualification" value={submittedQualification} multiline />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DetailField
                      label="Identification mark"
                      value={submittedIdentificationMark}
                      multiline
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DetailField label="Address" value={address} multiline />
                  </Grid>
                </Grid>
              </DetailSection>

              <DetailSection title="Family information">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Father name" value={familyInfo?.fatherDetails?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Father mobile"
                      value={familyInfo?.fatherDetails?.mobileNo}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Mother name" value={familyInfo?.motherDetails?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Mother mobile"
                      value={familyInfo?.motherDetails?.mobileNo}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Spouse name" value={familyInfo?.spouseDetails?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Spouse mobile"
                      value={familyInfo?.spouseDetails?.mobileNo}
                    />
                  </Grid>
                </Grid>
              </DetailSection>

              <DetailSection title="Additional details">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Person with disability"
                      value={formatBoolean(additionalInfo?.personWithDisability)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Second language" value={additionalInfo?.secondLanguage} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Library member"
                      value={formatBoolean(additionalInfo?.isLibraryMember)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Transport member"
                      value={formatBoolean(additionalInfo?.isTransportMember)}
                    />
                  </Grid>
                </Grid>
              </DetailSection>

              <DetailSection
                title="Work experience"
                testId="employee-onboarding-work-experience-list"
              >
                {(application.workExperiences || []).length ? (
                  <Grid container spacing={2}>
                    {application.workExperiences?.map((experience, index) => (
                      <Grid
                        key={`${experience.mediumStageName || 'experience'}-${index}`}
                        size={{ xs: 12, md: 6 }}
                      >
                        <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2">
                              {experience.mediumStageName || '-'}
                              {experience.designation ? `, ${experience.designation}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[experience.department, experience.city]
                                .filter(Boolean)
                                .join(' - ') || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[formatDate(experience.startDate), formatDate(experience.endDate)]
                                .filter((value) => value !== '-')
                                .join(' to ') || '-'}
                            </Typography>
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No work experience submitted.
                  </Typography>
                )}
              </DetailSection>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={2}>
              <DetailSection title="Documents">
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
              </DetailSection>

              <DetailSection title="Status action">
                <Stack spacing={1.5}>
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
                    minRows={3}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      onClick={() => handleStatusUpdate()}
                      disabled={statusLoading || !canUpdateStatus}
                    >
                      Update
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Rejected)}
                      disabled={statusLoading || !canUpdateStatus}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Withdrawn)}
                      disabled={statusLoading || !canUpdateStatus}
                    >
                      Withdraw
                    </Button>
                  </Stack>
                </Stack>
              </DetailSection>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
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
  const [finalizedUserId, setFinalizedUserId] = useState<string | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery(undefined);
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsQuery(undefined);
  const {
    options: organizationOptions,
    byId: organizationOptionsById,
    isLoading: organizationsLoading,
  } = useAcademicOrganizationOptions(currentYear?.id);
  const [finalizeApplication, { isLoading }] = useFinalizeEmployeeApplicationMutation();
  const [addAccessControl, { isLoading: academicPermissionSaving }] = useAddAccessControlMutation();

  useEffect(() => {
    if (application && open) {
      setForm(buildFinalizeInitialValues(application));
      setStep(0);
      setFinalizedUserId(null);
    }
  }, [application, open]);

  if (!application || !form) {
    return null;
  }

  const updateField = (field: keyof FinalizeFormState, value: string | boolean) =>
    setForm((current) => (current ? { ...current, [field]: value } : current));
  const selectedStageIds = parseStageIds(form.academicPermissionStageIds);
  const selectedStages = selectedStageIds.map((id) => {
    const option = organizationOptionsById.get(id);
    return (
      option || {
        id,
        name: id,
        label: id,
        stageName: id,
        mediumId: '',
        mediumName: '',
        boardId: '',
        boardName: '',
        academicYearId: currentYear?.id || '',
      }
    );
  });

  const canSubmit = Boolean(
    form.firstName &&
    form.lastName &&
    form.email &&
    form.mobileNo &&
    form.panNo &&
    form.adharNo &&
    form.doj &&
    form.roleId &&
    form.shiftId &&
    currentYear?.id &&
    selectedStageIds.length > 0 &&
    form.address1 &&
    form.address2 &&
    form.countryName &&
    form.stateName &&
    form.city
  );

  const handleFinalize = async () => {
    try {
      let userId = finalizedUserId;
      if (!userId) {
        const result = await finalizeApplication({
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
              designation: form.designation || null,
              qualification: form.qualification || null,
              identificationMark1: form.identificationMark1 || null,
              roleId: form.roleId,
              shiftId: form.shiftId,
              address1: form.address1,
              address2: form.address2,
              address3: form.address3 || null,
              country: { name: form.countryName, isoCode: form.countryIsoCode || 'IN' },
              state: { name: form.stateName, isoCode: form.stateIsoCode },
              city: form.city,
              pinCode: form.pinCode || null,
            },
            familyInfo: application.familyInfo || null,
            additionalInfo: application.additionalInfo || null,
            workExperiences: application.workExperiences || [],
            useSubmittedPhoto: form.useSubmittedPhoto,
            attachResumeAsDocument: form.attachResumeAsDocument,
          },
        }).unwrap();
        userId = (result.employee as any)?.userId || null;
        if (userId) {
          setFinalizedUserId(userId);
        }
      }

      if (!userId || !currentYear?.id) {
        shikshaMitraToast.warning({
          message: 'Employee finalized, but Academic Permission could not be saved.',
        });
        return;
      }

      try {
        await addAccessControl({
          academicYearIds: [currentYear.id],
          userIds: [userId],
          educationMediumStageIds: selectedStageIds,
        }).unwrap();
      } catch {
        shikshaMitraToast.warning({
          message: 'Employee finalized, but Academic Permission could not be saved.',
        });
        return;
      }

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
            {['Review', 'Employee fields', 'Academic Permission', 'Confirm'].map((label) => (
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
                  fullWidth
                  size="small"
                  label="Designation"
                  value={form.designation}
                  onChange={(event) => updateField('designation', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Qualification"
                  value={form.qualification}
                  onChange={(event) => updateField('qualification', event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Identification mark"
                  value={form.identificationMark1}
                  onChange={(event) => updateField('identificationMark1', event.target.value)}
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Academic Permission</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  size="small"
                  options={organizationOptions}
                  value={selectedStages}
                  loading={organizationsLoading}
                  disabled={organizationsLoading || !currentYear?.id}
                  getOptionLabel={(option) => option.name || option.label || ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, value) =>
                    updateField(
                      'academicPermissionStageIds',
                      value.map((item) => item.id).join(',')
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      label="Organization"
                      error={!currentYear?.id || selectedStageIds.length === 0}
                      helperText={
                        !currentYear?.id
                          ? 'Academic year is required'
                          : selectedStageIds.length === 0
                            ? 'Academic Permission organization is required'
                            : undefined
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {step === 3 && (
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
                  Complete required employee fields and Academic Permission before finalizing.
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
        {step < 3 ? (
          <Button variant="contained" onClick={() => setStep((current) => current + 1)}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleFinalize}
            disabled={isLoading || academicPermissionSaving || !canSubmit}
            startIcon={<Iconify icon="mdi:account-check-outline" />}
          >
            {finalizedUserId ? 'Save Academic Permission' : 'Finalize'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function EmployeeOnboardingScreen() {
  const { getAllParams, setParam, deleteParam } = useCustomSearchParams();
  const searchParams = getAllParams();
  const applicationId = searchParams.application || '';
  const [employeeParams, setEmployeeParams] = useState<EmployeeOnboardingListParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'All',
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [finalizeApplication, setFinalizeApplication] = useState<EmployeeApplication | undefined>();
  const finalizeApplicationId = finalizeApplication?.id;
  const [regenerateLink, { isLoading: regenerateLoading }] =
    useRegenerateEmployeeApplicationLinkMutation();
  const [deleteApplication, { isLoading: deleteLoading }] = useDeleteEmployeeApplicationMutation();

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setEmployeeParams((current) => ({ ...current, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setEmployeeParams((current) => ({ ...current, page: 1, search }));
  }, []);

  const queryArgs = useMemo(
    () => ({
      search: employeeParams.search,
      status: employeeParams.status === 'All' ? undefined : employeeParams.status,
      skipCount: (employeeParams.page - 1) * employeeParams.pageSize,
      maxResultCount: employeeParams.pageSize,
    }),
    [employeeParams]
  );

  const { data, isFetching } = useGetEmployeeApplicationsQuery(queryArgs);
  const { data: detailData } = useGetEmployeeApplicationQuery(applicationId || '', {
    skip: !applicationId,
  });
  const { data: finalizeDetailData } = useGetEmployeeApplicationQuery(finalizeApplicationId || '', {
    skip: !finalizeApplicationId,
  });

  const applications = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const selectedApplication = applicationId
    ? detailData || applications.find((item) => item.id === applicationId)
    : undefined;

  const handleOpenApplication = useCallback(
    (id: string) => {
      setParam('application', id);
    },
    [setParam]
  );

  const handleBackToList = useCallback(() => {
    deleteParam('application');
  }, [deleteParam]);

  const handleCopyInviteLink = useCallback(async (application: EmployeeApplication) => {
    if (!application.publicPath) {
      return;
    }

    await copyToClipboard(buildPublicLink(application.publicPath), 'Application link');
  }, []);

  const handleRegenerateLink = useCallback(
    async (application: EmployeeApplication) => {
      try {
        const result = await regenerateLink(application.id).unwrap();
        await copyToClipboard(buildPublicLink(result.publicPath), 'New application link');
        showInviteEmailDeliveryToast(
          result.emailDeliverySucceeded,
          'Link regenerated and emailed',
          'Link regenerated, but email failed',
          result.emailDeliveryMessage
        );
      } catch {
        shikshaMitraToast.error({ message: 'Could not regenerate link' });
      }
    },
    [regenerateLink]
  );

  const handleDeleteApplication = useCallback(
    async (application: EmployeeApplication, onDeleted?: () => void) => {
      try {
        await deleteApplication(application.id).unwrap();
        shikshaMitraToast.success({ message: 'Application deleted' });
        onDeleted?.();
      } catch {
        shikshaMitraToast.error({ message: 'Could not delete application' });
      }
    },
    [deleteApplication]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'candidate',
        label: 'Candidate',
        align: 'left',
        width: 260,
        minWidth: 220,
        isSort: false,
        render: (_value, row) => {
          const application = row as EmployeeApplication;

          return (
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleOpenApplication(application.id);
              }}
              sx={{
                display: 'block',
                width: '100%',
                p: 0,
                border: 0,
                bgcolor: 'transparent',
                color: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {application.fullName || 'Candidate'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {application.email || application.mobileNo || application.applicationNumber}
                </Typography>
              </Stack>
            </Box>
          );
        },
      },
      {
        id: 'position',
        label: 'Position',
        align: 'left',
        width: 220,
        minWidth: 180,
        isSort: false,
        render: (_value, row) => {
          const application = row as EmployeeApplication;

          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {application.positionAppliedFor || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {application.departmentAppliedFor || '-'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        width: 160,
        minWidth: 150,
        isSort: false,
        render: (value) => <StatusChip status={value} />,
      },
      {
        id: 'submittedAt',
        label: 'Submitted',
        align: 'left',
        width: 140,
        minWidth: 130,
        isSort: false,
        render: (value) => formatDate(value),
      },
      {
        id: 'tokenExpiresAt',
        label: 'Expires',
        align: 'left',
        width: 140,
        minWidth: 130,
        isSort: false,
        render: (value) => formatDate(value),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        width: 120,
        minWidth: 112,
        isSort: false,
        isFilter: false,
        headerSx: { px: 1.5 },
        cellSx: { px: 1.5 },
        render: (_value, row) => {
          const application = row as EmployeeApplication;
          const canFinalize = canFinalizeEmployeeApplication(application.status);
          const normalizedStatus = normalizeEmployeeApplicationStatus(application.status);
          const canMutate = normalizedStatus !== EmployeeApplicationStatus.Finalized;

          return (
            <Box
              data-testid="employee-onboarding-row-details"
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <ThreeDotsActions
                showViewIcon
                placement="right-top"
                sx={{
                  gap: 1,
                  '& .MuiIconButton-root': {
                    p: 0.75,
                  },
                  '& svg': {
                    width: 18,
                    height: 18,
                  },
                }}
                handleViewClick={() => handleOpenApplication(application.id)}
                actions={({ popover }) => (
                  <MenuList dense>
                    <MenuItem
                      data-testid="employee-onboarding-row-finalize"
                      disabled={!canFinalize}
                      onClick={() => {
                        popover.onClose();
                        setFinalizeApplication(application);
                      }}
                    >
                      <ListItemIcon>
                        <Iconify icon="mdi:account-check-outline" />
                      </ListItemIcon>
                      <ListItemText>Finalize</ListItemText>
                    </MenuItem>
                    {application.publicPath && (
                      <MenuItem
                        onClick={() => {
                          popover.onClose();
                          handleCopyInviteLink(application).catch(() => undefined);
                        }}
                      >
                        <ListItemIcon>
                          <Iconify icon="mdi:content-copy" />
                        </ListItemIcon>
                        <ListItemText>Copy invite link</ListItemText>
                      </MenuItem>
                    )}
                    <MenuItem
                      disabled={!canMutate}
                      onClick={() => {
                        popover.onClose();
                        handleRegenerateLink(application).catch(() => undefined);
                      }}
                    >
                      <ListItemIcon>
                        <Iconify icon="mdi:link-variant-plus" />
                      </ListItemIcon>
                      <ListItemText>Regenerate link</ListItemText>
                    </MenuItem>
                    <MenuItem
                      disabled={!canMutate}
                      onClick={() => {
                        popover.onClose();
                        handleDeleteApplication(application).catch(() => undefined);
                      }}
                    >
                      <ListItemIcon>
                        <Iconify icon="mdi:delete-outline" color="error.main" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  </MenuList>
                )}
              />
            </Box>
          );
        },
      },
    ],
    [
      handleCopyInviteLink,
      handleDeleteApplication,
      handleOpenApplication,
      handleRegenerateLink,
      setFinalizeApplication,
    ]
  );

  if (applicationId) {
    return (
      <Box
        data-testid="employee-onboarding-page"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <EmployeeOnboardingDetailView
          application={selectedApplication}
          onBack={handleBackToList}
          onFinalize={(application) => setFinalizeApplication(application)}
          onCopyInviteLink={handleCopyInviteLink}
          onRegenerateLink={handleRegenerateLink}
          onDelete={handleDeleteApplication}
          regenerateLoading={regenerateLoading}
          deleteLoading={deleteLoading}
        />
        <FinalizeDialog
          open={Boolean(finalizeApplication && finalizeDetailData)}
          application={finalizeDetailData}
          onClose={() => setFinalizeApplication(undefined)}
        />
      </Box>
    );
  }

  return (
    <Box
      data-testid="employee-onboarding-page"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflowX: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading="Employee Onboarding"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Employee' },
          { name: 'Employee Onboarding' },
        ]}
        sx={onboardingBreadcrumbSx}
        slotProps={onboardingBreadcrumbSlotProps}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:link-plus" />}
            onClick={() => setInviteOpen(true)}
            data-testid="employee-onboarding-create-invite"
            sx={{ px: '24px' }}
          >
            Create invite
          </Button>
        }
        description="Candidate applications and final employee enrollment."
      />

      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: 'hidden' }}>
        <Card
          data-testid="employee-onboarding-filters"
          sx={{
            mb: 1,
            p: 1,
            display: 'grid',
            gap: 1,
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(180px, 280px)' },
          }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={employeeParams.status}
              onChange={(event) => {
                setEmployeeParams((current) => ({
                  ...current,
                  page: 1,
                  status: String(event.target.value),
                }));
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              {EMPLOYEE_APPLICATION_STATUSES.map((status) => (
                <MenuItem key={status} value={String(status)}>
                  {getEmployeeApplicationStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>

        <CustomizableTable
          key={employeeParams.status}
          tableId="employee-onboarding-table"
          columns={columns}
          data={applications}
          isLoading={isFetching}
          serverSidePagination
          serverSideFilter
          totalCount={totalCount}
          maxServerRowsPerPage={500}
          onServerPagination={handleServerPagination}
          serverSideSearch
          onServerSearch={handleServerSearch}
          defaultSearchTerm={employeeParams.search}
          noDataText="No applications found."
          rowProps={(row) =>
            ({
              'data-testid': 'employee-onboarding-row',
              'data-application-id': row.id,
            }) as any
          }
        />

        <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
        <FinalizeDialog
          open={Boolean(finalizeApplication && finalizeDetailData)}
          application={finalizeDetailData}
          onClose={() => setFinalizeApplication(undefined)}
        />
      </Stack>
    </Box>
  );
}
