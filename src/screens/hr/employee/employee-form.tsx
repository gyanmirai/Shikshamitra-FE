import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { ReligionType, ReligionTypeArray } from 'src/enums/religion';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Grid, Slide, Button, TextField, Typography } from '@mui/material';
import { buildUserScopeBulkAssignPayload } from 'src/utils/userScopeBulkAssignPayload';
import {
  expandAccessibleHierarchy,
  compressExplicitAcademicSelection,
} from 'src/utils/academicHierarchyUtils';
import {
  useGetBankDetailsQuery,
  useGetAccessControlQuery,
  useUpdateEmployeeMutation,
  useGetWorkExperienceQuery,
  useGetBasicInformationQuery,
  useAddAccessControlMutation,
  useGetFamilyInformationQuery,
  useAddBasicInformationMutation,
  useGetAdditionalInformationQuery,
  useUpdateFamilyInformationMutation,
  useUpdateAdditionalInformationMutation,
  useUpdateExperienceInformationMutation,
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
} from 'src/redux/hr/employeeApi';

import { allFields } from './employee-form-fields';
import { StepSkeleton } from './employee-form-skeleton';
import { PayrollProfileWorkspace } from './payroll-profile-workspace';
import { buildWorkExperiencePayload } from './work-experience-payload';
import { applyEmployeeCreateResponseToFormValues } from './employee-form-state';
import { buildProfilePersonalInfoUpdatePayload } from './personal-info-update-payload';
import {
  PayrollEditDetails,
  type PayrollEditState,
  type PayrollEditHandle,
} from './payroll-edit-details';
import {
  validations,
  reportingManagerValidationSchema,
  getPersonalInformationValidationSchema,
} from './employee-form-validation';

import type { StatutoryProfileEditHandle } from './statutory-profile-editor';
import type {
  IPayrollInformation,
  IWorkExperienceResponse,
  IFamilyInformationResponse,
  IPersonalInformationResponse,
  IReportingInformationResponse,
  IAdditionalInformationResponse,
} from './types';

export const toRawMobile = (value: string | null | undefined) => {
  if (!value) return '';
  return value.replace(/\s/g, '').replace(/^\+91/, '');
};

const toProfilePhotoValue = (value?: string | null) => {
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('http')) return value;
  return convertBase64Format(value);
};

const toReligionValue = (value?: IPersonalInformationResponse['religion']) => {
  if (typeof value === 'number') return value;
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  const enumValue = ReligionType[normalized as keyof typeof ReligionType];
  if (typeof enumValue === 'number') return enumValue;
  const labelValue = ReligionTypeArray.find(
    (option) => option.label.toLowerCase() === normalized.toLowerCase()
  )?.value;
  if (typeof labelValue === 'number') return labelValue;
  return normalized.toLowerCase() === 'hindu' ? ReligionType.Hinduism : '';
};

export const personalInformationInitialValues = (
  editData?: Partial<IPersonalInformationResponse>
) => ({
  photo: toProfilePhotoValue(editData?.profilePicture || editData?.thumbnailPicture),
  lastName: editData ? editData.lastName : '',
  firstName: editData ? editData.firstName : '',
  middleName: editData ? editData.middleName : '',
  shortName: editData ? editData.shortName : '',
  // employeeStatusType: editData ? editData?.employeeStatusType : EmployeeStatusType.Active,
  // subject: editData ? editData.subject || [] : [],
  dob: editData ? dayjs(editData.dob, 'YYYY-MM-DD') : null,
  familyCast: editData ? editData.familyCaste : '',
  castType: editData ? editData.casteType : '',
  gender: editData?.gender ?? '',
  religion: editData ? toReligionValue(editData.religion) : '',
  maritalStatus: editData
    ? typeof editData.maritalStatus === 'number'
      ? editData.maritalStatus
      : ''
    : '',
  bloodGroup: editData
    ? typeof editData.bloodGroup === 'number'
      ? editData.bloodGroup
      : null
    : null,
  mobileNo: editData ? editData.mobileNo : '',
  secondaryMobileNo: editData ? editData?.secondaryMobileNo : null,
  email: editData ? editData.email : '',
  department: editData ? editData.department : '',
  // designation: editData ? editData.designation : '',
  dateOfJoining: editData ? dayjs(editData.doj, 'YYYY-MM-DD') : dayjs(),
  employeeGroup: editData ? (editData.isTeaching ? 0 : 1) : '',
  designation: editData ? (editData as any).designation || '' : '',
  // qualification: editData ? editData. : '',
  role: editData ? editData?.roleId : '',
  // identificationMark1: editData ? editData.identificationMark1 : '',
  addressLine1: editData ? editData.address1 : '',
  addressLine2: editData ? editData.address2 : '',
  addressLine3: editData ? editData.address3 : '',
  country: editData?.country?.name
    ? { name: editData.country.name, isoCode: editData.country.isoCode }
    : { name: 'India', isoCode: 'IN' },

  state: editData?.state?.name
    ? {
        name: editData.state.name,
        isoCode: editData.state.isoCode,
        countryCode: editData.country?.isoCode,
      }
    : { name: '', isoCode: '' },

  city: editData?.city ? { name: editData.city } : { name: '' },

  pincode: editData?.pinCode ?? '',

  employeeId: editData?.id ?? '',

  shift: editData?.shiftId ?? '',

  adharNo: editData?.adharNo ?? '',
  panNo: editData?.panNo ?? '',
  initialAdharNo: editData?.adharNo ?? '',
  initialPanNo: editData?.panNo ?? '',
});

export const familyInformationInitialValues = (editData?: IFamilyInformationResponse) => ({
  sameAsFatherAddressForMother: false,
  sameAsFatherAddressForSpouse: false,
  sameAsEmployeeAddressForFather: false,

  // ================= FATHER =================
  fatherName: editData?.fatherDetails?.name ?? '',
  fatherOccupation: editData?.fatherDetails?.occupation ?? '',
  fatherContactNo: editData?.fatherDetails?.mobileNo ?? null,
  fatherAddress1: editData?.fatherDetails?.address1 ?? '',
  fatherAddress2: editData?.fatherDetails?.address2 ?? '',
  fatherAddress3: editData?.fatherDetails?.address3 ?? '',

  fatherCountry: editData?.fatherDetails?.country
    ? {
        name: editData?.fatherDetails?.country.name,
        isoCode: editData?.fatherDetails?.country.isoCode,
      }
    : { name: 'India', isoCode: 'IN' },

  fatherState: editData?.fatherDetails?.state
    ? {
        name: editData?.fatherDetails?.state.name,
        isoCode: editData?.fatherDetails?.state.isoCode,
        countryCode: editData?.fatherDetails?.country?.isoCode,
      }
    : { name: '', isoCode: '' },

  fatherCity: editData?.fatherDetails?.city ? { name: editData.fatherDetails.city } : { name: '' },

  fatherPinCode: editData?.fatherDetails?.pincode ?? '',

  // ================= MOTHER =================
  motherName: editData?.motherDetails?.name ?? '',
  motherOccupation: editData?.motherDetails?.occupation ?? '',
  motherContactNo: editData?.motherDetails?.mobileNo ?? '',
  motherAddress1: editData?.motherDetails?.address1 ?? '',
  motherAddress2: editData?.motherDetails?.address2 ?? '',
  motherAddress3: editData?.motherDetails?.address3 ?? '',

  motherCountry: editData?.motherDetails?.country
    ? {
        name: editData?.motherDetails?.country.name,
        isoCode: editData?.motherDetails?.country.isoCode,
      }
    : { name: 'India', isoCode: 'IN' },

  motherState: editData?.motherDetails?.state
    ? {
        name: editData?.motherDetails?.state.name,
        isoCode: editData?.motherDetails?.state.isoCode,
        countryCode: editData?.motherDetails?.country?.isoCode,
      }
    : { name: '', isoCode: '' },

  motherCity: editData?.motherDetails?.city ? { name: editData.motherDetails.city } : { name: '' },

  motherPinCode: editData?.motherDetails?.pincode ?? '',

  // ================= SPOUSE =================
  spouseName: editData?.spouseDetails?.name ?? '',
  spouseOccupation: editData?.spouseDetails?.occupation ?? '',
  spouseContactNo: editData?.spouseDetails?.mobileNo ?? '',
  spouseAddress1: editData?.spouseDetails?.address1 ?? '',
  spouseAddress2: editData?.spouseDetails?.address2 ?? '',
  spouseAddress3: editData?.spouseDetails?.address3 ?? '',

  spouseCountry: editData?.spouseDetails?.country
    ? {
        name: editData?.spouseDetails?.country.name,
        isoCode: editData?.spouseDetails?.country.isoCode,
      }
    : { name: 'India', isoCode: 'IN' },

  spouseState: editData?.spouseDetails?.state
    ? {
        name: editData?.spouseDetails?.state.name,
        isoCode: editData?.spouseDetails?.state.isoCode,
        countryCode: editData?.spouseDetails?.country?.isoCode,
      }
    : { name: '', isoCode: '' },

  spouseCity: editData?.spouseDetails?.city ? { name: editData.spouseDetails.city } : { name: '' },

  spousePinCode: editData?.spouseDetails?.pincode ?? '',
});

export const additionalDetailsInitialValues = (editData?: IAdditionalInformationResponse) => ({
  // Text fields → always string
  bplCardNo: editData?.bplCardNo ?? '',
  // Boolean from BE → convert to string for select
  personWithDisability:
    editData?.personWithDisability != null ? (editData.personWithDisability ? 'Yes' : 'No') : 'No',

  secondLanguage: editData?.secondLanguage ?? '',

  // Checkboxes → keep boolean
  libraryMember: editData?.isLibraryMember ?? false,
  transportMember: editData?.isTransportMember ?? false,
});

export const documentsInitialValues = () => ({ documents: new FormData() });

export const workExperienceInitialValues = (editData?: IWorkExperienceResponse[]) => ({
  experiences: editData
    ? editData?.map((i: any) => ({
        ...i,
        mediumStageName: i.mediumStageName || i.organizationName || '',
        startDate: i?.startDate ? dayjs(i.startDate) : null,
        endDate: i?.endDate ? dayjs(i.endDate) : null,
        city: i?.city ? { name: i.city } : { name: '' },
      }))
    : [],
});

export const payrollInitialValues = (editData?: IPayrollInformation) => ({
  // ================= BANK =================
  bankName: editData?.bankDetails?.bankName ?? '',
  branchName: editData?.bankDetails?.branchName ?? '',
  accountHolderName: editData?.bankDetails?.accountHolderName ?? '',
  accountNumber: editData?.bankDetails?.accountNumber ?? '',
  ifscCode: editData?.bankDetails?.ifscCode ?? '',

  // ================= SALARY =================
  pfRule: editData?.salaryDetails?.pfRuleId != null ? String(editData.salaryDetails.pfRuleId) : '',

  epfNumber: editData?.salaryDetails?.epfNumber ?? '',
  uanNumber: editData?.salaryDetails?.uanNumber ?? '',

  punchId: editData?.salaryDetails?.punchId ?? '',

  totalWorkingHourPerMonth:
    editData?.salaryDetails?.totalWorkingHourPerMonth != null
      ? editData.salaryDetails.totalWorkingHourPerMonth
      : 0,
  quotedSalaryBasis: editData?.salaryDetails?.quotedSalaryBasis ?? '',
  quotedMonthlyAmount: editData?.salaryDetails?.quotedMonthlyAmount ?? null,
  sourceSalaryTemplateId: editData?.salaryDetails?.sourceSalaryTemplateId ?? null,
  sourceSalaryTemplateVersionId: editData?.salaryDetails?.sourceSalaryTemplateVersionId ?? null,
  sourceSalaryTemplateVersion: editData?.salaryDetails?.sourceSalaryTemplateVersion ?? null,
  salaryGeneratedAt: editData?.salaryDetails?.salaryGeneratedAt ?? null,
  wasModifiedAfterGeneration: editData?.salaryDetails?.wasModifiedAfterGeneration ?? false,

  // ================= COMPONENTS =================
  earningComponents: editData?.earningComponents ?? [],
  deductionComponents: editData?.deductionComponents ?? [],
  policyOverrideEnabled: false,
  policyOverrideWasEnabled: false,
  policyOverrideAssignmentId: '',
  policyOverridePayrollPolicyId: '',
  policyOverrideAttendancePolicyId: '',
  policyOverrideLeavePolicyId: '',
  policyOverrideEffectiveFrom: dayjs().format('YYYY-MM-DD'),
  policyOverrideAssignmentReason: '',
});

export const getEmployeeUserId = (values: any, editData?: any) =>
  values?.userId || editData?.userId || null;
const getSavedEmployeeId = (values: any, editData?: any) =>
  values?.employeeId || editData?.id || '';
const getResolvedEmployeeIdentity = (values: any, editData?: any) => ({
  employeeId: getSavedEmployeeId(values, editData),
  userId: getEmployeeUserId(values, editData),
});

export const assignReportingManagerInitialValues = (editData?: IReportingInformationResponse) => ({
  reportingManager: editData?.reportingManager?.id ?? '',
  reportingManagerName: editData?.reportingManager?.fullName ?? '',
});

export const academicPermissionInitialValues = (editData?: any) => ({
  academicPermission: editData || {
    boards: [],
    mediums: [],
    organizations: [],
    standards: [],
    divisions: [],
  },
  academicPermissionSelectedData: editData || {
    boards: [],
    mediums: [],
    organizations: [],
    standards: [],
    divisions: [],
  },
});

const steps = [
  'Personal Information',
  'Family Information',
  'Additional Details',
  'Documents',
  'Work Experience',
  'Payroll',
  'Assign Reporting Manager',
  'Academic Permission',
];

const EmployeeFrom = ({ editData, handleClose, onCreated, initialStep = 0, onBusyChange }: any) => {
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [activeStep, setActiveStep] = useState(editData && initialStep === 5 ? 5 : 0);
  const payrollEditRef = React.useRef<PayrollEditHandle>(null);
  const statutoryEditRef = React.useRef<StatutoryProfileEditHandle>(null);
  const [statutoryState, setStatutoryState] = useState({ dirty: false, busy: false });
  const [payrollSubmitting, setPayrollSubmitting] = useState(false);
  const [payrollState, setPayrollState] = useState<PayrollEditState>({
    dirty: false,
    busy: false,
    ready: false,
  });
  const inlinePayroll = Boolean(editData?.id && activeStep === 5);
  const payrollDirty = payrollState.dirty || statutoryState.dirty;
  const payrollBusy = payrollState.busy || statutoryState.busy;
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [pendingStep, setPendingStep] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [academicPermissionSubmitReady, setAcademicPermissionSubmitReady] = useState(false);
  const formikRef = React.useRef<any>(null);
  const resetCurrentStepRef = React.useRef<(() => void) | null>(null);

  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBasicInformationMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });
  // useQueryAndMutation({
  //   type: 'mutation',
  //   currentQueryAndMutation: useAddUserMutation,
  //   isThrowError: true,
  // });
  const [updateFamilyInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyInformationMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });
  const [updateAdditionalInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAdditionalInformationMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });
  const [updateExperienceInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExperienceInformationMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });
  const [updateEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });

  const [updateReportingManager] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateReportingManagerByEmployeeIdMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });

  const [addAccessControl] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
    popupConfig: { error: false },
  });
  const {
    data: academicPermissionBoardsData,
    currentData: currentAcademicPermissionBoardsData,
    isFetching: academicPermissionBoardsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
    options: { skip: activeStep !== 7 },
  });
  const activeAcademicPermissionBoardsData =
    currentAcademicPermissionBoardsData ??
    (!academicPermissionBoardsFetching ? academicPermissionBoardsData : undefined);
  const allBoardsForAcademicPermission = useMemo(
    () =>
      activeAcademicPermissionBoardsData?.items?.filter(
        (board: any) => board.academicYearId === currentYear?.id
      ),
    [activeAcademicPermissionBoardsData?.items, currentYear?.id]
  );

  const initialValues = useMemo(
    () => ({
      ...personalInformationInitialValues(editData),
      userId: editData?.userId ?? null,
      employeeId: editData?.id ?? '',
      ...familyInformationInitialValues(),
      ...additionalDetailsInitialValues(),
      ...documentsInitialValues(),
      ...workExperienceInitialValues(),
      ...payrollInitialValues(),
      ...assignReportingManagerInitialValues(),
      ...academicPermissionInitialValues(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editData?.id]
  );
  const employeeValidations = useMemo(
    () => [
      getPersonalInformationValidationSchema({
        requirePhoto: !(editData?.id || initialValues.employeeId),
        requireIdentity: !(editData?.id || initialValues.employeeId),
      }),
      ...validations.slice(1, 6),
      reportingManagerValidationSchema,
      validations[7],
    ],
    [editData?.id, initialValues.employeeId]
  );

  const handleBasicInformation = useCallback(
    async (values: any, formik: any) => {
      if (!values.employeeId) {
        const body: Record<string, any> = {
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName || '',
          shortName: values.shortName || '',
          dob: dateConvertor(values.dob.format(dateFormat)),
          familyCaste: values.familyCast,
          casteType: values.castType,
          gender: values.gender,
          religion: ReligionType[values.religion],
          maritalStatus: values.maritalStatus,
          bloodGroup: values.bloodGroup,
          mobileNo: toRawMobile(values.mobileNo),
          email: values.email,
          department: values.department,
          doj: dateConvertor(values.dateOfJoining.format(dateFormat)),
          isTeaching: values.employeeGroup === 0,
          roleId: values.role,
          address1: values.addressLine1,
          address2: values.addressLine2,
          country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
          state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
          city: values?.city?.name,
          pinCode: String(values.pincode),
          shiftId: values.shift,
          adharNo: values.adharNo || '',
          panNo: (values.panNo || '').toUpperCase(),
        };

        if (values.secondaryMobileNo) {
          body.secondaryMobileNo = toRawMobile(values.secondaryMobileNo);
        }
        if (values.addressLine3) {
          body.address3 = values.addressLine3;
        }
        const formData = new FormData();
        formData.append('Data', JSON.stringify(body));

        if (values.photoFile instanceof File) {
          formData.append('ProfilePicture', values.photoFile);
        }

        const resp = await addEmployee({ body: formData }).unwrap();
        const nextValues = applyEmployeeCreateResponseToFormValues(formik.values, resp);
        formik.setFieldValue('employeeId', nextValues.employeeId);
        formik.setFieldValue('userId', nextValues.userId);
        return getResolvedEmployeeIdentity(nextValues, editData);
      }
      return getResolvedEmployeeIdentity(values, editData);
    },
    [addEmployee, editData]
  );

  const handleFamilyInformation = useCallback(
    async (values: any, formik: any) => {
      const employeeId = getSavedEmployeeId(values, editData);
      if (!employeeId) {
        throw new Error('Staff must be saved before family information can be updated.');
      }

      const res = await updateFamilyInfo({
        employeeId,
        body: {
          id: employeeId,
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            mobileNo: toRawMobile(values.fatherContactNo) || null,
            address1: values.fatherAddress1,
            address2: values.fatherAddress2,
            address3: values.fatherAddress3,
            country: { name: values?.fatherCountry?.name, isoCode: values?.fatherCountry?.isoCode },
            state: { name: values?.fatherState?.name, isoCode: values?.fatherState?.isoCode },
            city: values?.fatherCity?.name,
            pincode: String(values.fatherPinCode),
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            mobileNo: toRawMobile(values.motherContactNo) || null,
            address1: values.motherAddress1,
            address2: values.motherAddress2,
            address3: values.motherAddress3,

            country: { name: values?.motherCountry?.name, isoCode: values?.motherCountry?.isoCode },
            state: { name: values?.motherState?.name, isoCode: values?.motherState?.isoCode },

            city: values?.motherCity?.name,
            pincode: String(values.motherPinCode),
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            mobileNo: toRawMobile(values.spouseContactNo) || null,
            address1: values.spouseAddress1,
            address2: values.spouseAddress2,
            address3: values.spouseAddress3,
            country: { name: values?.spouseCountry?.name, isoCode: values?.spouseCountry?.isoCode },
            state: { name: values?.spouseState?.name, isoCode: values?.spouseState?.isoCode },
            city: values?.spouseCity?.name,
            pincode: String(values.spousePinCode),
          },
        },
      }).unwrap();
      return res;
    },
    [editData, updateFamilyInfo]
  );

  const handleAdditionalDetails = useCallback(
    async (values: any, formik: any) => {
      const employeeId = getSavedEmployeeId(values, editData);
      if (!employeeId) {
        throw new Error('Staff must be saved before additional details can be updated.');
      }

      const res = await updateAdditionalInfo({
        employeeId,
        body: {
          bplCardNo: values.bplCardNo,
          personWithDisability: values.personWithDisability === 'Yes',
          secondLanguage: values.secondLanguage,
          isLibraryMember: values.libraryMember,
          isTransportMember: values.transportMember,
        },
      }).unwrap();
      return res;
    },
    [editData, updateAdditionalInfo]
  );

  const handleWorkExperience = useCallback(
    async (values: any, formik: any) => {
      const employeeId = getSavedEmployeeId(values, editData);
      if (!employeeId) {
        throw new Error('Staff must be saved before work experience can be updated.');
      }

      const res = await updateExperienceInfo({
        employeeId,
        body: values.experiences.map((i: any) =>
          buildWorkExperiencePayload(i, (date) => dateConvertor(date.format(dateFormat)))
        ),
      }).unwrap();
      return res;
    },
    [editData, updateExperienceInfo]
  );
  const handelUpdateEmployee = useCallback(
    async (values: any, formik: any, id: any) => {
      const body = buildProfilePersonalInfoUpdatePayload(values, {
        initialValues: formik.initialValues,
      });

      const res = await updateEmployee({
        id,
        body,
      }).unwrap();

      return res;
    },
    [updateEmployee]
  );

  const handleReportingManager = useCallback(
    async (values: any, formik: any, id: any) => {
      const employeeId = getSavedEmployeeId(values, editData);
      if (!employeeId) {
        throw new Error('Staff must be saved before reporting manager can be updated.');
      }

      const res = await updateReportingManager({
        id: employeeId,
        body: {
          reportingManagerId: values?.reportingManager,
        },
      }).unwrap();
      return res;
    },
    [editData, updateReportingManager]
  );

  const handleAcademicPermission = useCallback(
    async (values: any, formik: any, id: any) => {
      const userId = getEmployeeUserId(values, editData);
      const employeeId = getSavedEmployeeId(values, editData);
      if (!employeeId) {
        throw new Error('Staff must be saved before academic permissions can be updated.');
      }
      if (!userId) {
        shikshaMitraToast.info({
          message: 'Academic permission was skipped because this staff member has no linked user.',
        });
        return null;
      }
      if (!currentYear?.id) {
        throw new Error('Academic year is required to save academic permissions.');
      }
      if (!allBoardsForAcademicPermission?.length) {
        throw new Error('Academic hierarchy is required to save academic permissions.');
      }

      const normalizedSelection = compressExplicitAcademicSelection(
        values.academicPermission,
        allBoardsForAcademicPermission
      );
      formik.setFieldValue('academicPermissionSelectedData', normalizedSelection, false);

      const res = await addAccessControl({
        ...buildUserScopeBulkAssignPayload({
          academicYearId: currentYear.id,
          userIds: [userId],
          selection: values.academicPermission,
          allBoards: allBoardsForAcademicPermission,
        }),
        employeeId,
      }).unwrap();
      return res;
    },
    [addAccessControl, allBoardsForAcademicPermission, currentYear?.id, editData]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      if (editData?.id && activeStep === 5) {
        setPayrollSubmitting(true);
        setIsLoading(true);
        onBusyChange?.(true);
        try {
          if (
            (!statutoryEditRef.current || (await statutoryEditRef.current.save())) &&
            (await payrollEditRef.current?.save())
          ) {
            dispatch(setIsChanges(false));
            if (!isSaveButton) setActiveStep(6);
          }
        } finally {
          setPayrollSubmitting(false);
          setIsLoading(false);
          onBusyChange?.(false);
        }
        return;
      }
      let saveSucceeded = false;
      let resolvedEmployeeId = values.employeeId;
      let resolvedUserId = getEmployeeUserId(values, editData);

      try {
        setIsLoading(true);
        if (editData && activeStep === 0) {
          await handelUpdateEmployee(values, formik, editData.id);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Staff details updated successfully' });
          }
          saveSucceeded = true;
        } else if (activeStep === 0) {
          if (values.employeeId) {
            await handelUpdateEmployee(values, formik, values.employeeId);
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Staff details updated successfully' });
            }
          } else {
            const identity = await handleBasicInformation(values, formik);
            resolvedEmployeeId = identity.employeeId;
            resolvedUserId = identity.userId;
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Staff added successfully' });
            }
          }
          saveSucceeded = true;
        } else if (activeStep === 1) {
          await handleFamilyInformation(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Family information updated successfully' });
          }
          saveSucceeded = true;
        } else if (activeStep === 2) {
          await handleAdditionalDetails(values, formik);
          shikshaMitraToast.success({ message: 'Additional details updated successfully' });
          saveSucceeded = true;
        } else if (activeStep === 3) {
          saveSucceeded = true;
        } else if (activeStep === 4) {
          await handleWorkExperience(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Work experience updated successfully' });
          }
          saveSucceeded = true;
        } else if (activeStep === 5) {
          // Payroll profile drawers own validation, impact review, and persistence.
          saveSucceeded = true;
        } else if (activeStep === 6) {
          await handleReportingManager(values, formik, values.employeeId);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Reporting manager updated successfully' });
          }
          saveSucceeded = true;
        } else if (activeStep === 7) {
          await handleAcademicPermission(values, formik, values.employeeId);
          shikshaMitraToast.success(
            isSaveButton
              ? { message: 'Academic permissions updated successfully' }
              : { message: `Staff ${editData ? 'updated' : 'added'}  successfully` }
          );
          saveSucceeded = true;
        }

        if (saveSucceeded) {
          if (!editData) {
            setCompletedSteps((prev) =>
              prev.includes(activeStep) ? prev : [...prev, activeStep].sort((a, b) => a - b)
            );
          }
          // Sync formik's initialValues with the saved state so dirty becomes false,
          // and clear the initialized flag so fresh API data re-populates on next visit.
          formik.resetForm({
            values: {
              ...formik.values,
              employeeId: resolvedEmployeeId,
              userId: resolvedUserId || formik.values.userId,
            },
          });
          // Do not reset the initialized flag on the last step; the form is about to close
          // the form and clearing it would cause the useEffect to re-fire with cached
          // API data, producing a double-render / double-save appearance.
          if (!isLastStep || isSaveButton) {
            resetCurrentStepRef.current?.();
          }
        }

        if (!isSaveButton && !isLastStep) {
          setActiveStep(activeStep + 1);
        }
      } catch (error) {
        const parsedError = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message: parsedError.detail || 'Failed to save staff details',
        });
        setIsLoading(false);
        return;
      }
      if (isLastStep && saveSucceeded) {
        setIsSubmitted(true);
        if (!editData && resolvedEmployeeId && onCreated) {
          onCreated({
            id: resolvedEmployeeId,
            name: [values.firstName, values.middleName, values.lastName].filter(Boolean).join(' '),
          });
          return;
        }
        handleClose(null, true);
        return;
      }
      setIsLoading(false);
    },
    [
      activeStep,
      editData,
      handleBasicInformation,
      onBusyChange,
      dispatch,
      handleClose,
      onCreated,
      handelUpdateEmployee,
      handleFamilyInformation,
      handleAdditionalDetails,
      handleWorkExperience,
      handleReportingManager,
      handleAcademicPermission,
      resetCurrentStepRef,
    ]
  );

  const canNavigateToStep = useCallback(
    (step: number) => {
      if (editData) {
        return true;
      }
      return step === activeStep || completedSteps.includes(step);
    },
    [activeStep, completedSteps, editData]
  );
  const academicPermissionHierarchyReady =
    activeStep === 7 &&
    Boolean(
      currentYear?.id &&
      Array.isArray(allBoardsForAcademicPermission) &&
      allBoardsForAcademicPermission.length > 0 &&
      !academicPermissionBoardsFetching
    );
  useEffect(() => {
    if (inlinePayroll) onBusyChange?.(payrollBusy || payrollSubmitting);
  }, [inlinePayroll, payrollBusy, payrollSubmitting, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  const disableStepperSubmit =
    activeStep === 7
      ? !(academicPermissionSubmitReady && academicPermissionHierarchyReady)
      : !isChanges;

  return (
    <>
      <CustomStepperWithFormik
        showSaveButton={inlinePayroll ? payrollDirty : isChanges}
        saveAndNextButtonProps={
          inlinePayroll
            ? { disabled: !payrollState.ready, loading: payrollBusy || payrollSubmitting }
            : undefined
        }
        disableSubmit={disableStepperSubmit}
        key={editData?.id || 'new'}
        initialValues={initialValues}
        steps={steps}
        viewMode="vertical"
        activeStep={activeStep}
        completedSteps={!editData ? completedSteps : undefined}
        isStepClickable={canNavigateToStep}
        handleBack={() => {
          if (inlinePayroll && payrollDirty) setPendingStep(activeStep - 1);
          else setActiveStep(activeStep - 1);
        }}
        validationSchema={employeeValidations[activeStep]}
        onStepClick={(step) => {
          if (step === activeStep || !canNavigateToStep(step)) {
            return;
          }
          if (isChanges) {
            setPendingStep(step);
          } else {
            setActiveStep(step);
          }
        }}
        isDisabledLabel={!editData}
        validateOnChange
        handleNext={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading)}
        onSave={(
          isLastStep: boolean,
          value: any,
          formik: any,
          setIsLoading: (val: boolean) => void
        ) => handleSave(isLastStep, value, formik, setIsLoading, true)}
        renderItem={({ activeStep: step, formik }: any) => {
          formikRef.current = formik;
          return (
            <>
              <SyncReduxDirty
                formik={formik}
                dirtyOverride={inlinePayroll ? payrollDirty : undefined}
              />
              {inlinePayroll ? (
                <Box sx={{ p: { xs: 1, sm: 2 }, minWidth: 0 }}>
                  <PayrollProfileWorkspace
                    employeeId={editData.id}
                    employeeName={editData.fullName}
                    origin="staff-edit"
                    actionsDisabled={payrollState.busy}
                    statutoryEditorRef={statutoryEditRef}
                    onStatutoryStateChange={setStatutoryState}
                    detailsContent={(values, canEdit) => (
                      <PayrollEditDetails
                        ref={payrollEditRef}
                        key={editData.id}
                        employeeId={editData.id}
                        initialValues={values}
                        canEdit={canEdit}
                        onStateChange={setPayrollState}
                      />
                    )}
                  />
                </Box>
              ) : (
                !isSubmitted && (
                  <FormSlider
                    step={step}
                    formik={formik}
                    editData={editData}
                    resetCurrentStepRef={resetCurrentStepRef}
                    isSubmitted={isSubmitted}
                    onAcademicPermissionReadyChange={setAcademicPermissionSubmitReady}
                  />
                )
              )}
            </>
          );
        }}
      />

      <ConfirmDialog
        open={pendingStep !== null}
        onClose={() => setPendingStep(null)}
        icon="warning"
        title="Alert"
        content={
          <Typography variant="body2">
            You have unsaved changes on this step. If you navigate away, your changes will be lost.
            Are you sure you want to continue?
          </Typography>
        }
        action={
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            sx={{
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
            }}
            size="small"
            onClick={() => {
              if (pendingStep !== null) {
                resetCurrentStepRef.current?.();
                formikRef.current?.resetForm();
                dispatch(setIsChanges(false));
                setActiveStep(pendingStep);
                setPendingStep(null);
              }
            }}
          >
            Yes
          </Button>
        }
      />
    </>
  );
};

export default EmployeeFrom;

const FormSlider = ({
  step,
  formik,
  editData,
  resetCurrentStepRef,
  isSubmitted,
  onAcademicPermissionReadyChange,
}: any) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const initialAccessControlUserId = getEmployeeUserId(formik.values, editData);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Always keep a ref to the latest formik instance to avoid stale closures in effects
  const formikRef = React.useRef(formik);
  formikRef.current = formik;

  // Track which steps have been populated so background refetches don't re-overwrite user edits
  const initializedStepsRef = React.useRef<Record<number, boolean>>({});

  // Expose a reset function so the parent can clear the initialized flag for the current step
  React.useEffect(() => {
    if (resetCurrentStepRef) {
      resetCurrentStepRef.current = () => {
        initializedStepsRef.current[step] = false;
      };
    }
  }, [step, resetCurrentStepRef]);
  useEffect(() => {
    initializedStepsRef.current = {};
  }, [editData?.id]);
  useEffect(() => {
    initializedStepsRef.current[7] = false;
  }, [currentYear?.id]);

  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && (step === 0 || (step === 7 && !initialAccessControlUserId))),
    },
  });
  const accessControlUserId = initialAccessControlUserId || basicDetails?.userId || null;

  const { data: familyDetails, isLoading: familyDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFamilyInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && step === 1),
    },
  });
  const { data: additionalDetails, isLoading: additionalDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdditionalInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && step === 2),
    },
  });
  const { data: workExperience, isLoading: workExperienceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWorkExperienceQuery,
    params: { id: editData?.id, page: 1, pageSize: 100 },
    options: {
      skip: !(editData?.id && step === 4),
    },
  });
  const { data: bankDetails, isLoading: bankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankDetailsQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && step === 5),
    },
  });

  const { data: reportingManagerDetails, isLoading: reportingManagerDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetReportingManagerByEmployeeIdQuery,
      params: editData?.id,
      options: {
        skip: !(editData?.id && step === 6),
      },
    });

  const {
    data: accessControl,
    currentData: currentAccessControl,
    isLoading: accessControlLoading,
    isFetching: accessControlFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: {
      userId: accessControlUserId,
      academicYearId: currentYear?.id,
      employeeId: getSavedEmployeeId(formik.values, editData),
    },
    options: { skip: !(accessControlUserId && currentYear?.id && step === 7) },
  });
  const activeAccessControl =
    currentAccessControl ?? (!accessControlFetching ? accessControl : undefined);

  // Full boards tree for the current academic year, needed to expand the
  // BE access-control response when it compresses branches via `hasFull*Access`.
  const {
    data: boardsData,
    currentData: currentBoardsData,
    isLoading: boardsLoading,
    isFetching: boardsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
    options: { skip: step !== 7 },
  });
  const activeBoardsData = currentBoardsData ?? (!boardsFetching ? boardsData : undefined);
  const allBoardsForYear = useMemo(
    () => activeBoardsData?.items?.filter((b: any) => b.academicYearId === currentYear?.id),
    [activeBoardsData?.items, currentYear?.id]
  );
  const isAcademicPermissionInitialLoading =
    step === 7 &&
    ((Boolean(accessControlUserId && currentYear?.id) &&
      !activeAccessControl &&
      (accessControlLoading || accessControlFetching)) ||
      (!activeBoardsData && (boardsLoading || boardsFetching)));
  const isAcademicPermissionSubmitReady =
    step === 7 &&
    Boolean(
      accessControlUserId &&
      currentYear?.id &&
      Array.isArray(allBoardsForYear) &&
      allBoardsForYear.length > 0 &&
      !isAcademicPermissionInitialLoading
    );
  useEffect(() => {
    onAcademicPermissionReadyChange?.(isAcademicPermissionSubmitReady);
    return () => {
      if (step === 7) {
        onAcademicPermissionReadyChange?.(false);
      }
    };
  }, [isAcademicPermissionSubmitReady, onAcademicPermissionReadyChange, step]);
  useEffect(() => {
    if (initializedStepsRef.current[step]) return;
    if (!editData?.id) return;
    if (basicDetails?.userId && step === 7 && !formikRef.current.values.userId) {
      formikRef.current.setFieldValue('userId', basicDetails.userId, false);
    }

    if (basicDetails && step === 0) {
      const updatedFields = personalInformationInitialValues(basicDetails);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (familyDetails && step === 1) {
      const updatedFields = familyInformationInitialValues(familyDetails);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (additionalDetails && step === 2) {
      const updatedFields = additionalDetailsInitialValues(additionalDetails);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (workExperience && step === 4) {
      const updatedFields = workExperienceInitialValues(workExperience);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (bankDetails && step === 5) {
      const updatedFields = payrollInitialValues(bankDetails);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (reportingManagerDetails && step === 6) {
      const updatedFields = assignReportingManagerInitialValues(reportingManagerDetails);
      formikRef.current.resetForm({
        values: {
          ...formikRef.current.values,
          ...updatedFields,
        },
      });
      initializedStepsRef.current[step] = true;
    } else if (activeAccessControl && step === 7 && allBoardsForYear) {
      // Need full boards tree to expand BE-compressed `hasFull*Access` branches.
      if (activeAccessControl?.accessibleHierarchy) {
        const data = expandAccessibleHierarchy(activeAccessControl, allBoardsForYear);
        const updatedFields = academicPermissionInitialValues(
          compressExplicitAcademicSelection(data, allBoardsForYear)
        );

        formikRef.current.resetForm({
          values: {
            ...formikRef.current.values,
            ...updatedFields,
            academicPermission: data,
          },
        });
        initializedStepsRef.current[step] = true;
      }
    }
  }, [
    editData?.id,
    basicDetails,
    familyDetails,
    additionalDetails,
    workExperience,
    bankDetails,
    reportingManagerDetails,
    activeAccessControl,
    allBoardsForYear,
    currentYear?.id,
    step,
  ]);
  return (
    <Box ref={containerRef} sx={{ overflowX: 'hidden', height: '100%' }}>
      {steps.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction="left"
              key={index}
            >
              <Box display="flex" height="100%">
                <Scrollbar>
                  {/* {step === 0 && (
                  <Box display="flex">
                    <UploadAvatar
                      maxSize={3145728}
                      onDrop={async (acceptedFiles: File[]) => {
                        const value = acceptedFiles[0];
                        const base64 = await fileToBase64(value);
                        formik.setFieldValue('photo', base64);
                      }}
                      value={formik.values.photo}
                      error={formik.touched.photo && Boolean(formik.errors.photo)}
                      sx={{ m: 'initial' }}
                    />
                  </Box>
                )} */}
                  <Box
                    p={2}
                    display={step === 2 || step === 1 || step === 3 ? 'block' : 'flex'}
                    flexWrap="wrap"
                    gap={1}
                    width="100%"
                    height="100%"
                  >
                    {basicDetailsLoading ||
                    familyDetailsLoading ||
                    additionalDetailsLoading ||
                    workExperienceLoading ||
                    bankDetailsLoading ||
                    reportingManagerDetailsLoading ||
                    isAcademicPermissionInitialLoading ? (
                      <StepSkeleton step={step} />
                    ) : (
                      <>
                        {step === 7 && !accessControlUserId && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">
                              Academic permissions can be assigned after this staff member is linked
                              to a user account.
                            </Typography>
                          </Grid>
                        )}
                        <Grid container spacing={0} sx={{ height: '100%', width: '100%' }}>
                          {allFields[step].map((field) => (
                            <Grid
                              size={{
                                xs: [1, 2, 3, 4].includes(step) ? 12 : 4,
                                md: [1, 2, 3, 4].includes(step) ? 12 : 4,
                              }}
                              key={step === 7 ? `${field.name}:${currentYear?.id}` : field.name}
                              {...field.gridProps}
                            >
                              {field.renderComp ? (
                                field.renderComp({
                                  formik,
                                  field,
                                  isMainForm: true,
                                  editData,
                                  allBoards: step === 7 ? allBoardsForYear : undefined,
                                  isLoading:
                                    step === 7 && (accessControlFetching || boardsFetching),
                                })
                              ) : field.type === 'date' ? (
                                <DatePicker
                                  label={field.label}
                                  name={field.name}
                                  value={formik.values[field.name] ?? null}
                                  format="DD-MM-YYYY"
                                  onChange={(newValue) =>
                                    formik.setFieldValue(field.name, newValue)
                                  }
                                  // sx={{ ...(field?.sx || {}) }}
                                  sx={{
                                    ...((field?.sx as any) || {}),
                                  }}
                                  slotProps={{
                                    textField: {
                                      placeholder: field.placeholder,
                                      fullWidth: true,
                                      size: 'small',
                                      helperText:
                                        formik.touched[field.name] && formik.errors[field.name],
                                      error:
                                        formik.touched[field.name] &&
                                        Boolean(formik.errors[field.name]),
                                    },
                                  }}
                                />
                              ) : (
                                <ShakingTextField
                                  error={
                                    formik.touched[field.name] && Boolean(formik.errors[field.name])
                                  }
                                >
                                  <TextField
                                    key={field.name}
                                    type={field.type}
                                    size="small"
                                    label={field.label}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={formik.values[field.name] ?? ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                      formik.touched[field.name] &&
                                      Boolean(formik.errors[field.name])
                                    }
                                    helperText={
                                      formik.touched[field.name] && formik.errors[field.name]
                                    }
                                    fullWidth
                                    sx={{ ...(field?.sx || {}) }}
                                    {...((typeof field?.otherProps === 'function'
                                      ? field?.otherProps({ formik })
                                      : field?.otherProps) || {})}
                                  />
                                </ShakingTextField>
                              )}
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </Box>
                </Scrollbar>
              </Box>
            </Slide>
          )
      )}
    </Box>
  );
};

const SyncReduxDirty = ({ formik, dirtyOverride }: { formik: any; dirtyOverride?: boolean }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (dirtyOverride !== undefined) {
      dispatch(setIsChanges(dirtyOverride));
      return;
    }
    let isReallyDirty = false;

    if (formik.dirty) {
      isReallyDirty = Object.keys(formik.values).some((key) => {
        const val1 = formik.values[key];
        const val2 = formik.initialValues[key];

        if (val1 === val2) return false;

        if (val1 instanceof FormData || val2 instanceof FormData) return false;

        if (dayjs.isDayjs(val1) || dayjs.isDayjs(val2)) {
          if (dayjs.isDayjs(val1) && dayjs.isDayjs(val2)) {
            return val1.format('YYYY-MM-DD') !== val2.format('YYYY-MM-DD');
          }
          return val1 !== val2;
        }

        if (key === 'mobileNo' || key === 'secondaryMobileNo') {
          const clean1 = (val1 || '').replace(/[^0-9]/g, '');
          const clean2 = (val2 || '').replace(/[^0-9]/g, '');

          if (clean1 !== clean2) {
            if (!clean2 && clean1.length <= 2) return false; // Default country code
            return true;
          }
          return false;
        }

        if (Array.isArray(val1) && Array.isArray(val2)) {
          return JSON.stringify(val1) !== JSON.stringify(val2);
        }

        if (val1 && val2 && typeof val1 === 'object' && typeof val2 === 'object') {
          return JSON.stringify(val1) !== JSON.stringify(val2);
        }
        return val1 !== val2;
      });
    }
    dispatch(setIsChanges(isReallyDirty));
  }, [dispatch, dirtyOverride, formik.dirty, formik.values, formik.initialValues]);

  return null;
};
