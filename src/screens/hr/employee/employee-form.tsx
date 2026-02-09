import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { DatePicker } from '@mui/x-date-pickers';
import { ReligionType } from 'src/enums/religion';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Slide, TextField } from '@mui/material';
import { useAddUserMutation } from 'src/redux/user/userApi';
import { LoadingScreen } from 'src/components/loading-screen';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
} from 'src/redux/employee/employeeApi';

import { allFields } from './employee-form-fields';
import { validations } from './employee-form-validation';

import type {
  IPayrollInformation,
  IWorkExperienceResponse,
  IFamilyInformationResponse,
  IPersonalInformationResponse,
  IReportingInformationResponse,
  IAdditionalInformationResponse,
} from './types';

export const personalInformationInitialValues = (
  editData?: Partial<IPersonalInformationResponse>
) => ({
  // photo: editData
  //   ? editData.profilePicture
  //     ? convertBase64Format(editData.profilePicture)
  //     : ''
  //   : '',
  photo: '',
  // code: editData ? editData.code : '',
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
  religion: editData ? ReligionType[editData.religion as keyof typeof ReligionType] : '',
  maritalStatus: editData ? editData.maritalStatus : '',
  bloodGroup: editData ? editData.bloodGroup : '',
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
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: 'India', isoCode: 'IN' },
  state: editData?.state?.name
    ? { name: editData?.state?.name, isoCode: editData?.state?.isoCode }
    : { name: '', isoCode: '' },
  city: editData?.city ? { name: editData?.city } : { name: '' },
  pincode: editData ? editData?.pinCode : '',
  employeeId: editData ? editData.id : '',
  // organization: editData ? editData?.educationMediumStageId : '',
  shift: editData ? editData?.shiftId : '',
});

export const familyInformationInitialValues = (editData?: IFamilyInformationResponse) => ({
  sameAsFatherAddressForMother: false,
  sameAsFatherAddressForSpouse: false,
  sameAsEmployeeAddressForFather: false,
  fatherName: editData ? editData?.fatherDetails?.name : '',
  fatherOccupation: editData ? editData?.fatherDetails?.occupation : '',
  fatherContactNo: editData ? editData?.fatherDetails?.mobileNo : '',
  fatherAddress1: editData ? editData?.fatherDetails?.address1 : '',
  fatherAddress2: editData ? editData?.fatherDetails?.address2 : '',
  fatherAddress3: editData ? editData?.fatherDetails?.address3 : '',

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
  fatherCity: editData ? { name: editData?.fatherDetails?.city } : { name: '' },

  fatherPinCode: editData ? editData?.fatherDetails?.pincode : '',
  motherName: editData ? editData?.motherDetails?.name : '',
  motherOccupation: editData ? editData?.motherDetails?.occupation : '',
  motherContactNo: editData ? editData?.motherDetails?.mobileNo : '',
  motherAddress1: editData ? editData?.motherDetails?.address1 : '',
  motherAddress2: editData ? editData?.motherDetails?.address2 : '',
  motherAddress3: editData ? editData?.motherDetails?.address3 : '',

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
  motherCity: editData?.motherDetails?.city
    ? { name: editData?.motherDetails?.city }
    : { name: '' },

  motherPinCode: editData ? editData?.motherDetails?.pincode : '',
  spouseName: editData ? editData?.spouseDetails?.name : '',
  spouseOccupation: editData ? editData?.spouseDetails?.occupation : '',
  spouseContactNo: editData ? editData?.spouseDetails?.mobileNo : '',

  spouseAddress1: editData ? editData?.spouseDetails?.address1 : '',
  spouseAddress2: editData ? editData?.spouseDetails?.address2 : '',
  spouseAddress3: editData ? editData?.spouseDetails?.address3 : '',

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
  spouseCity: editData?.spouseDetails?.city
    ? { name: editData?.spouseDetails?.city }
    : { name: '' },

  spousePinCode: editData ? editData?.spouseDetails?.pincode : '',
});

export const additionalDetailsInitialValues = (editData?: IAdditionalInformationResponse) => ({
  bplCardNo: editData ? editData.bplCardNo : '',
  personWithDisability: editData ? (editData.personWithDisability ? 'Yes' : 'No') : '',
  secondLanguage: editData ? editData.secondLanguage : '',
  libraryMember: editData ? editData.isLibraryMember : false,
  transportMember: editData ? editData.isTransportMember : false,
});

export const documentsInitialValues = () => ({ documents: new FormData() });

export const workExperienceInitialValues = (editData?: IWorkExperienceResponse[]) => ({
  experiences: editData
    ? editData?.map((i: any) => ({
        ...i,
        startDate: i?.startDate ? dayjs(i.startDate) : null,
        endDate: i?.endDate ? dayjs(i.endDate) : null,
      }))
    : [],
});

export const payrollInitialValues = (editData?: IPayrollInformation) => ({
  bankName: editData ? editData?.bankDetails?.bankName : '',
  branchName: editData ? editData?.bankDetails?.branchName : '',
  accountHolderName: editData ? editData?.bankDetails?.accountHolderName : '',
  accountNumber: editData ? editData?.bankDetails?.accountNumber : '',
  ifscCode: editData ? editData?.bankDetails?.ifscCode : '',
  pfRule: editData ? editData?.salaryDetails?.pfRuleId : '',
  epfNumber: editData ? editData?.salaryDetails?.epfNumber : '',
  uanNumber: editData ? editData?.salaryDetails?.uanNumber : '',
  totalWorkingHourPerMonth: editData ? editData?.salaryDetails?.totalWorkingHourPerMonth : '',
  punchId: editData ? editData?.salaryDetails?.punchId : '',
  earningComponents: editData ? editData?.earningComponents || [] : [],
  deductionComponents: editData ? editData?.deductionComponents || [] : [],
});

export const assignReportingManagerInitialValues = (editData?: IReportingInformationResponse) => ({
  reportingManager: editData ? editData?.employeeId : '',
});

export const academicPermissionInitialValues = (editData?: any) => ({
  academicPermission: editData || {
    boards: [],
    mediums: [],
    organizations: [],
    standards: [],
    divisions: [],
  },
  academicPermissionSelectedData: {
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [activeStep, setActiveStep] = useState(0);

  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBasicInformationMutation,
    isThrowError: true,
  });
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserMutation,
    isThrowError: true,
  });
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

  const [addAccessControl, { isLoading: isAddAccessControlLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
  });

  const initialValues = useMemo(
    () => ({
      ...personalInformationInitialValues({
        id: editData?.id,
      }),
      ...familyInformationInitialValues(),
      ...additionalDetailsInitialValues(),
      ...documentsInitialValues(),
      ...workExperienceInitialValues(),
      ...payrollInitialValues(),
      ...assignReportingManagerInitialValues(),
      ...academicPermissionInitialValues(),
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleBasicInformation = useCallback(
    async (values: any, formik: any) => {
      if (!values.employeeId) {
        const resp = await addEmployee({
          // profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName,
          shortName: values.shortName,
          employeeStatusType: values.employeeStatusType,
          dob: dateConvertor(values.dob.format(dateFormat)),
          familyCaste: values.familyCast,
          casteType: values.castType,
          gender: values.gender,
          religion: ReligionType[values.religion],
          maritalStatus: values.maritalStatus,
          bloodGroup: values.bloodGroup,
          mobileNo: values.mobileNo,
          secondaryMobileNo: values.secondaryMobileNo,
          email: values.email,
          department: values.department,
          doj: dateConvertor(values.dateOfJoining.format(dateFormat)),
          isTeaching: values.employeeGroup === 0,
          // qualification: values.qualification,
          roleId: values.role,
          // identificationMark1: values.identificationMark1,
          address1: values.addressLine1,
          address2: values.addressLine2,
          address3: values.addressLine3,
          country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
          city: values?.city?.name,
          state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
          pincode: `${values.pincode}`,
          // educationMediumStageId: values.organization,
          shiftId: values.shift,
        }).unwrap();
        formik.setFieldValue('employeeId', resp.id);
      }
    },
    [addEmployee]
  );

  const handleFamilyInformation = useCallback(
    async (values: any, formik: any) => {
      const res = await updateFamilyInfo({
        employeeId: values.employeeId,
        body: {
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            mobileNo: values.fatherContactNo,
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
            mobileNo: values.motherContactNo,
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
            mobileNo: values.spouseContactNo,
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
          ...i,
          mediumStageName: i.mediumStageName,
          designation: i.designation,
          department: i.department,
          country: {
            name: i.country.name,
            isoCode: i.country.isoCode,
          },
          state: {
            name: i.state.name,
            isoCode: i.state.isoCode,
          },
          city: i.city.name,
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
            basicSalary: Number(values.basicSalary),
            punchId: values.punchId,
            tdsPercentage: Number(values.tdsPercentage),
            tdsAmount: Number(values.tdsAmount),
          },

          earningComponents: values.earningComponents,
          deductionComponents: values.deductionComponents,
        },
      }).unwrap();
      return res;
    },
    [updateBankDetails]
  );

  const handelUpdateEmployee = useCallback(
    async (values: any, formik: any, id: any) => {
      try {
        const res = await updateEmployee({
          id,
          body: {
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            shortName: values.shortName,
            employeeStatusType: values.employeeStatusType,
            dob: dateConvertor(values.dob.format(dateFormat)),
            familyCaste: values.familyCast,
            casteType: values.castType,
            gender: values.gender,
            religion: ReligionType[values.religion],
            maritalStatus: values.maritalStatus,
            bloodGroup: values.bloodGroup,
            mobileNo: values.mobileNo,
            secondaryMobileNo: values.secondaryMobileNo,
            email: values.email,
            department: values.department,
            doj: dateConvertor(values.dateOfJoining.format(dateFormat)),
            isTeaching: values.employeeGroup === 0,
            // qualification: values.qualification,
            roleId: values.role,
            // identificationMark1: values.identificationMark1,
            address1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3,
            country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
            city: values?.city?.name,
            state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
            pincode: `${values.pincode}`,
            // educationMediumStageId: values.organization,
            shiftId: values.shift,
          },
        }).unwrap();

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
    [updateEmployee]
  );

  const handleReportingManager = useCallback(
    async (values: any, formik: any, id: any) => {
      const res = await updateReportingManager({
        id: values.employeeId,
        body: {
          reportingManagerId: values?.reportingManager?.id,
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
          // await handelUpdateEmployee(values, formik, editData.id);
          // if (isSaveButton) {
          shikshaMitraToast.success({ message: 'Employee details updated successfully' });
          // }
        } else if (activeStep === 0) {
          if (values.employeeId) {
            // await handelUpdateEmployee(values, formik, values.employeeId);
            // if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Employee details updated successfully' });
            // }
          } else {
            await handleBasicInformation(values, formik);
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Employee added successfully' });
            }
          }
        } else if (activeStep === 1) {
          // await handleFamilyInformation(values, formik);
          // if (isSaveButton) {
          shikshaMitraToast.success({ message: 'Family information updated successfully' });
          // }
        } else if (activeStep === 2) {
          // await handleAdditionalDetails(values, formik);
          shikshaMitraToast.success({ message: 'Additional details updated successfully' });
        } else if (activeStep === 4) {
          // await handleWorkExperience(values, formik);
          // if (isSaveButton) {
          shikshaMitraToast.success({ message: 'Work experience updated successfully' });
          // }
        } else if (activeStep === 5) {
          // await handleBankDetailsInformation(values, formik);
          // if (isSaveButton) {
          shikshaMitraToast.success({ message: 'Bank details updated successfully' });
          // }
        } else if (activeStep === 6) {
          // await handleReportingManager(values, formik, values.employeeId);
          // if (isSaveButton) {
          shikshaMitraToast.success({ message: 'Reporting manager updated successfully' });
          // }
        }
        if (isLastStep && !isSaveButton) {
          // await handleAcademicPermission(values, formik, values.employeeId);
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
    [activeStep, editData, handleBasicInformation, handleClose]
  );

  return (
    <CustomStepperWithFormik
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
      renderItem={({ activeStep: step, formik }: any) => (
        <FormikDetectChanges values={formik.values} initialValues={initialValues}>
          <FormSlider step={step} formik={formik} editData={editData} />
        </FormikDetectChanges>
      )}
    />
  );
};

export default EmployeeFrom;

const FormSlider = ({ step, formik, editData }: any) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const initializedStepsRef = React.useRef<Record<number, boolean>>({});
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
    params: editData?.id,
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
    if (basicDetails && step === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...personalInformationInitialValues(basicDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (familyDetails && step === 1) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...familyInformationInitialValues(familyDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (additionalDetails && step === 2) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...additionalDetailsInitialValues(additionalDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (workExperience && step === 4) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...workExperienceInitialValues(workExperience),
      }));
      initializedStepsRef.current[step] = true;
    } else if (bankDetails && step === 5) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...payrollInitialValues(bankDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (reportingManagerDetails && step === 6) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...assignReportingManagerInitialValues(reportingManagerDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (accessControl && step === 7) {
      if (accessControl?.accessibleHierarchy) {
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
          0: 'boards',
          1: 'mediums',
          2: 'mediumStages',
          3: 'standards',
          4: 'divisions',
        };
        const data: {
          boards: string[];
          mediums: string[];
          organizations: string[];
          standards: string[];
          divisions: string[];
        } = {
          boards: [],
          mediums: [],
          organizations: [],
          standards: [],
          divisions: [],
        };
        const recursionFn = (academicData: any[], level = 0) => {
          academicData?.forEach((element) => {
            if (element.hasAccess || element?.[(keyMapping as any)[level]]) {
              if (level === 0) {
                data.boards.push(element?.[idMapping[level]]);
              }
              if (level === 1) {
                data.mediums.push(element?.[idMapping[level]]);
              }
              if (level === 2) {
                data.organizations.push(element?.[idMapping[level]]);
              }
              if (level === 3) {
                data.standards.push(element?.[idMapping[level]]);
              }
              if (level === 4) {
                data.divisions.push(element?.[idMapping[level]]);
              }
            }

            if (element?.[levelMapping[level]]?.length) {
              recursionFn(element?.[levelMapping[level]], level + 1);
            }
          });
        };
        recursionFn(accessControl?.accessibleHierarchy?.[0]?.boards);
        console.log(data, 'data');

        formik.setValues((pre: any) => ({
          ...pre,
          ...academicPermissionInitialValues(data),
        }));
        initializedStepsRef.current[step] = true;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails,
    familyDetails,
    additionalDetails,
    workExperience,
    bankDetails,
    reportingManagerDetails,
    step,
  ]);

  return (
    <Box ref={containerRef} sx={{ p: 2, overflowX: 'hidden', mt: 1, height: '100%' }}>
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
                    <LoadingScreen />
                  ) : (
                    <Grid container spacing={0} sx={{ height: '100%', width: '100%' }}>
                      {' '}
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
                                helperText={formik.touched[field.name] && formik.errors[field.name]}
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
              </Box>
            </Slide>
          )
      )}
    </Box>
  );
};

const FormikDetectChanges = ({
  values,
  children,
  initialValues,
}: {
  values: any;
  children: any;
  initialValues: any;
}) => {
  const dispatch = useDispatch();
  const isChanged = isEqual(values, initialValues);
  useEffect(() => {
    if (!isChanged) {
      dispatch(setIsChanges(true));
    } else {
      dispatch(setIsChanges(false));
    }
  }, [dispatch, isChanged]);

  return children;
};
