'use client';

import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';
import type {
  SaveEmployeeCompensation,
  EmployeeActivationReadiness,
} from 'src/redux/hr/compensation-revision-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import * as React from 'react';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import PhoneInput from 'src/components/phone-input';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { HrBloodGroupArray } from 'src/enums/blood-group';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ShakingTextField from 'src/components/shaking-text-field';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { MaritalStatusTypeArray } from 'src/enums/marriatal-status';
import { ReligionType, ReligionTypeArray } from 'src/enums/religion';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { emptyStatutoryProfile } from 'src/redux/hr/statutory-profile-api';
import CityComponent from 'src/components/stardard-address/city-component';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import { EmployeeGroupType, EmployeeGroupTypeArray } from 'src/enums/employee-group';
import { OTPInput, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  getEmployeeAssignableRoles,
  shouldClearEmployeeRoleSelection,
} from 'src/screens/hr/employee/employee-role-options';
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
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Radio,
  Stack,
  Alert,
  Avatar,
  Button,
  Select,
  Divider,
  MenuItem,
  MenuList,
  Checkbox,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  InputLabel,
  FormControl,
  Autocomplete,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  InputAdornment,
  FormHelperText,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { getOnboardingErrorMessage } from './error-message';
import { statutoryProfileSchema } from '../employee/statutory-profile-fields';
import { SalaryStructureBuilder } from '../payroll/structure/SalaryStructureBuilder';
import { getLocalMonthKey } from '../payroll/structure/salary-structure-builder-utils';
import { resolveCurrentEmployeeApplication } from './employee-application-query-state';
import {
  finalizeEmployeeFieldsSchema,
  applyFinalizeEmployeeValidation,
} from './finalize-validation';
import {
  isOnboardingAcademicPermissionStepValid,
  buildOnboardingAcademicPermissionScopeRows,
} from './employeeOnboardingAcademicPermission';
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

import type { FinalizeFormState } from './finalize-validation';

type InviteFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  positionAppliedFor: string;
  departmentAppliedFor: string;
};

type EmployeeOnboardingListParams = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
};

type FinalizedEmployeeResult = {
  id: string;
  name: string;
  activationReadiness?: EmployeeActivationReadiness;
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

const toDatePickerValue = (value?: string | null): Dayjs | null => {
  const parsed = value ? dayjs(value) : null;
  return parsed?.isValid() ? parsed : null;
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

// ── Yup validation schema for FinalizeDialog Step 1 ────────────────────────────

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

const parseReligionToValue = (value: any): ReligionType | '' => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') return value;
  if (!isNaN(Number(value))) return Number(value) as ReligionType;
  const enumVal = ReligionType[value as keyof typeof ReligionType];
  return typeof enumVal === 'number' ? enumVal : '';
};

const buildFinalizeInitialValues = (application: EmployeeApplication): FinalizeFormState => {
  const { personalInfo } = application;
  return {
    firstName: personalInfo?.firstName || application.firstName || '',
    middleName: personalInfo?.middleName || application.middleName || '',
    lastName: personalInfo?.lastName || application.lastName || '',
    dob: toDatePickerValue(personalInfo?.dateOfBirth || application.dateOfBirth),
    gender:
      personalInfo?.gender !== null && personalInfo?.gender !== undefined
        ? String(personalInfo.gender)
        : application.gender
          ? String(application.gender)
          : '',
    religion:
      personalInfo?.religion !== null && personalInfo?.religion !== undefined
        ? parseReligionToValue(personalInfo.religion)
        : application.religion !== null && application.religion !== undefined
          ? parseReligionToValue(application.religion)
          : '',
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
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || [];

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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Department"
              value={form.departmentAppliedFor}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  updateField('departmentAppliedFor', newName);
                }
              }}
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
          links={[
            { name: 'Staff Onboarding', onClick: onBack },
            { name: 'Application details' },
          ]}
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

export function FinalizeDialog({
  application,
  open,
  onClose,
  onFinalized,
}: {
  application?: EmployeeApplication;
  open: boolean;
  onClose: () => void;
  onFinalized: (employee: FinalizedEmployeeResult) => void;
}) {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [maxStepVisited, setMaxStepVisited] = useState(0);
  const [academicTouched, setAcademicTouched] = useState(false);
  const [finalizeSaving, setFinalizeSaving] = useState(false);
  const [salary, setSalary] = useState<SaveEmployeeCompensation | null>(null);
  const [salaryEditor, setSalaryEditor] = useState({ dirty: false, busy: false });
  const finalizationPending = useRef(false);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery(undefined);
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsQuery(undefined);
  const {
    options: organizationOptions,
    byId: organizationOptionsById,
    isLoading: organizationsLoading,
  } = useAcademicOrganizationOptions(currentYear?.id);
  const [finalizeApplication, { isLoading }] = useFinalizeEmployeeApplicationMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageStatutory =
    hasGrantedPermission(permissions, hrPermissions.payroll.compensationRevisionActions.manage) &&
    hasGrantedPermission(
      permissions,
      hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment
    );
  const statutoryForm = useFormik({
    initialValues: emptyStatutoryProfile,
    validationSchema: statutoryProfileSchema,
    onSubmit: () => {},
  });

  const initialValues = useMemo(
    () => (application ? buildFinalizeInitialValues(application) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [application?.id, open]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || ({} as FinalizeFormState),
    validationSchema: Yup.object({}),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  const navigation = useUnsavedNavigation(
    open && (formik.dirty || statutoryForm.dirty || salaryEditor.dirty),
    {
      blockNavigation: finalizeSaving || isLoading || salaryEditor.busy,
      description:
        'The onboarding changes and salary preview have not been saved. Discarding or reloading requires entering them again. Finalize saves the staff and salary together.',
    }
  );
  const salaryMonth = [getLocalMonthKey(), formik.values.doj?.slice(0, 7) || ''].sort().at(-1)!;

  // convenience alias
  const form = formik.values;
  const selectedEmployeeGroup = form.isTeaching ? 0 : 1;
  const { setFieldValue } = formik;
  const employeeRoleOptions = useMemo(
    () => getEmployeeAssignableRoles(rolesData?.items ?? [], selectedEmployeeGroup),
    [rolesData?.items, selectedEmployeeGroup]
  );
  const updateField = (field: keyof FinalizeFormState, value: string | boolean | Dayjs | null) =>
    setFieldValue(field as string, value);

  useEffect(() => {
    if (
      rolesLoading ||
      !rolesData?.items ||
      !shouldClearEmployeeRoleSelection(rolesData.items, form.roleId, selectedEmployeeGroup)
    ) {
      return;
    }

    setFieldValue('roleId', '');
  }, [form.roleId, rolesData?.items, rolesLoading, selectedEmployeeGroup, setFieldValue]);

  useEffect(() => {
    if (application && open) {
      setStep(0);
      setMaxStepVisited(0);
      setAcademicTouched(false);
      setFinalizeSaving(false);
      setSalary(null);
      setSalaryEditor({ dirty: false, busy: false });
      statutoryForm.resetForm();
      formik.resetForm({ values: buildFinalizeInitialValues(application) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.id, open]);

  useEffect(() => {
    if (step > maxStepVisited) {
      setMaxStepVisited(step);
    }
  }, [step, maxStepVisited]);

  if (!application || !initialValues) {
    return null;
  }

  // ── Step-level validation using Yup + formik ──────────────────────────────
  const selectedStageIds = parseStageIds(form.academicPermissionStageIds);
  const academicPermissionScopeRows = buildOnboardingAcademicPermissionScopeRows(
    selectedStageIds,
    organizationOptionsById
  );

  const isStep2Valid = isOnboardingAcademicPermissionStepValid({
    isTeaching: form.isTeaching,
    academicYearId: currentYear?.id,
    isLoading: organizationsLoading,
    scopeRows: academicPermissionScopeRows,
  });

  const validateEmployeeFields = async () => {
    const errors = await applyFinalizeEmployeeValidation(formik);
    if (Object.keys(errors).length > 0) {
      setStep(1);
      focusFirstFormikError(errors);
      return false;
    }

    return true;
  };

  const handleStepperNext = async (
    isLastStep: boolean,
    values: any,
    formikInstance: any,
    setIsLoading: (val: boolean) => void
  ) => {
    if (step === 1) {
      if (!(await validateEmployeeFields())) return;
    }
    if (step === 2 && !isStep2Valid) {
      setAcademicTouched(true);
      return;
    }
    setAcademicTouched(false);
    if (isLastStep) {
      setIsLoading(true);
      try {
        await handleFinalize();
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep((current) => current + 1);
    }
  };

  const isStepClickable = (index: number) => index <= maxStepVisited;
  const handleStepClick = async (index: number) => {
    if (finalizationPending.current || salaryEditor.busy) return;
    if (index > step && index > 1 && !(await validateEmployeeFields())) {
      return;
    }
    if (index > step && index > 2 && !isStep2Valid) {
      setAcademicTouched(true);
      setStep(2);
      return;
    }

    setAcademicTouched(false);
    setStep(index);
  };

  const canSubmit =
    finalizeEmployeeFieldsSchema.isValidSync(form, { abortEarly: false }) &&
    isStep2Valid &&
    canManageStatutory &&
    Boolean(salary) &&
    !salaryEditor.busy;

  const handleFinalize = async () => {
    if (finalizationPending.current || salaryEditor.busy) return;
    if (!(await validateEmployeeFields())) {
      return;
    }

    if (form.isTeaching && !isStep2Valid) {
      setAcademicTouched(true);
      setStep(2);
      shikshaMitraToast.warning({
        message:
          'Academic Permission could not be saved. Please wait for organization data to load and try again.',
      });
      return;
    }

    if (canManageStatutory && !statutoryProfileSchema.isValidSync(statutoryForm.values)) {
      await statutoryForm.validateForm();
      statutoryForm.setTouched({
        pfDisabledReason: true,
        esicDisabledReason: true,
        pfNumber: true,
        uanNumber: true,
        esicInsuranceNumber: true,
      });
      return;
    }
    if (!canManageStatutory || !salary || salary.effectiveMonth.slice(0, 7) !== salaryMonth) {
      setStep(3);
      shikshaMitraToast.warning({
        message: 'Preview a valid salary in the final step before finalizing.',
      });
      return;
    }
    if (finalizationPending.current) return;
    finalizationPending.current = true;
    setFinalizeSaving(true);
    try {
      const result = await finalizeApplication({
        id: application.id,
        body: {
          personalInfo: {
            firstName: form.firstName,
            middleName: form.middleName,
            lastName: form.lastName,
            dob: form.dob?.isValid() ? form.dob.format('YYYY-MM-DD') : null,
            gender: toNullableNumber(form.gender),
            religion:
              form.religion !== '' && form.religion !== null && form.religion !== undefined
                ? (ReligionType[Number(form.religion) as ReligionType] as any)
                : undefined,
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
          ...(form.isTeaching
            ? {
                academicYearId: currentYear!.id,
                academicScopes: academicPermissionScopeRows.scopeRows,
              }
            : {}),
          salary,
          statutoryProfile: statutoryForm.values,
          familyInfo: application.familyInfo || null,
          additionalInfo: application.additionalInfo || null,
          workExperiences: application.workExperiences || [],
          useSubmittedPhoto: form.useSubmittedPhoto,
          attachResumeAsDocument: form.attachResumeAsDocument,
        },
      }).unwrap();

      const employeeId = String(result.employee.id || result.application.finalizedEmployeeId || '');
      if (!employeeId) {
        throw new Error('The staff was created, but the staff id was not returned.');
      }
      if (!result.activationReadiness?.compensationRevisionId) {
        throw new Error(
          'Staff was created, but salary persistence could not be verified. Review the staff payroll before continuing.'
        );
      }

      shikshaMitraToast.success({ message: 'Staff and salary saved. Staff remains inactive.' });
      onFinalized({
        id: employeeId,
        name: String(result.employee.fullName || application.fullName || 'Employee'),
        activationReadiness: result.activationReadiness,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(error, 'Could not finalize onboarding'),
      });
    } finally {
      finalizationPending.current = false;
      setFinalizeSaving(false);
    }
  };

  const steps = ['Review', 'Staff fields', 'Academic Permission', 'Salary and confirm'];

  return (
    <CustomDialog
      open={open}
      handleClose={() => navigation.requestNavigation(onClose)}
      disableClose={finalizeSaving || isLoading || salaryEditor.busy}
      maxWidth="lg"
      data-testid="employee-onboarding-finalize-dialog"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{
        sx: {
          height: '85vh',
          '& #dialog-form': {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
          },
        },
      }}
      title={
        <Box display="flex" alignItems="center" gap={1}>
          Finalize onboarding
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="Review and complete the onboarding process for this application."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
    >
      {navigation.confirmation}
      <DialogContent
        sx={{
          overflow: 'visible',
          p: 0,
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomStepperWithFormik
          scrollbarHeight="auto"
          showSaveButton={false}
          formikInstance={formik}
          initialValues={initialValues}
          steps={steps}
          activeStep={step}
          handleBack={() => {
            if (finalizationPending.current || salaryEditor.busy) return;
            setAcademicTouched(false);
            formik.setTouched({});
            setStep((current) => current - 1);
          }}
          isStepClickable={isStepClickable}
          onStepClick={handleStepClick}
          validateForwardStepClick
          handleNext={handleStepperNext}
          validationSchema={Yup.object({})}
          finalButtonLabel="Finalize"
          saveAndNextButtonProps={{ loading: finalizeSaving || isLoading }}
          disableSubmit={!canSubmit}
          renderItem={({ activeStep: currentStep }) => (
            <Box sx={{ p: 2 }}>
              {currentStep === 0 && (
                <Grid container spacing={1} mb={1}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            }}
                          >
                            {(application.fullName || 'C')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </Avatar>
                          <Stack spacing={0.25}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={500}
                              textTransform="uppercase"
                              letterSpacing="0.05em"
                            >
                              Candidate
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {application.fullName || '-'}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Divider />

                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify
                              icon="lucide:mail"
                              width={16}
                              sx={{ color: 'text.secondary', flexShrink: 0 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ wordBreak: 'break-all' }}
                            >
                              {application.email || '-'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify
                              icon="lucide:phone"
                              width={16}
                              sx={{ color: 'text.secondary', flexShrink: 0 }}
                            />
                            <Typography variant="body2" color="text.primary">
                              {application.mobileNo || '-'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                        >
                          Application Details
                        </Typography>

                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            >
                              <Iconify
                                icon="lucide:briefcase"
                                width={16}
                                sx={{ color: 'text.secondary' }}
                              />
                            </Box>
                            <Stack spacing={0.25}>
                              <Typography variant="caption" color="text.secondary">
                                Position
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {application.positionAppliedFor || '-'}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            >
                              <Iconify
                                icon="lucide:building-2"
                                width={16}
                                sx={{ color: 'text.secondary' }}
                              />
                            </Box>
                            <Stack spacing={0.25}>
                              <Typography variant="caption" color="text.secondary">
                                Department
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {application.departmentAppliedFor || '-'}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.selected',
                                border: '1px solid',
                                borderColor: 'divider',
                                flexShrink: 0,
                              }}
                            >
                              <Iconify
                                icon="lucide:calendar"
                                width={16}
                                sx={{ color: 'text.secondary' }}
                              />
                            </Box>
                            <Stack spacing={0.25}>
                              <Typography variant="caption" color="text.secondary">
                                Submitted
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatDate(application.submittedAt)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon="lucide:history"
                            width={18}
                            sx={{ color: 'text.secondary' }}
                          />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Submitted Experience
                          </Typography>
                        </Stack>

                        {(application.workExperiences || []).length ? (
                          <Grid container spacing={1.5}>
                            {application.workExperiences?.map((experience, index) => (
                              <Grid
                                key={`${experience.mediumStageName || 'exp'}-${index}`}
                                size={{ xs: 12, sm: 6 }}
                              >
                                <Card
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: 'background.neutral',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Stack spacing={1}>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="flex-start"
                                      spacing={1}
                                    >
                                      <Typography variant="subtitle2" fontWeight={600}>
                                        {experience.mediumStageName || '-'}
                                      </Typography>
                                      {experience.designation && (
                                        <Chip
                                          label={experience.designation}
                                          size="small"
                                          variant="outlined"
                                          color="info"
                                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                                        />
                                      )}
                                    </Stack>

                                    <Stack spacing={0.5}>
                                      {experience.department && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="flex"
                                          alignItems="center"
                                          gap={1}
                                        >
                                          <Iconify icon="lucide:layers" width={12} />
                                          {experience.department}
                                        </Typography>
                                      )}
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Iconify icon="lucide:calendar" width={12} />
                                        {[
                                          formatDate(experience.startDate),
                                          formatDate(experience.endDate),
                                        ]
                                          .filter((val) => val !== '-')
                                          .join(' to ') || '-'}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                            sx={{
                              py: 3,
                              borderRadius: 1.5,
                              border: '1px dashed',
                              borderColor: 'divider',
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Iconify
                              icon="lucide:file-text"
                              width={28}
                              sx={{ color: 'text.disabled' }}
                            />
                            <Typography variant="body2" color="text.secondary" align="center">
                              No work experience was submitted in the application.
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {currentStep === 1 && (
                <Box>
                  {/* ── Basic Details ── */}
                  <SectionCard title="Basic Details">
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="First Name *"
                          {...formik.getFieldProps('firstName')}
                          value={form.firstName}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                            if (/^[A-Za-z ]*$/.test(newName))
                              formik.setFieldValue('firstName', newName);
                          }}
                          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                          helperText={formik.touched.firstName && formik.errors.firstName}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Middle Name"
                        {...formik.getFieldProps('middleName')}
                        value={form.middleName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                          if (/^[A-Za-z ]*$/.test(newName))
                            formik.setFieldValue('middleName', newName);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Last Name *"
                          {...formik.getFieldProps('lastName')}
                          value={form.lastName}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                            if (/^[A-Za-z ]*$/.test(newName))
                              formik.setFieldValue('lastName', newName);
                          }}
                          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                          helperText={formik.touched.lastName && formik.errors.lastName}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <DatePicker
                        label="Date of Birth"
                        value={form.dob}
                        onChange={(value) => formik.setFieldValue('dob', value)}
                        disableFuture
                        minDate={dayjs('1947-01-01')}
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: {
                            name: 'dob',
                            size: 'small',
                            fullWidth: true,
                            error: formik.touched.dob && Boolean(formik.errors.dob),
                            helperText: formik.touched.dob && formik.errors.dob,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.religion && Boolean(formik.errors.religion)}
                      >
                        <FormControl
                          fullWidth
                          size="small"
                          error={formik.touched.religion && Boolean(formik.errors.religion)}
                        >
                          <InputLabel id="fin-religion-label">Religion *</InputLabel>
                          <Select
                            labelId="fin-religion-label"
                            value={form.religion ?? ''}
                            onChange={(e) => formik.setFieldValue('religion', e.target.value)}
                            label="Religion *"
                          >
                            {ReligionTypeArray.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.religion && formik.errors.religion && (
                            <FormHelperText>{formik.errors.religion}</FormHelperText>
                          )}
                        </FormControl>
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <Autocomplete
                        options={EmployeeCastTypeArray.map((_, index) => ({
                          id: index,
                          label: EmployeeCastType[index],
                        }))}
                        getOptionLabel={(option) => option.label}
                        value={
                          EmployeeCastTypeArray.map((_, index) => ({
                            id: index,
                            label: EmployeeCastType[index],
                          })).find((item) => String(item.id) === form.casteType) || null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="casteType"
                            label="Category *"
                            size="small"
                            fullWidth
                            error={formik.touched.casteType && Boolean(formik.errors.casteType)}
                            helperText={formik.touched.casteType && formik.errors.casteType}
                          />
                        )}
                        onChange={(_e, value) => {
                          formik.setFieldValue('casteType', value ? String(value.id) : '');
                          formik.setFieldTouched('casteType', true, false);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.familyCaste && Boolean(formik.errors.familyCaste)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Family Caste *"
                          value={form.familyCaste}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^A-Za-z\s]/g, '') || '';
                            const newName = value
                              ? value.charAt(0).toUpperCase() + value.slice(1)
                              : '';
                            formik.setFieldValue('familyCaste', newName);
                          }}
                          error={formik.touched.familyCaste && Boolean(formik.errors.familyCaste)}
                          helperText={formik.touched.familyCaste && formik.errors.familyCaste}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="fin-marital-label">Marital Status</InputLabel>
                        <Select
                          labelId="fin-marital-label"
                          value={form.maritalStatus}
                          onChange={(e) => formik.setFieldValue('maritalStatus', e.target.value)}
                          label="Marital Status"
                        >
                          {MaritalStatusTypeArray.map((option) => (
                            <MenuItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="fin-blood-label">Blood Group</InputLabel>
                        <Select
                          labelId="fin-blood-label"
                          value={form.bloodGroup}
                          onChange={(e) => formik.setFieldValue('bloodGroup', e.target.value)}
                          label="Blood Group"
                        >
                          {HrBloodGroupArray.map((option) => (
                            <MenuItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl
                        fullWidth
                        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ minWidth: 70, color: 'text.secondary' }}
                        >
                          Gender *
                        </Typography>
                        <RadioGroup
                          row
                          name="gender"
                          value={form.gender}
                          onChange={(e) => formik.setFieldValue('gender', e.target.value)}
                          sx={{ alignItems: 'center' }}
                        >
                          <FormControlLabel
                            value="1"
                            control={<Radio size="small" />}
                            label="Male"
                            sx={{ mr: 2 }}
                          />
                          <FormControlLabel
                            value="2"
                            control={<Radio size="small" />}
                            label="Female"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </SectionCard>

                  {/* ── Contact Information ── */}
                  <SectionCard title="Contact Information">
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.email && Boolean(formik.errors.email)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Email *"
                          {...formik.getFieldProps('email')}
                          value={form.email}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 0.5 }}
                                >
                                  <Iconify
                                    icon="mdi-light:email"
                                    width={22}
                                    color="text.disabled"
                                  />
                                  <Divider
                                    orientation="vertical"
                                    flexItem
                                    sx={{ height: 20, my: 'auto' }}
                                  />
                                </Box>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                      >
                        <PhoneInput
                          name="mobileNo"
                          value={form.mobileNo || ''}
                          onChange={(value) => {
                            formik.setFieldValue('mobileNo', value);
                            formik.validateField('mobileNo');
                          }}
                          onBlur={formik.handleBlur}
                          label="Primary Contact No. *"
                          error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
                          helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <PhoneInput
                        name="secondaryMobileNo"
                        value={form.secondaryMobileNo || ''}
                        onChange={(value) => formik.setFieldValue('secondaryMobileNo', value)}
                        onBlur={formik.handleBlur}
                        label="Secondary Contact No."
                        error={
                          formik.touched.secondaryMobileNo &&
                          Boolean(formik.errors.secondaryMobileNo)
                        }
                        helperText={
                          formik.touched.secondaryMobileNo && formik.errors.secondaryMobileNo
                        }
                      />
                    </Grid>
                  </SectionCard>

                  {/* ── Identification Details ── */}
                  <SectionCard title="Identification Details">
                    <Grid size={{ xs: 12, md: 6.5 }}>
                      <Box sx={{ position: 'relative' }}>
                        <FormLabel
                          error={formik.touched.adharNo && Boolean(formik.errors.adharNo)}
                          sx={{
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5,
                            color:
                              formik.touched.adharNo && formik.errors.adharNo
                                ? 'error.main'
                                : 'text.secondary',
                          }}
                        >
                          Aadhaar No. *
                        </FormLabel>
                        <OTPInput
                          maxLength={12}
                          value={String(formik.values.adharNo || '')}
                          onChange={(val) => {
                            formik.setFieldValue('adharNo', val);
                            formik.setFieldTouched('adharNo', true, false);
                          }}
                          pattern={REGEXP_ONLY_DIGITS}
                          pasteTransformer={(s) => s.replace(/\D/g, '').slice(0, 12)}
                          containerClassName=""
                          render={({ slots }) => {
                            const hasErr = formik.touched.adharNo && Boolean(formik.errors.adharNo);
                            return (
                              <Box display="flex" gap={1} alignItems="center" flexWrap="nowrap">
                                {slots.map((slot, i) => (
                                  <React.Fragment key={i}>
                                    <Box
                                      sx={{
                                        width: 22,
                                        height: 28,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 400,
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                        border: '1px solid',
                                        borderColor: slot.isActive
                                          ? hasErr
                                            ? 'error.main'
                                            : 'primary.main'
                                          : hasErr
                                            ? 'error.main'
                                            : 'grey.400',
                                        borderRadius: '8px',
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        boxShadow: slot.isActive
                                          ? hasErr
                                            ? '0 0 0 2px #d32f2f33'
                                            : '0 0 0 2px #1976d233'
                                          : 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                        position: 'relative',
                                        userSelect: 'none',
                                      }}
                                    >
                                      {slot.char}
                                      {slot.hasFakeCaret && (
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            width: '1px',
                                            height: '55%',
                                            bgcolor: 'text.primary',
                                            animation: 'blink 1s step-end infinite',
                                            '@keyframes blink': {
                                              '0%, 100%': { opacity: 1 },
                                              '50%': { opacity: 0 },
                                            },
                                          }}
                                        />
                                      )}
                                    </Box>
                                    {i < 11 && (i + 1) % 4 === 0 && (
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 1,
                                          bgcolor: 'text.disabled',
                                          flexShrink: 0,
                                          alignSelf: 'center',
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </Box>
                            );
                          }}
                        />
                        {formik.touched.adharNo && formik.errors.adharNo && (
                          <FormHelperText error sx={{ mx: '12px', mt: '3px' }}>
                            {formik.errors.adharNo}
                          </FormHelperText>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 5.5 }}>
                      <Box sx={{ position: 'relative' }}>
                        <FormLabel
                          error={formik.touched.panNo && Boolean(formik.errors.panNo)}
                          sx={{
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5,
                            color:
                              formik.touched.panNo && formik.errors.panNo
                                ? 'error.main'
                                : 'text.secondary',
                          }}
                        >
                          PAN No. *
                        </FormLabel>
                        <OTPInput
                          maxLength={10}
                          value={String(formik.values.panNo ?? '').toUpperCase()}
                          onChange={(val) => {
                            formik.setFieldValue('panNo', val.toUpperCase());
                            formik.setFieldTouched('panNo', true, false);
                          }}
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          pasteTransformer={(s) =>
                            s
                              .replace(/[^A-Za-z0-9]/g, '')
                              .toUpperCase()
                              .slice(0, 10)
                          }
                          containerClassName=""
                          render={({ slots }) => {
                            const hasErr = formik.touched.panNo && Boolean(formik.errors.panNo);
                            return (
                              <Box display="flex" gap={1} alignItems="center" flexWrap="nowrap">
                                {slots.map((slot, i) => (
                                  <React.Fragment key={i}>
                                    <Box
                                      sx={{
                                        width: 22,
                                        height: 28,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 400,
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                        border: '1px solid',
                                        borderColor: slot.isActive
                                          ? hasErr
                                            ? 'error.main'
                                            : 'primary.main'
                                          : hasErr
                                            ? 'error.main'
                                            : 'grey.400',
                                        borderRadius: '8px',
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        boxShadow: slot.isActive
                                          ? hasErr
                                            ? '0 0 0 2px #d32f2f33'
                                            : '0 0 0 2px #1976d233'
                                          : 'none',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                        position: 'relative',
                                        userSelect: 'none',
                                      }}
                                    >
                                      {slot.char}
                                      {slot.hasFakeCaret && (
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            width: '1px',
                                            height: '55%',
                                            bgcolor: 'text.primary',
                                            animation: 'blink 1s step-end infinite',
                                            '@keyframes blink': {
                                              '0%, 100%': { opacity: 1 },
                                              '50%': { opacity: 0 },
                                            },
                                          }}
                                        />
                                      )}
                                    </Box>
                                    {i < 9 && (i + 1) % 5 === 0 && (
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 1,
                                          bgcolor: 'text.disabled',
                                          flexShrink: 0,
                                          alignSelf: 'center',
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </Box>
                            );
                          }}
                        />
                        {formik.touched.panNo && formik.errors.panNo && (
                          <FormHelperText error sx={{ mx: '14px', mt: '3px' }}>
                            {formik.errors.panNo}
                          </FormHelperText>
                        )}
                      </Box>
                    </Grid>
                  </SectionCard>

                  {/* ── Professional Details ── */}
                  <SectionCard title="Professional Details">
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <DatePicker
                        label="Date of Joining *"
                        value={formik.values.doj ? dayjs(formik.values.doj) : null}
                        onChange={(value) => {
                          formik.setFieldValue('doj', value ? value.format('YYYY-MM-DD') : '');
                          formik.setFieldTouched('doj', true, false);
                        }}
                        format="DD-MM-YYYY"
                        maxDate={dayjs().add(1, 'year')}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: formik.touched.doj && Boolean(formik.errors.doj),
                            helperText: formik.touched.doj ? formik.errors.doj : '',
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="fin-emp-group-label">Staff Group *</InputLabel>
                        <Select
                          labelId="fin-emp-group-label"
                          value={formik.values.isTeaching ? '0' : '1'}
                          onChange={(e) =>
                            formik.setFieldValue('isTeaching', e.target.value === '0')
                          }
                          label="Staff Group *"
                        >
                          {EmployeeGroupTypeArray.map((_, index) => (
                            <MenuItem key={index} value={String(index)}>
                              {EmployeeGroupType[index]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Department"
                        value={form.department}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                          if (/^[A-Za-z ]*$/.test(newName))
                            formik.setFieldValue('department', newName);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Designation"
                        value={form.designation}
                        onChange={(e) => formik.setFieldValue('designation', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Qualification"
                        value={form.qualification}
                        onChange={(e) => formik.setFieldValue('qualification', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Identification Mark"
                        value={form.identificationMark1}
                        onChange={(e) =>
                          formik.setFieldValue('identificationMark1', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.roleId && Boolean(formik.errors.roleId)}
                      >
                        <InputLabel id="fin-role-label">Role *</InputLabel>
                        <Select
                          labelId="fin-role-label"
                          value={form.roleId}
                          onChange={(e) => {
                            formik.setFieldValue('roleId', e.target.value);
                            formik.setFieldTouched('roleId', true, false);
                          }}
                          label="Role *"
                          disabled={rolesLoading}
                        >
                          {employeeRoleOptions.map((role: any) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.roleId && formik.errors.roleId && (
                          <FormHelperText>{formik.errors.roleId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                      >
                        <InputLabel id="fin-shift-label">Shift *</InputLabel>
                        <Select
                          labelId="fin-shift-label"
                          value={form.shiftId}
                          onChange={(e) => {
                            formik.setFieldValue('shiftId', e.target.value);
                            formik.setFieldTouched('shiftId', true, false);
                          }}
                          label="Shift *"
                          disabled={shiftsLoading}
                        >
                          {(shiftsData?.items || []).map((shift: any) => (
                            <MenuItem key={shift.id} value={shift.id}>
                              {shift.shiftName || shift.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.shiftId && formik.errors.shiftId && (
                          <FormHelperText>{formik.errors.shiftId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </SectionCard>

                  {/* ── Address Details ── */}
                  <SectionCard title="Address Details">
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.address1 && Boolean(formik.errors.address1)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Building No./Flat/House No. *"
                          {...formik.getFieldProps('address1')}
                          value={form.address1}
                          onBlur={(e) => {
                            formik.setFieldValue('address1', e.target.value.trim());
                            formik.handleBlur(e);
                          }}
                          error={formik.touched.address1 && Boolean(formik.errors.address1)}
                          helperText={formik.touched.address1 && formik.errors.address1}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <ShakingTextField
                        error={formik.touched.address2 && Boolean(formik.errors.address2)}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Area/Locality/Road Name *"
                          {...formik.getFieldProps('address2')}
                          value={form.address2}
                          onBlur={(e) => {
                            formik.setFieldValue('address2', e.target.value.trim());
                            formik.handleBlur(e);
                          }}
                          error={formik.touched.address2 && Boolean(formik.errors.address2)}
                          helperText={formik.touched.address2 && formik.errors.address2}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Landmark"
                        {...formik.getFieldProps('address3')}
                        value={form.address3}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <CountryComponent
                        value={{ name: form.countryName, isoCode: form.countryIsoCode }}
                        onChange={(_e: any, value: any) => {
                          formik.setFieldValue('stateName', '');
                          formik.setFieldValue('stateIsoCode', '');
                          formik.setFieldValue('city', '');
                          formik.setFieldValue('countryName', value?.name || '');
                          formik.setFieldValue('countryIsoCode', value?.isoCode || '');
                          formik.setFieldTouched('countryName', true, false);
                        }}
                        error={formik.touched.countryName && Boolean(formik.errors.countryName)}
                        helperText={formik.touched.countryName && formik.errors.countryName}
                        textFieldProps={{ label: 'Country *' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <StateComponent
                        value={{ name: form.stateName, isoCode: form.stateIsoCode }}
                        countryValue={{ name: form.countryName, isoCode: form.countryIsoCode }}
                        onChange={(_e: any, value: any) => {
                          formik.setFieldValue('city', '');
                          formik.setFieldValue('stateName', value?.name || '');
                          formik.setFieldValue('stateIsoCode', value?.isoCode || '');
                          formik.setFieldTouched('stateName', true, false);
                        }}
                        error={formik.touched.stateName && Boolean(formik.errors.stateName)}
                        helperText={formik.touched.stateName && formik.errors.stateName}
                        textFieldProps={{ label: 'State *' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <CityComponent
                        value={{ name: form.city }}
                        countryValue={{ name: form.countryName, isoCode: form.countryIsoCode }}
                        stateValue={{ name: form.stateName, isoCode: form.stateIsoCode }}
                        onChange={(_e: any, value: any) => {
                          formik.setFieldValue('city', value?.name || '');
                          formik.setFieldTouched('city', true, false);
                        }}
                        error={formik.touched.city && Boolean(formik.errors.city)}
                        helperText={formik.touched.city && formik.errors.city}
                        textFieldProps={{ label: 'City *' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="PIN Code"
                        {...formik.getFieldProps('pinCode')}
                        value={form.pinCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 6) formik.setFieldValue('pinCode', value);
                        }}
                        error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
                        helperText={formik.touched.pinCode && formik.errors.pinCode}
                        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                      />
                    </Grid>
                  </SectionCard>
                </Box>
              )}

              {currentStep === 2 && (
                <Box>
                  <SectionCard title="Academic Permission">
                    <Grid size={{ xs: 12 }}>
                      {!form.isTeaching ? (
                        <HrNotice severity="info">
                          Academic Permission is not required for non-teaching staff.
                        </HrNotice>
                      ) : !currentYear?.id ? (
                        <Alert severity="warning">
                          Academic year is not set. Please configure an academic year first.
                        </Alert>
                      ) : organizationsLoading ? (
                        <LinearProgress />
                      ) : organizationOptions.length === 0 ? (
                        <HrNotice severity="info">
                          No organizations found for the current academic year.
                        </HrNotice>
                      ) : (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Select the organizations this staff member should have access to:
                          </Typography>
                          {academicTouched && selectedStageIds?.length === 0 && (
                            <FormHelperText error sx={{ mb: 1, ml: 0 }}>
                              At least one organization must be selected.
                            </FormHelperText>
                          )}
                          {academicTouched &&
                            selectedStageIds.length > 0 &&
                            !academicPermissionScopeRows.isValid && (
                              <FormHelperText error sx={{ mb: 1, ml: 0 }}>
                                Selected organization data is still loading. Please wait and try
                                again.
                              </FormHelperText>
                            )}
                          <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5, mt: 1 }}>
                            <Grid container spacing={1}>
                              {organizationOptions.map((option) => {
                                const isChecked = selectedStageIds?.includes(option.id);
                                return (
                                  <Grid key={option.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 1.5,
                                        borderColor: isChecked ? 'primary.main' : 'divider',
                                        bgcolor: isChecked
                                          ? theme.vars.palette.primary.lightChannel
                                          : 'background.paper',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          bgcolor: theme.vars.palette.primary.lightChannel,
                                        },
                                      }}
                                      onClick={() => {
                                        const current = selectedStageIds;
                                        const next = isChecked
                                          ? current.filter((id) => id !== option.id)
                                          : [...current, option.id];
                                        updateField('academicPermissionStageIds', next.join(','));
                                      }}
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={isChecked}
                                            onChange={() => {
                                              const current = selectedStageIds;
                                              const next = isChecked
                                                ? current.filter((id) => id !== option.id)
                                                : [...current, option.id];
                                              updateField(
                                                'academicPermissionStageIds',
                                                next.join(',')
                                              );
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        }
                                        label={
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              fontWeight={isChecked ? 600 : 400}
                                            >
                                              {option.name || option.label}
                                            </Typography>
                                            {option.mediumName && (
                                              <Typography variant="caption" color="text.secondary">
                                                {option.mediumName}
                                                {option.boardName ? ` · ${option.boardName}` : ''}
                                              </Typography>
                                            )}
                                          </Box>
                                        }
                                        sx={{ m: 0, width: '100%' }}
                                      />
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </SectionCard>
                </Box>
              )}

              {currentStep === 3 && (
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Final review</Typography>
                  <Typography variant="body2">
                    Staff/user creation will happen now for {form.firstName} {form.lastName}.
                  </Typography>
                  <Stack>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.useSubmittedPhoto}
                          disabled={!application.hasPhoto}
                          onChange={(event) =>
                            updateField('useSubmittedPhoto', event.target.checked)
                          }
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
                      label="Attach submitted resume to staff documents"
                    />
                  </Stack>
                  <HrNotice severity="info">
                    Finalize saves the staff and salary together. The staff remains Inactive until
                    an authorized HR user activates them. Logging in does not activate staff.
                  </HrNotice>
                  {!canManageStatutory && (
                    <Alert severity="warning">
                      Salary management and statutory enrollment permissions are required to
                      finalize onboarding.
                    </Alert>
                  )}
                  {!canSubmit && (
                    <Typography variant="body2" color="error">
                      {form.isTeaching
                        ? 'Complete required staff fields, Academic Permission, and a valid salary preview before finalizing.'
                        : 'Complete required staff fields and a valid salary preview before finalizing.'}
                    </Typography>
                  )}
                </Stack>
              )}
              <Box
                component="fieldset"
                disabled={finalizeSaving || isLoading}
                sx={{
                  display: currentStep === 3 ? 'block' : 'none',
                  mt: 2,
                  border: 0,
                  p: 0,
                  minWidth: 0,
                }}
              >
                {canManageStatutory && (
                  <SalaryStructureBuilder
                    formik={formik}
                    dateOfJoining={form.doj}
                    initialMonth={salaryMonth}
                    onboarding={{ statutoryForm, onSalaryChange: setSalary }}
                    onEditorStateChange={setSalaryEditor}
                  />
                )}
              </Box>
            </Box>
          )}
        />
      </DialogContent>
    </CustomDialog>
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
  const [finalizedEmployee, setFinalizedEmployee] = useState<FinalizedEmployeeResult>();
  const [pendingDeletion, setPendingDeletion] = useState<{
    application: EmployeeApplication;
    onDeleted?: () => void;
  }>();
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
  const { currentData: finalizeDetailData } = useGetEmployeeApplicationQuery(
    finalizeApplicationId || '',
    {
      skip: !finalizeApplicationId,
    }
  );

  const applications = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const selectedApplication = resolveCurrentEmployeeApplication(
    applicationId,
    detailData,
    applications
  );
  const currentFinalizeApplication = resolveCurrentEmployeeApplication(
    finalizeApplicationId,
    finalizeDetailData
  );

  useEffect(() => {
    setFinalizeApplication(undefined);
  }, [applicationId]);

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

  const handleFinalized = useCallback((employee: FinalizedEmployeeResult) => {
    setFinalizeApplication(undefined);
    setFinalizedEmployee(employee);
  }, []);

  const finalizationResult = (
    <CustomDialog
      open={Boolean(finalizedEmployee)}
      handleClose={() => setFinalizedEmployee(undefined)}
      title="Staff created"
      maxWidth="sm"
      hasForm={false}
    >
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            <Typography variant="subtitle2">HR setup saved - staff inactive</Typography>
            <Typography variant="body2">
              {finalizedEmployee?.name || 'The staff'} and their salary have been saved. An
              authorized HR user must activate the staff separately. Logging in does not activate
              staff.
            </Typography>
            {finalizedEmployee?.activationReadiness?.canActivate === false && (
              <Typography variant="body2">
                Payroll activation checks still need attention. Review the staff profile before
                activation.
              </Typography>
            )}
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          href={
            finalizedEmployee
              ? `${hrPaths.employee.list}?employee=${finalizedEmployee.id}`
              : undefined
          }
        >
          View staff
        </Button>
      </DialogActions>
    </CustomDialog>
  );

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
          const canFinalize = canFinalizeEmployeeApplication(application.status);
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
          onDelete={requestDeleteApplication}
          regenerateLoading={regenerateLoading}
          deleteLoading={deleteLoading}
        />
        <FinalizeDialog
          open={Boolean(currentFinalizeApplication)}
          application={currentFinalizeApplication}
          onClose={() => setFinalizeApplication(undefined)}
          onFinalized={handleFinalized}
        />
        {finalizationResult}
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
        links={[
          { name: 'Staff Onboarding' },
        ]}
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
        <FinalizeDialog
          open={Boolean(currentFinalizeApplication)}
          application={currentFinalizeApplication}
          onClose={() => setFinalizeApplication(undefined)}
          onFinalized={handleFinalized}
        />
        {finalizationResult}
        {deleteConfirmation}
      </Stack>
    </Box>
  );
}
