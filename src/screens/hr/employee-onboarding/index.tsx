'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

import dayjs from 'dayjs';
import * as React from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import CustomDialog from 'src/components/customDialog';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import WorkAssignmentField from 'src/screens/hr/employee-onboarding/work-assignment-field';
import {
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Select,
  Divider,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import {
  useGetEmployeeApplicationQuery,
  useGetEmployeeApplicationsQuery,
  useDeleteEmployeeApplicationMutation,
  useLazyGetEmployeeApplicationPhotoQuery,
  useLazyGetEmployeeApplicationResumeQuery,
  useCreateEmployeeApplicationInviteMutation,
  useUpdateEmployeeApplicationStatusMutation,
  useRegenerateEmployeeApplicationLinkMutation,
} from 'src/redux/hr/employeeOnboardingApi';

import { getOnboardingErrorMessage } from './error-message';
import { resolveCurrentEmployeeApplication } from './employee-application-query-state';
import {
  onboardingReturnHref,
  onboardingFinalizeHref,
  readOnboardingListContext,
} from './finalize-navigation';
import {
  workAssignmentText,
  emptyWorkAssignment,
  workAssignmentRequest,
  type EmployeeWorkAssignment,
} from './work-assignment';
import {
  getValidNextStatuses,
  EmployeeApplicationStatus,
  EMPLOYEE_APPLICATION_STATUSES,
  isEmployeeApplicationTerminal,
  canFinalizeEmployeeApplication,
  canCopyEmployeeApplicationLink,
  getEmployeeApplicationStatusColor,
  getEmployeeApplicationStatusLabel,
  normalizeEmployeeApplicationStatus,
  canRegenerateEmployeeApplicationLink,
} from './status';

type InviteFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  positionAppliedFor: string;
  workAssignment: EmployeeWorkAssignment;
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
  workAssignment: emptyWorkAssignment(),
};

// const onboardingBreadcrumbSx = {
//   flexWrap: { xs: 'wrap', sm: 'nowrap' },
//   alignItems: { xs: 'flex-start', sm: 'center' },
//   rowGap: 1,
//   '& > :last-child': {
//     width: { xs: '100%', sm: 'auto' },
//     display: 'flex',
//     justifyContent: { xs: 'flex-start', sm: 'flex-end' },
//   },
// };

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
const isMobileValid = (value: string) => value && value.replace(/\D/g, '').length >= 10;

// ── Yup validation schema for FinalizeWorkflow Step 1 ────────────────────────────

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

export function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<InviteFormState>(defaultInviteForm);
  const [createInvite, { isLoading }] = useCreateEmployeeApplicationInviteMutation();
  const emailError = Boolean(form.email) && !isValidEmail(form.email);
  const [workAssignmentValid, setWorkAssignmentValid] = useState(true);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canCreateInvite = isValidEmail(form.email) && workAssignmentValid;

  const updateField = (field: keyof InviteFormState, value: string | EmployeeWorkAssignment) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleCreate = async () => {
    if (!canCreateInvite || isLoading) return;
    try {
      const result = await createInvite({
        ...form,
        email: form.email.trim(),
        workAssignment: workAssignmentRequest(form.workAssignment),
      }).unwrap();
      await copyToClipboard(buildPublicLink(result.publicPath), 'Application link');
      showInviteEmailDeliveryToast(
        result.emailDeliverySucceeded,
        'Invite created and emailed',
        'Invite created, but email failed',
        result.emailDeliveryMessage
      );
      setForm(defaultInviteForm);
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(error, 'Could not create invite'),
      });
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="sm"
      data-testid="employee-onboarding-invite-dialog"
      title={
        <Box display="flex" alignItems="center" gap={1}>
          Create onboarding invite
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="Create an invite link to onboard a new staff."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="First name"
              value={form.firstName}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  updateField('firstName', newName);
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Middle name"
              value={form.middleName}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  updateField('middleName', newName);
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Last name"
              value={form.lastName}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  updateField('lastName', newName);
                }
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 0.5 }}>
                      <Iconify icon="mdi-light:email" width={22} color="text.disabled" />
                      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <PhoneInput
              name="mobileNo"
              value={form.mobileNo || ''}
              onChange={(value) => updateField('mobileNo', value ?? '')}
              label="Primary Contact No. *"
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
          <Grid size={{ xs: 12 }}>
            <WorkAssignmentField
              value={form.workAssignment}
              currentYear={currentYear}
              disabled={isLoading}
              onChange={(value) => updateField('workAssignment', value)}
              onValidityChange={setWorkAssignmentValid}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider sx={{ pb: 2 }} />
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleCreate}
          disabled={!canCreateInvite}
          loading={isLoading}
          size="small"
          startIcon={<Iconify icon="mdi:link-plus" />}
        >
          Create link
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
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
    <Stack spacing={0.5}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
          wordBreak: 'break-word',
          color: value ? 'text.primary' : 'text.disabled',
        }}
      >
        {value || '-'}
      </Typography>
    </Stack>
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
    <Card sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, height: '100%' }} data-testid={testId}>
      <Stack spacing={1.5}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.secondary"
          textTransform="uppercase"
        >
          {title}
        </Typography>
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
  onDelete: (application: EmployeeApplication, onDeleted?: () => void) => void;
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
  const theme = useTheme();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const mayFinalize = hasGrantedPermission(
    permissions,
    `${hrPermissions.employee.onboarding}.Finalize`
  );
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
          heading="Staff Onboarding"
          description="Review candidate information and complete staff enrollment."
          links={[{ name: 'Staff Onboarding', onClick: onBack }, { name: 'Application details' }]}
          // sx={onboardingBreadcrumbSx}
          // slotProps={onboardingBreadcrumbSlotProps}
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
  const canUpdateStatus = !isEmployeeApplicationTerminal(normalizedStatus);
  const canRegenerateLink =
    canRegenerateEmployeeApplicationLink(normalizedStatus) && !application.submittedAt;
  const canCopyLink = canCopyEmployeeApplicationLink(normalizedStatus);
  const canDelete = normalizedStatus !== EmployeeApplicationStatus.Finalized;
  const hasStatusChanged = status !== normalizedStatus;
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
  const submittedDepartment = submittedPersonal?.department;
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
    const isForwardOrTerminal =
      nextStatus === EmployeeApplicationStatus.Rejected ||
      nextStatus === EmployeeApplicationStatus.Withdrawn ||
      nextStatus >= normalizedStatus;

    if (!isForwardOrTerminal) {
      shikshaMitraToast.error({ message: 'Cannot move to a previous workflow status' });
      return;
    }

    try {
      await updateStatus({ id: application.id, body: { status: nextStatus, reason } }).unwrap();
      shikshaMitraToast.success({ message: 'Status updated' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(error, 'Could not update status'),
      });
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
        maxWidth: '1440px',
        mx: 'auto',
        width: '100%',
      }}
    >
      <CustomBreadcrumbs
        heading={`${candidateName} Application`}
        links={[
          { name: 'Staff Onboarding', onClick: onBack },
          { name: `${candidateName} Application` },
        ]}
        description={application.applicationNumber || 'Candidate onboarding application details.'}
        // sx={onboardingBreadcrumbSx}
        // slotProps={onboardingBreadcrumbSlotProps}
        isBack
        onBack={onBack}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            {application.publicPath && (
              <Button
                size="small"
                variant="outlined"
                disabled={!canCopyLink}
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
              disabled={regenerateLoading || !canRegenerateLink}
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
              disabled={!mayFinalize || !canFinalizeEmployeeApplication(application.status)}
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
              disabled={deleteLoading || !canDelete}
              startIcon={<Iconify icon="mdi:delete-outline" />}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Stack spacing={1} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: 'hidden', p: 1 }}>
        <Paper sx={{ p: { xs: 2, md: 2 }, borderRadius: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                {candidateName}
              </Typography>
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
        </Paper>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailSection title="Application">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailField label="Position" value={submittedPosition} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailField label="Functional department" value={submittedDepartment} />
                      <DetailField
                        label="Organization / work assignment"
                        value={workAssignmentText(application)}
                      />
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
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
                        value={formatDate(
                          submittedPersonal?.dateOfBirth || application.dateOfBirth
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailField label="Qualification" value={submittedQualification} multiline />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailField
                        label="Identification mark"
                        value={submittedIdentificationMark}
                        multiline
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailField label="Address" value={address} multiline />
                    </Grid>
                  </Grid>
                </DetailSection>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12 }}>
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
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={1} sx={{ position: { lg: 'sticky' }, top: { lg: 8 } }}>
              <DetailSection title="Documents">
                <Stack direction="column" spacing={1.5}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!application.hasResume}
                    onClick={() => handleDownload('resume')}
                    startIcon={<Iconify icon="mdi:file-document-outline" />}
                    endIcon={application.hasResume ? <Iconify icon="mdi:download" /> : undefined}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'text.secondary',
                      borderColor: 'divider',
                    }}
                  >
                    Applicant Resume
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!application.hasPhoto}
                    onClick={() => handleDownload('photo')}
                    startIcon={<Iconify icon="mdi:image-outline" />}
                    endIcon={application.hasPhoto ? <Iconify icon="mdi:download" /> : undefined}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'text.secondary',
                      borderColor: 'divider',
                    }}
                  >
                    Applicant Photo
                  </Button>
                </Stack>
              </DetailSection>

              <DetailSection title="Status action">
                <Stack spacing={2}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={status}
                      disabled={!canUpdateStatus || statusLoading}
                      onChange={(event) =>
                        setStatus(Number(event.target.value) as EmployeeApplicationStatus)
                      }
                    >
                      {getValidNextStatuses(normalizedStatus).map((item) => (
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
                  <Stack direction="row" spacing={1} flexWrap="wrap" pt={0.5}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleStatusUpdate()}
                      disabled={statusLoading || !canUpdateStatus || !hasStatusChanged}
                      sx={{ flex: 1 }}
                      startIcon={<Iconify icon="mdi:check-circle-outline" />}
                    >
                      Update
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Rejected)}
                      disabled={statusLoading || !canUpdateStatus}
                      startIcon={<Iconify icon="mdi:close-circle-outline" />}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="inherit"
                      onClick={() => handleStatusUpdate(EmployeeApplicationStatus.Withdrawn)}
                      disabled={statusLoading || !canUpdateStatus}
                      startIcon={<Iconify icon="mdi:minus-circle-outline" />}
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

export default function EmployeeOnboardingScreen() {
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const mayFinalize = hasGrantedPermission(
    permissions,
    `${hrPermissions.employee.onboarding}.Finalize`
  );
  const { getAllParams, setParam, deleteParam } = useCustomSearchParams();
  const searchParams = getAllParams();
  const applicationId = searchParams.application || '';
  const [employeeParams, setEmployeeParams] = useState<EmployeeOnboardingListParams>(() =>
    readOnboardingListContext(searchParams)
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{
    application: EmployeeApplication;
    onDeleted?: () => void;
  }>();
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

  const exportTable = useHrTableExport('employee-onboarding-table', queryArgs);
  const {
    data,
    isFetching,
    error: tableError,
    refetch: retryTable,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'employee-onboarding-table',
      query: queryArgs,
      page: employeeParams.page - 1,
      size: employeeParams.pageSize,
      resetPage: () => setEmployeeParams((current) => ({ ...current, page: 1 })),
    },
    useGetEmployeeApplicationsQuery(queryArgs)
  );
  const { currentData: detailData } = useGetEmployeeApplicationQuery(applicationId || '', {
    skip: !applicationId,
  });
  const applications = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const selectedApplication = resolveCurrentEmployeeApplication(
    applicationId,
    detailData,
    applications
  );
  const handleOpenFinalize = useCallback(
    (application: EmployeeApplication) => {
      if (!mayFinalize) return;
      const returnHref = onboardingReturnHref(employeeParams, applicationId || undefined);
      router.push(onboardingFinalizeHref(application.id, returnHref));
    },
    [router, employeeParams, applicationId, mayFinalize]
  );

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

  const requestDeleteApplication = useCallback(
    (application: EmployeeApplication, onDeleted?: () => void) => {
      setPendingDeletion({ application, onDeleted });
    },
    []
  );

  const handleDeleteApplication = useCallback(async () => {
    if (!pendingDeletion) return;

    try {
      await deleteApplication(pendingDeletion.application.id).unwrap();
      shikshaMitraToast.success({ message: 'Application deleted' });
      const { onDeleted } = pendingDeletion;
      setPendingDeletion(undefined);
      onDeleted?.();
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(error, 'Could not delete application'),
      });
    }
  }, [deleteApplication, pendingDeletion]);

  const deleteConfirmation = (
    <ConfirmDialog
      open={Boolean(pendingDeletion)}
      onClose={() => {
        if (!deleteLoading) setPendingDeletion(undefined);
      }}
      title="Delete application?"
      content={
        <>
          Delete the onboarding application for{' '}
          <strong>
            {pendingDeletion?.application.fullName ||
              pendingDeletion?.application.email ||
              pendingDeletion?.application.applicationNumber}
          </strong>
          ? This action cannot be undone.
        </>
      }
      action={
        <LoadingButton
          size="small"
          color="error"
          variant="contained"
          loading={deleteLoading}
          onClick={handleDeleteApplication}
          data-testid="employee-onboarding-confirm-delete"
        >
          Delete
        </LoadingButton>
      }
    />
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
                {workAssignmentText(application)}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'status',
        filterType: 'enum',
        enumOptions: EMPLOYEE_APPLICATION_STATUSES.map((value) => ({
          value,
          label: getEmployeeApplicationStatusLabel(value),
        })),
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
        excludeFromExport: true,
        id: 'actions',
        label: 'Actions',
        width: 70,
        minWidth: 60,
        sticky: true,
        stickyPosition: 'right' as const,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const application = row as EmployeeApplication;
          const canFinalize = mayFinalize && canFinalizeEmployeeApplication(application.status);
          const normalizedStatus = normalizeEmployeeApplicationStatus(application.status);
          const canRegenerate =
            canRegenerateEmployeeApplicationLink(normalizedStatus) && !application.submittedAt;
          const canDelete = normalizedStatus !== EmployeeApplicationStatus.Finalized;

          return (
            <Box
              data-testid="employee-onboarding-row-details"
              sx={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <ThreeDotsActions
                viewLabel={`View ${String(row.fullName || row.id)}`}
                editLabel={`Edit ${String(row.fullName || row.id)}`}
                deleteLabel={`Delete ${String(row.fullName || row.id)}`}
                moreLabel={`More actions for ${String(row.fullName || row.id)}`}
                showViewIcon
                placement="right-top"
                handleViewClick={() => handleOpenApplication(application.id)}
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      data-testid="employee-onboarding-row-finalize"
                      disabled={!canFinalize}
                      onClick={() => {
                        popover.onClose();
                        handleOpenFinalize(application);
                      }}
                    >
                      <ListItemIcon>
                        <Iconify icon="mdi:account-check-outline" />
                      </ListItemIcon>
                      <ListItemText>Finalize</ListItemText>
                    </MenuItem>
                    {application.publicPath && (
                      <MenuItem
                        disabled={!canCopyEmployeeApplicationLink(normalizedStatus)}
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
                      disabled={!canRegenerate}
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
                      disabled={!canDelete}
                      onClick={() => {
                        popover.onClose();
                        requestDeleteApplication(application);
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
      handleOpenApplication,
      handleRegenerateLink,
      requestDeleteApplication,
      handleOpenFinalize,
      mayFinalize,
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
          onFinalize={handleOpenFinalize}
          onCopyInviteLink={handleCopyInviteLink}
          onRegenerateLink={handleRegenerateLink}
          onDelete={requestDeleteApplication}
          regenerateLoading={regenerateLoading}
          deleteLoading={deleteLoading}
        />
        {deleteConfirmation}
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
        heading="Staff Onboarding"
        links={[{ name: 'Staff Onboarding' }]}
        // sx={onboardingBreadcrumbSx}
        // slotProps={onboardingBreadcrumbSlotProps}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:link-plus" />}
            onClick={() => setInviteOpen(true)}
            data-testid="employee-onboarding-create-invite"
          >
            Create invite
          </Button>
        }
        description="Candidate applications and final staff enrollment."
      />

      <Stack sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: 'hidden' }}>
        <Card
          data-testid="employee-onboarding-filters"
          sx={{
            p: 1,
            display: 'grid',
            gap: 1,
            mb: 1,
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
          showColumns
          showExport
          showFullScreen
          exportScope="all"
          key={employeeParams.status}
          tableId="employee-onboarding-table"
          tableTitle="Staff onboarding"
          onExport={exportTable}
          error={tableError}
          onRetry={retryTable}
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
          searchTerm={employeeParams.search}
          page={employeeParams.page - 1}
          rowsPerPage={employeeParams.pageSize}
          noDataText="No applications found."
          rowProps={(row) =>
            ({
              'data-testid': 'employee-onboarding-row',
              'data-application-id': row.id,
            }) as any
          }
          {...operationalTableProps}
        />

        <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
        {deleteConfirmation}
      </Stack>
    </Box>
  );
}
