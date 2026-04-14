import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { ReligionType } from 'src/enums/religion';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Grid, Slide, Button, TextField, Typography } from '@mui/material';
import {
  useGetBankDetailsQuery,
  useGetAccessControlQuery,
  useUpdateEmployeeMutation,
  useGetWorkExperienceQuery,
  useGetBasicInformationQuery,
  useAddAccessControlMutation,
  useUpdateBankDetailsMutation,
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
import { validations } from './employee-form-validation';

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

export const personalInformationInitialValues = (
  editData?: Partial<IPersonalInformationResponse>
) => ({
  // photo: '',
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
  religion: editData
    ? typeof editData.religion === 'number'
      ? editData.religion
      : (ReligionType[editData.religion as keyof typeof ReligionType] ?? '')
    : '',
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
    ? { name: editData.state.name, isoCode: editData.state.isoCode }
    : { name: '', isoCode: '' },

  city: editData?.city ? { name: editData.city } : { name: '' },

  pincode: editData?.pinCode ?? '',

  employeeId: editData?.id ?? '',

  shift: editData?.shiftId ?? '',
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

  // ================= COMPONENTS =================
  earningComponents: editData?.earningComponents ?? [],
  deductionComponents: editData?.deductionComponents ?? [],
});

export const assignReportingManagerInitialValues = (editData?: IReportingInformationResponse) => ({
  reportingManager: editData ? editData?.employeeId : '',
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

const EmployeeFrom = ({ editData, handleClose }: any) => {
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [activeStep, setActiveStep] = useState(0);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBasicInformationMutation,
    isThrowError: true,
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
  });
  const [updateAdditionalInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAdditionalInformationMutation,
    isThrowError: true,
  });
  const [updateExperienceInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExperienceInformationMutation,
    isThrowError: true,
  });
  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBankDetailsMutation,
    isThrowError: true,
  });

  const [updateEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeMutation,
    isThrowError: true,
  });

  const [updateReportingManager] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateReportingManagerByEmployeeIdMutation,
    isThrowError: true,
  });

  const [addAccessControl] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
  });

  const initialValues = useMemo(
    () => ({
      ...personalInformationInitialValues(editData),
      employeeId: editData?.id,
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
        formik.setFieldValue('employeeId', resp.id);
        return resp.id;
      }
      return values.employeeId;
    },
    [addEmployee]
  );

  const handleFamilyInformation = useCallback(
    async (values: any, formik: any) => {
      const res = await updateFamilyInfo({
        employeeId: values.employeeId,
        body: {
          id: values.employeeId,
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
    [updateFamilyInfo]
  );

  const handleAdditionalDetails = useCallback(
    async (values: any, formik: any) => {
      const res = await updateAdditionalInfo({
        employeeId: values.employeeId,
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
    [updateAdditionalInfo]
  );

  const handleWorkExperience = useCallback(
    async (values: any, formik: any) => {
      const res = await updateExperienceInfo({
        employeeId: values.employeeId,
        body: values.experiences.map((i: any) => ({
          id: i.id,
          mediumStageName: i.mediumStageName ?? '',
          designation: i.designation,
          department: i.department,
          country: {
            name: i.country?.name ?? '',
            isoCode: i.country?.isoCode ?? '',
          },
          state: {
            name: i.state?.name ?? '',
            isoCode: i.state?.isoCode ?? '',
          },
          city: i.city?.name ?? '',
          startDate: i.startDate ? dateConvertor(i.startDate.format(dateFormat)) : null,
          endDate: i.endDate ? dateConvertor(i.endDate.format(dateFormat)) : null,
        })),
      }).unwrap();
      return res;
    },
    [updateExperienceInfo]
  );
  const handleBankDetailsInformation = useCallback(
    async (values: any, formik: any) => {
      const res = updateBankDetails({
        employeeId: values.employeeId,
        body: {
          bankDetails: {
            bankName: values.bankName,
            branchName: values.branchName,
            accountHolderName: values.accountHolderName,
            accountNumber: values.accountNumber,
            ifscCode: values.ifscCode,
          },

          salaryDetails: {
            pfRuleId: values.pfRule,
            epfNumber: values.epfNumber,
            uanNumber: values.uanNumber,
            punchId: values.punchId,
            totalWorkingHourPerMonth: Number(values.totalWorkingHourPerMonth),
          },

          earningComponents: values.earningComponents.map((item: any) => ({
            componentId: item?.id || item?.componentId,
            name: item?.name || item?.earningComponentName || '',
            amount: Number(item?.amount ?? 0),
            isFixed:
              item?.earningType === 'FIXED' ||
              item?.deductionType === 'FIXED' ||
              (item?.earningType === undefined &&
                item?.deductionType === undefined &&
                !!item?.isFixed),
          })),
          deductionComponents: values.deductionComponents.map((item: any) => ({
            componentId: item?.id || item?.componentId,
            name: item?.name || item?.deductionComponentName || '',
            amount: Number(item?.amount ?? 0),
            isFixed:
              item?.deductionType === 'FIXED' ||
              item?.earningType === 'FIXED' ||
              (item?.deductionType === undefined &&
                item?.earningType === undefined &&
                !!item?.isFixed),
          })),
        },
      }).unwrap();
      return res;
    },
    [updateBankDetails]
  );

  const handelUpdateEmployee = useCallback(
    async (values: any, formik: any, id: any) => {
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
      };

      if (values.secondaryMobileNo) {
        body.secondaryMobileNo = toRawMobile(values.secondaryMobileNo);
      }
      if (values.addressLine3) {
        body.address3 = values.addressLine3;
      }

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
      const res = await updateReportingManager({
        id: values.employeeId,
        body: {
          reportingManagerId: values?.reportingManager,
        },
      }).unwrap();
      return res;
    },
    [updateReportingManager]
  );

  const handleAcademicPermission = useCallback(
    async (values: any, formik: any, id: any) => {
      const res = await addAccessControl({
        academicYearIds: [currentYear.id],
        userIds: [values.employeeId],
        educationBoardIds: values.academicPermissionSelectedData.boards,
        educationMediumIds: values.academicPermissionSelectedData.mediums,
        educationMediumStageIds: values.academicPermissionSelectedData.organizations,
        standardIds: values.academicPermissionSelectedData.standards,
        divisionIds: values.academicPermissionSelectedData.divisions,
      }).unwrap();
      return res;
    },
    [addAccessControl, currentYear.id]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      try {
        setIsLoading(true);
        if (editData && activeStep === 0) {
          await handelUpdateEmployee(values, formik, editData.id);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Employee details updated successfully' });
          }
        } else if (activeStep === 0) {
          if (values.employeeId) {
            await handelUpdateEmployee(values, formik, values.employeeId);
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Employee details updated successfully' });
            }
          } else {
            const createdId = await handleBasicInformation(values, formik);
            if (createdId) {
              formik.setFieldValue('employeeId', createdId);
            }
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Employee added successfully' });
            }
          }
        } else if (activeStep === 1) {
          await handleFamilyInformation(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Family information updated successfully' });
          }
        } else if (activeStep === 2) {
          await handleAdditionalDetails(values, formik);
          shikshaMitraToast.success({ message: 'Additional details updated successfully' });
        } else if (activeStep === 4) {
          await handleWorkExperience(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Work experience updated successfully' });
          }
        } else if (activeStep === 5) {
          await handleBankDetailsInformation(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Bank details updated successfully' });
          }
        } else if (activeStep === 6) {
          await handleReportingManager(values, formik, values.employeeId);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Reporting manager updated successfully' });
          }
        }
        if (isLastStep && !isSaveButton) {
          await handleAcademicPermission(values, formik, values.employeeId);
          shikshaMitraToast.success({
            message: `Employee ${editData ? 'updated' : 'added'}  successfully`,
          });
        }
        if (!isSaveButton && !isLastStep) {
          setActiveStep(activeStep + 1);
        }
      } catch (error) {
        console.error(error, '============================');
      }
      setIsLoading(false);
      if (isLastStep) {
        handleClose(null, true);
      }
    },
    [
      activeStep,
      editData,
      handleBasicInformation,
      handleClose,
      handelUpdateEmployee,
      handleFamilyInformation,
      handleAdditionalDetails,
      handleWorkExperience,
      handleBankDetailsInformation,
      handleReportingManager,
      handleAcademicPermission,
    ]
  );

  return (
    <>
      <CustomStepperWithFormik
        showSaveButton={isChanges}
        disableSubmit={!isChanges}
        key={editData?.id || 'new'}
        initialValues={initialValues}
        steps={steps}
        viewMode="vertical"
        activeStep={activeStep}
        handleBack={() => {
          setActiveStep(activeStep - 1);
        }}
        validationSchema={validations[activeStep]}
        onStepClick={(step) => {
          if (editData) {
            if (isChanges) {
              setPendingStep(step);
            } else {
              setActiveStep(step);
            }
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
        renderItem={({ activeStep: step, formik }: any) => (
          <>
            <SyncReduxDirty formik={formik} />
            <FormSlider step={step} formik={formik} editData={editData} />
          </>
        )}
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

const FormSlider = ({ step, formik, editData }: any) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Always keep a ref to the latest formik instance to avoid stale closures in effects
  const formikRef = React.useRef(formik);
  formikRef.current = formik;

  // Track which steps have been populated so background refetches don't re-overwrite user edits
  const initializedStepsRef = React.useRef<Record<number, boolean>>({});
  useEffect(() => {
    initializedStepsRef.current = {};
  }, [editData?.id]);

  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicInformationQuery,
    params: editData?.id,
    options: {
      skip: !(editData?.id && step === 0),
    },
  });

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

  const { data: accessControl, isLoading: accessControlLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: { userId: editData?.id, academicYearId: currentYear?.id },
    options: { skip: !(editData?.id && currentYear?.id && step === 7) },
  });
  useEffect(() => {
    if (initializedStepsRef.current[step]) return;
    if (!editData?.id) return;

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
    } else if (accessControl && step === 7) {
      if (accessControl?.accessibleHierarchy) {
        const data = {
          boards: [] as any,
          mediums: [] as any,
          organizations: [] as any,
          standards: [] as any,
          divisions: [] as any,
        };

        const keyMapping: any = {
          0: 'hasFullMediumAccess',
          1: 'hasFullMediumStageAccess',
          2: 'hasFullStandardAccess',
          3: 'hasFullDivisionAccess',
        };

        const idMapping: any = {
          0: 'boardId',
          1: 'mediumId',
          2: 'mediumStageId',
          3: 'standardId',
          4: 'divisionId',
        };

        const levelMapping: any = {
          0: 'mediums',
          1: 'mediumStages',
          2: 'standards',
          3: 'divisions',
        };

        const recursionFn = (academicData: any[], level = 0, isParentFullyAccessible = false) => {
          academicData?.forEach((element) => {
            const hasFullAccessHere = !!element?.[(keyMapping as any)?.[level]];
            const isAccessible = element.hasAccess || hasFullAccessHere || isParentFullyAccessible;

            if (isAccessible) {
              if (level === 0) data.boards.push(element?.[idMapping[level]] as any);
              if (level === 1) data.mediums.push(element?.[idMapping[level]]);
              if (level === 2) data.organizations.push(element?.[idMapping[level]]);
              if (level === 3) data.standards.push(element?.[idMapping[level]]);
              if (level === 4) data.divisions.push(element?.[idMapping[level]]);
            }

            if (element?.[levelMapping[level]]?.length) {
              recursionFn(
                element[levelMapping[level]],
                level + 1,
                isParentFullyAccessible || hasFullAccessHere
              );
            }
          });
        };

        recursionFn(accessControl?.accessibleHierarchy?.[0]?.boards, 0, false);

        const updatedFields = academicPermissionInitialValues(data);

        formikRef.current.resetForm({
          values: {
            ...formikRef.current.values,
            ...updatedFields,
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
    accessControl,
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
                    gap={2}
                    width="100%"
                    height="100%"
                  >
                    {basicDetailsLoading ||
                    familyDetailsLoading ||
                    additionalDetailsLoading ||
                    workExperienceLoading ||
                    bankDetailsLoading ||
                    reportingManagerDetailsLoading ||
                    accessControlLoading ? (
                      <StepSkeleton step={step} />
                    ) : (
                      <Grid container spacing={0} sx={{ height: '100%', width: '100%' }}>
                        {allFields[step].map((field) => (
                          <Grid
                            size={{
                              xs: [1, 2, 3, 4].includes(step) ? 12 : 4,
                              md: [1, 2, 3, 4].includes(step) ? 12 : 4,
                            }}
                            key={field.name}
                            {...field.gridProps}
                          >
                            {field.renderComp ? (
                              field.renderComp({
                                formik,
                                field,
                                isMainForm: true,
                              })
                            ) : field.type === 'date' ? (
                              <DatePicker
                                label={field.label}
                                name={field.name}
                                value={formik.values[field.name]}
                                format="DD-MM-YYYY"
                                onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
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
                                  value={formik.values[field.name]}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched[field.name] && Boolean(formik.errors[field.name])
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

const SyncReduxDirty = ({ formik }: { formik: any }) => {
  const dispatch = useDispatch();
  useEffect(() => {
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
  }, [dispatch, formik.dirty, formik.values, formik.initialValues]);

  return null;
};
