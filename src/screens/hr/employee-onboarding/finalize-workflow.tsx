'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
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
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import PhoneInput from 'src/components/phone-input';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { HrBloodGroupArray } from 'src/enums/blood-group';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useState, useEffect } from 'react';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import ShakingTextField from 'src/components/shaking-text-field';
import { MaritalStatusTypeArray } from 'src/enums/marriatal-status';
import { ReligionType, ReligionTypeArray } from 'src/enums/religion';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { emptyStatutoryProfile } from 'src/redux/hr/statutory-profile-api';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import { schemaFieldErrors } from 'src/screens/hr/components/form-validation';
import CountryComponent from 'src/components/stardard-address/country-component';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';
import { EmployeeGroupType, EmployeeGroupTypeArray } from 'src/enums/employee-group';
import { OTPInput, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';
import WorkAssignmentField from 'src/screens/hr/employee-onboarding/work-assignment-field';
import { useFinalizeEmployeeApplicationMutation } from 'src/redux/hr/employeeOnboardingApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { shouldClearEmployeeRoleSelection } from 'src/screens/hr/employee/employee-role-options';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  Box,
  Card,
  Chip,
  Grid,
  Radio,
  Stack,
  Alert,
  Avatar,
  Button,
  Select,
  Divider,
  MenuItem,
  Checkbox,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  InputLabel,
  FormControl,
  Autocomplete,
  InputAdornment,
  FormHelperText,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { getOnboardingErrorMessage } from './error-message';
import { FinalizePageHeader } from './finalize-page-header';
import { AcademicPermissionCard } from './academic-permission-card';
import { finalizeIssues, type FinalizeIssue } from './finalize-readiness';
import { useFinalizeRoles, FinalizeRoleField } from './finalize-role-field';
import { statutoryProfileSchema } from '../employee/statutory-profile-fields';
import { SalaryStructureBuilder } from '../payroll/structure/SalaryStructureBuilder';
import { getLocalMonthKey } from '../payroll/structure/salary-structure-builder-utils';
import {
  finalizeEmployeeFieldsSchema,
  applyFinalizeEmployeeValidation,
} from './finalize-validation';
import {
  workAssignmentText,
  emptyWorkAssignment,
  workAssignmentRequest,
  type EmployeeWorkAssignment,
} from './work-assignment';
import {
  isOnboardingAcademicPermissionStepValid,
  buildOnboardingAcademicPermissionScopeRows,
} from './employeeOnboardingAcademicPermission';

import type { FinalizeFormState } from './finalize-validation';
import type { OnboardingSalaryIssue } from '../payroll/structure/SalaryStructureBuilder';

type FinalizedEmployeeResult = {
  id: string;
  name: string;
  activationReadiness?: EmployeeActivationReadiness;
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
    department: personalInfo?.department || '',
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

export function FinalizeWorkflow({
  application,
  returnHref,
  readReady,
  readError,
  onRetry,
  onFinalized,
}: {
  application: EmployeeApplication;
  returnHref: string;
  readReady: boolean;
  readError: boolean;
  onRetry: () => void;
  onFinalized: (employee: FinalizedEmployeeResult) => void;
}) {
  const open = true;
  const router = useRouter();
  const onClose = () => router.push(returnHref);
  const readyRef = useRef(readReady);
  readyRef.current = readReady;
  const alive = useRef(true);
  const completedRef = useRef(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [step, setStep] = useState(0);
  const [maxStepVisited, setMaxStepVisited] = useState(0);
  const [academicTouched, setAcademicTouched] = useState(false);
  const [reviewTouched, setReviewTouched] = useState(false);
  const [salaryIssues, setSalaryIssues] = useState<OnboardingSalaryIssue[]>([]);
  const [finalizeError, setFinalizeError] = useState('');
  const [previewInvalidation, setPreviewInvalidation] = useState(0);
  const [focusIssue, setFocusIssue] = useState<FinalizeIssue | null>(null);
  const workflowRoot = useRef<HTMLDivElement>(null);
  const [workAssignment, setWorkAssignment] = useState<EmployeeWorkAssignment>(emptyWorkAssignment);
  const [workAssignmentValid, setWorkAssignmentValid] = useState(false);
  const [workAssignmentConfirmed, setWorkAssignmentConfirmed] = useState(false);
  const [workAssignmentDirty, setWorkAssignmentDirty] = useState(false);
  const updateWorkAssignment = (value: EmployeeWorkAssignment) => {
    setWorkAssignment(value);
    setWorkAssignmentConfirmed(false);
    setWorkAssignmentDirty(true);
  };
  const [finalizeSaving, setFinalizeSaving] = useState(false);
  const [salary, setSalary] = useState<SaveEmployeeCompensation | null>(null);
  const [salaryEditor, setSalaryEditor] = useState({ dirty: false, busy: false });
  const finalizationPending = useRef(false);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsQuery(undefined);
  const {
    options: organizationOptions,
    byId: organizationOptionsById,
    isLoading: organizationsLoading,
  } = useAcademicOrganizationOptions(currentYear?.id);
  const [finalizeApplication, { isLoading }] = useFinalizeEmployeeApplicationMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageSalary = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.compensationRevisionActions.manage
  );
  const canManageEnrollment = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment
  );
  const canManageStatutory = canManageSalary && canManageEnrollment;
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
    !completed &&
      (formik.dirty || statutoryForm.dirty || salaryEditor.dirty || workAssignmentDirty),
    {
      push: router.push,
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
  const roleLookup = useFinalizeRoles(open, selectedEmployeeGroup, form.roleId);
  const { data: rolesData } = roleLookup.query;
  const updateField = (field: keyof FinalizeFormState, value: string | boolean | Dayjs | null) =>
    setFieldValue(field as string, value);

  useEffect(() => {
    if (
      !roleLookup.ready ||
      !rolesData?.items ||
      !shouldClearEmployeeRoleSelection(rolesData.items, form.roleId, selectedEmployeeGroup)
    ) {
      return;
    }

    setFieldValue('roleId', '');
  }, [form.roleId, rolesData?.items, roleLookup.ready, selectedEmployeeGroup, setFieldValue]);

  useEffect(() => {
    if (application && open) {
      completedRef.current = false;
      setCompleted(false);
      setStep(0);
      setMaxStepVisited(0);
      setAcademicTouched(false);
      setWorkAssignment(application.workAssignment || emptyWorkAssignment());
      setWorkAssignmentConfirmed(false);
      setWorkAssignmentDirty(false);
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

  useEffect(() => {
    if (salary && previewInvalidation > 0) setFinalizeError('');
  }, [salary, previewInvalidation]);

  useEffect(() => {
    if (!focusIssue || focusIssue.step !== step) return undefined;
    const frame = requestAnimationFrame(() => {
      const panel = workflowRoot.current?.querySelector<HTMLElement>(
        '[data-onboarding-active-step]'
      );
      panel?.focus();
      panel?.scrollIntoView?.({ block: 'start' });
      if (focusIssue.field) {
        const errors = { [focusIssue.field]: focusIssue.message };
        const targetForm = focusIssue.step === 1 ? formik : statutoryForm;
        targetForm.setFieldTouched(focusIssue.field, true, false);
        targetForm.setFieldError(focusIssue.field, focusIssue.message);
        const field = workflowRoot.current?.querySelector<HTMLElement>(
          `[name="${focusIssue.field}"]`
        );
        const accordion = field?.closest('.MuiAccordion-root');
        accordion?.querySelector<HTMLElement>('[aria-expanded="false"]')?.click();
        focusFirstFormikError(errors, workflowRoot.current ?? undefined);
      } else if (focusIssue.selector) {
        const target =
          workflowRoot.current?.querySelector<HTMLElement>(focusIssue.selector) ??
          (focusIssue.step === 3
            ? workflowRoot.current?.querySelector<HTMLElement>('[data-onboarding-salary]')
            : panel);
        target?.scrollIntoView?.({ block: 'center' });
        target?.focus();
      }
      setFocusIssue(null);
    });
    return () => cancelAnimationFrame(frame);
    // Only an explicit correction request changes focus, never background revalidation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusIssue, step]);

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
    if (roleLookup.selectionError) {
      // Query feedback is live on the field; do not persist a temporary failure
      // in Formik after a successful retry restores the selected role.
      if (roleLookup.ready) {
        errors.roleId = roleLookup.selectionError;
        formik.setErrors(errors);
      }
      setStep(1);
      focusFirstFormikError({ ...errors, roleId: roleLookup.selectionError });
      return false;
    }
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
    if (
      !readyRef.current ||
      completedRef.current ||
      finalizationPending.current ||
      salaryEditor.busy
    )
      return;
    if (step === 0 && (!workAssignmentValid || !workAssignmentConfirmed)) {
      setReviewTouched(true);
      setFocusIssue({
        key: 'assignment',
        step: 0,
        message: '',
        selector: '[data-work-assignment]',
      });
      return;
    }
    if (step === 1) {
      if (!(await validateEmployeeFields())) return;
    }
    if (step === 2 && !isStep2Valid) {
      setAcademicTouched(true);
      return;
    }
    if (!alive.current || !readyRef.current || completedRef.current) return;
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

  const isStepClickable = (index: number) =>
    readReady &&
    !completed &&
    !finalizeSaving &&
    !isLoading &&
    !salaryEditor.busy &&
    index <= maxStepVisited;
  const handleStepClick = async (index: number) => {
    if (
      completedRef.current ||
      !readyRef.current ||
      finalizationPending.current ||
      salaryEditor.busy
    )
      return;
    if (index > 0 && (!workAssignmentValid || !workAssignmentConfirmed)) {
      setStep(0);
      return;
    }
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

  const staffErrors = schemaFieldErrors(finalizeEmployeeFieldsSchema, form);
  const statutoryErrors = schemaFieldErrors(statutoryProfileSchema, statutoryForm.values);
  const academicError = isStep2Valid
    ? undefined
    : !currentYear?.id
      ? 'Select an academic year before assigning teaching access.'
      : organizationsLoading
        ? 'Wait for academic organizations to finish loading.'
        : academicPermissionScopeRows.unresolvedStageIds.length
          ? 'Some selected academic organizations are unavailable. Review and select available organizations.'
          : 'Select at least one academic organization for teaching access.';
  const issues = finalizeIssues({
    workAssignmentValid,
    workAssignmentConfirmed,
    staffErrors,
    roleError:
      roleLookup.selectionError ||
      (!roleLookup.ready
        ? 'Wait for roles to finish loading, or retry the role lookup.'
        : undefined),
    academicError,
    canManageSalary,
    canManageEnrollment,
    statutoryErrors,
    salaryIssues,
    hasSalary: Boolean(salary),
    salaryMonthCurrent: salary?.effectiveMonth.slice(0, 7) === salaryMonth,
  });
  const canSubmit =
    readReady &&
    !completed &&
    !finalizeSaving &&
    !isLoading &&
    !salaryEditor.busy &&
    issues.length === 0;
  const reviewIssue = (issue: FinalizeIssue) => {
    if (!readReady || completedRef.current || finalizationPending.current || salaryEditor.busy)
      return;
    setMaxStepVisited((current) => Math.max(current, issue.step));
    setStep(issue.step);
    setReviewTouched(true);
    setAcademicTouched(true);
    setFocusIssue(issue);
  };

  const handleFinalize = async () => {
    if (!workAssignmentValid || !workAssignmentConfirmed) {
      setStep(0);
      shikshaMitraToast.warning({
        message: 'Review and confirm the organization / work assignment.',
      });
      return;
    }
    if (
      completedRef.current ||
      !readyRef.current ||
      finalizationPending.current ||
      salaryEditor.busy
    )
      return;
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
    if (issues.length) {
      reviewIssue(issues[0]);
      return;
    }
    if (finalizationPending.current) return;
    finalizationPending.current = true;
    setFinalizeSaving(true);
    setFinalizeError('');
    try {
      if (!alive.current || !readyRef.current || completedRef.current) return;
      const result = await finalizeApplication({
        id: application.id,
        body: {
          workAssignment: workAssignmentRequest(workAssignment),
          workAssignmentConfirmed,
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

      completedRef.current = true;
      if (!alive.current) return;
      setCompleted(true);
      shikshaMitraToast.success({ message: 'Staff and salary saved. Staff remains inactive.' });
      onFinalized({
        id: employeeId,
        name: String(result.employee.fullName || application.fullName || 'Employee'),
        activationReadiness: result.activationReadiness,
      });
    } catch (error) {
      if (!alive.current) return;
      setFinalizeError(
        getOnboardingErrorMessage(
          error,
          'Could not finalize onboarding. Your entries are retained. Review the requirements and retry Finalize.'
        )
      );
      setFocusIssue({
        key: 'server-error',
        step: 3,
        message: '',
        selector: '[data-finalization-error]',
      });
      // Server policy version checks remain authoritative; a stale preview must be rebuilt.
      if (parseApiProblemDetail(error).errorCode === 'HR:Payroll:CompensationPreviewStale') {
        setSalary(null);
        setPreviewInvalidation((current) => current + 1);
      }
    } finally {
      finalizationPending.current = false;
      setFinalizeSaving(false);
    }
  };

  const steps = ['Review', 'Staff Fields', 'Academic Permission', 'Salary and Confirm'];
  const stepValid = [
    workAssignmentValid && workAssignmentConfirmed,
    !Object.keys(staffErrors).length && roleLookup.ready && !roleLookup.selectionError,
    isStep2Valid,
    canSubmit,
  ];

  return (
    <Box
      ref={workflowRoot}
      data-testid="employee-onboarding-finalize-page"
      aria-busy={!readReady || finalizeSaving || isLoading || salaryEditor.busy}
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <FinalizePageHeader
        applicationId={application.id}
        returnHref={returnHref}
        onBack={() => navigation.requestNavigation(onClose)}
        busy={finalizeSaving || isLoading || salaryEditor.busy}
      />
      {navigation.confirmation}
      {(finalizeSaving || isLoading || salaryEditor.busy) && (
        <Typography role="status" variant="body2">
          {salaryEditor.busy
            ? 'Preparing salary. Your entries are retained.'
            : 'Finalizing staff onboarding.'}
        </Typography>
      )}
      {!readReady &&
        (readError ? (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                type="button"
                disabled={finalizeSaving || isLoading || salaryEditor.busy}
                onClick={onRetry}
              >
                Retry application
              </Button>
            }
          >
            Application details could not be refreshed. Your entries are still here. Retry before
            finalizing.
          </Alert>
        ) : (
          <LinearProgress aria-label="Refreshing onboarding application" />
        ))}
      {completed && (
        <Alert severity="success">
          Staff and salary were saved. Returning to Staff Onboarding. Staff remain inactive.
        </Alert>
      )}
      <Box
        component="fieldset"
        disabled={!readReady || completed || finalizeSaving || isLoading || salaryEditor.busy}
        inert={!readReady || completed || finalizeSaving || isLoading || salaryEditor.busy}
        sx={{
          p: 0,
          m: 0,
          border: 0,
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomStepperWithFormik
          viewMode="vertical"
          completedSteps={stepValid.flatMap((valid, index) =>
            valid && index < maxStepVisited ? [index] : []
          )}
          errors={stepValid.map((valid, index) => !valid && index < maxStepVisited)}
          loadingLabel="Finalizing staff onboarding…"
          scrollbarHeight="auto"
          showSaveButton={false}
          nextButtonLabel="Next"
          onCancel={() => navigation.requestNavigation(onClose)}
          formikInstance={formik}
          initialValues={initialValues}
          steps={steps}
          activeStep={step}
          handleBack={() => {
            if (
              completedRef.current ||
              !readyRef.current ||
              finalizationPending.current ||
              salaryEditor.busy
            )
              return;
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
          saveAndNextButtonProps={{
            loading: finalizeSaving || isLoading,
            disabled: salaryEditor.busy,
            'aria-describedby': step === 3 ? 'onboarding-readiness' : undefined,
          }}
          disableSubmit={!canSubmit}
          backButtonProps={{
            disabled: finalizeSaving || isLoading || salaryEditor.busy || completed,
          }}
          renderItem={({ activeStep: currentStep }) => (
            <Box
              data-onboarding-active-step
              tabIndex={-1}
              aria-label={steps[currentStep]}
              sx={{
                p: { xs: 1.5, md: 2 },
                minWidth: 0,
                width: 1,
                maxWidth: 1200,
                mx: 'auto',
                overflowWrap: 'anywhere',
              }}
            >
              <Typography component="h2" variant="subtitle1" sx={{ mb: 2 }}>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </Typography>
              {currentStep === 0 && (
                <Grid container spacing={1} mb={1}>
                  <Grid size={{ xs: 12 }} data-work-assignment tabIndex={-1}>
                    <WorkAssignmentField
                      value={workAssignment}
                      currentYear={currentYear}
                      onChange={updateWorkAssignment}
                      onValidityChange={setWorkAssignmentValid}
                      disabled={finalizeSaving || isLoading}
                      legacyDepartment={application.departmentAppliedFor}
                      confirmation={{
                        checked: workAssignmentConfirmed,
                        onChange: (checked) => {
                          setWorkAssignmentConfirmed(checked);
                          setWorkAssignmentDirty(true);
                        },
                      }}
                    />
                    {reviewTouched && (!workAssignmentValid || !workAssignmentConfirmed) && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {!workAssignmentValid
                          ? 'Resolve the work assignment requirements above, then confirm the assignment.'
                          : 'Confirm the organization / work assignment before continuing.'}
                      </Alert>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
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
                        p: 2,
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
                                Organization / work assignment
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {workAssignmentText({ ...application, workAssignment })}
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
                        p: 2,
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
                          <Typography variant="body2" color="text.secondary">
                            No work experience was submitted in the application.
                          </Typography>
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
                            name="religion"
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
                          name="adharNo"
                          aria-label="Aadhaar number"
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
                          name="panNo"
                          aria-label="PAN number"
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
                        name="doj"
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
                      <FinalizeRoleField
                        lookup={roleLookup}
                        value={form.roleId}
                        error={formik.touched.roleId ? formik.errors.roleId : undefined}
                        disabled={finalizeSaving || isLoading}
                        onChange={(value) => {
                          formik.setFieldValue('roleId', value);
                          formik.setFieldTouched('roleId', true, false);
                        }}
                        onBlur={() => formik.setFieldTouched('roleId', true)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                      >
                        <InputLabel id="fin-shift-label">Shift *</InputLabel>
                        <Select
                          name="shiftId"
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
                        textFieldProps={{ name: 'countryName', label: 'Country *' }}
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
                        textFieldProps={{ name: 'stateName', label: 'State *' }}
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
                        textFieldProps={{ name: 'city', label: 'City *' }}
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
                                    <AcademicPermissionCard
                                      name={option.name || option.label}
                                      detail={[option.mediumName, option.boardName]
                                        .filter(Boolean)
                                        .join(' · ')}
                                      checked={isChecked}
                                      disabled={
                                        !readReady ||
                                        completed ||
                                        finalizeSaving ||
                                        isLoading ||
                                        salaryEditor.busy
                                      }
                                      onChange={(checked) => {
                                        const next = checked
                                          ? [...selectedStageIds, option.id]
                                          : selectedStageIds.filter((id) => id !== option.id);
                                        updateField('academicPermissionStageIds', next.join(','));
                                      }}
                                    />
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

              <Box
                data-onboarding-salary
                tabIndex={-1}
                component="fieldset"
                disabled={finalizeSaving || isLoading}
                inert={finalizeSaving || isLoading}
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
                    onboarding={{
                      statutoryForm,
                      onSalaryChange: setSalary,
                      onReadinessChange: setSalaryIssues,
                      invalidatePreviewKey: previewInvalidation,
                    }}
                    onEditorStateChange={setSalaryEditor}
                  />
                )}
              </Box>
              {currentStep === 3 && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" component="h3" fontWeight={600}>
                    Final Review
                  </Typography>
                  <Typography variant="body2">
                    Review these choices, then select Finalize to save {form.firstName}{' '}
                    {form.lastName} and their salary.
                  </Typography>
                  <Stack>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.useSubmittedPhoto}
                          disabled={finalizeSaving || isLoading || !application.hasPhoto}
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
                          disabled={finalizeSaving || isLoading || !application.hasResume}
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
                  {finalizeError && (
                    <Alert data-finalization-error tabIndex={-1} severity="error" role="alert">
                      {finalizeError} Your entries are retained. Review the requirements and retry
                      Finalize.
                    </Alert>
                  )}
                  <Box
                    id="onboarding-readiness"
                    role="region"
                    aria-label="Finalization requirements"
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}
                  >
                    <Typography component="h3" variant="subtitle2">
                      {issues.length ? 'Before You Finalize' : 'Ready to Finalize'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      role="status"
                      sx={{ mt: 0.5 }}
                    >
                      {!readReady
                        ? 'Refresh the application details before finalizing.'
                        : finalizeSaving || isLoading
                          ? 'Finalizing staff onboarding.'
                          : completed
                            ? 'Staff and salary were saved.'
                            : salaryEditor.busy
                              ? 'Wait for salary setup to finish.'
                              : issues.length
                                ? `${issues.length} requirement${issues.length === 1 ? '' : 's'} need attention. Select a requirement to review it.`
                                : 'All required details and the current salary preview are ready.'}
                    </Typography>
                    {issues.length > 0 && (
                      <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 1 }}>
                        {issues.map((issue) => (
                          <Box component="li" key={issue.key} sx={{ mb: 0.5 }}>
                            {issue.key.endsWith('permission') ? (
                              <Typography variant="body2">{issue.message}</Typography>
                            ) : (
                              <Button
                                type="button"
                                size="small"
                                color="inherit"
                                disabled={
                                  !readReady || finalizeSaving || isLoading || salaryEditor.busy
                                }
                                onClick={() => reviewIssue(issue)}
                                sx={{
                                  height: 'auto',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  whiteSpace: 'normal',
                                }}
                              >
                                Review: {issue.message}
                              </Button>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          )}
        />
      </Box>
    </Box>
  );
}
