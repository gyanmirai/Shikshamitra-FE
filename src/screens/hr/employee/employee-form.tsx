import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { convertBase64Format } from 'src/utils/base64Formate';

import { GenderType } from 'src/enums/gender';
import { useAddUserMutation } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useUpdateEmployeeMutation,
  useUpdateBankDetailsMutation,
  useAddBasicInformationMutation,
  useUpdateFamilyInformationMutation,
  useUpdateExperienceInformationMutation,
} from 'src/redux/employee/employeeApi';

import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { allFields } from './employee-form-fields';
import { validations } from './employee-form-validation';

export const personalInformationInitialValues = (editData: any) => ({
  photo: editData
    ? editData.profilePicture
      ? convertBase64Format(editData.profilePicture)
      : ''
    : '',
  code: editData ? editData.code : '',
  lastName: editData ? editData.lastName : '',
  firstName: editData ? editData.firstName : '',
  middleName: editData ? editData.middleName : '',
  shortName: editData ? editData.shortName : '',
  employeeStatusType: editData ? editData?.employeeStatusType : EmployeeStatusType.Active,
  subject: editData ? editData.subject || [] : [],
  dob: editData ? dayjs(editData.dateOfBirth, 'YYYY-MM-DD') : null,
  familyCast: editData ? editData.familyCast : '',
  castType: editData ? editData.castType : '',
  gender: editData ? editData.genderType : GenderType.Male,
  religion: editData ? editData.religion : '',
  maritalStatus: editData ? editData.maritalStatus : '',
  bloodGroup: editData ? editData.bloodGroup : '',
  mobileNo: editData ? editData.mobileNo : '',
  email: editData ? editData.email : '',
  department: editData ? editData.department : '',
  designation: editData ? editData.designation : '',
  dateOfJoining: editData ? dayjs(editData.dateOfJoining, 'YYYY-MM-DD') : dayjs(),
  employeeGroup: editData ? editData.employeeGroup : '',
  qualification: editData ? editData.qualification : '',
  role: editData ? editData?.role?.id : '',
  identificationMark1: editData ? editData.identificationMark1 : '',
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
  organization: editData ? editData?.educationMediumStageId : '',
  shift: editData ? editData?.shift?.id : '',
});

export const familyInformationInitialValues = (editData: any) => ({
  sameAsFatherAddressForMother: false,
  sameAsFatherAddressForSpouse: false,
  sameAsEmployeeAddressForFather: false,
  fatherName: editData ? editData.fatherDetails.name : '',
  fatherOccupation: editData ? editData.fatherDetails.occupation : '',
  fatherContactNo: editData ? editData.fatherDetails.contactNo : '',
  fatherAddress1: editData ? editData.fatherDetails.address1 : '',
  fatherAddress2: editData ? editData.fatherDetails.address2 : '',
  fatherAddress3: editData ? editData.fatherDetails.address3 : '',

  fatherCountry: editData?.fatherDetails?.countryName
    ? {
        name: editData?.fatherDetails?.countryName,
        isoCode: editData?.fatherDetails?.countryIsoCode,
      }
    : { name: 'India', isoCode: 'IN' },
  fatherState: editData?.fatherDetails?.stateName
    ? {
        name: editData?.fatherDetails?.stateName,
        isoCode: editData?.fatherDetails?.stateIsoCode,
      }
    : { name: '', isoCode: '' },
  fatherCity: editData ? { name: editData?.fatherDetails?.city } : { name: '' },

  fatherPinCode: editData ? editData?.fatherDetails?.pinCode : '',
  motherName: editData ? editData.motherDetails.name : '',
  motherOccupation: editData ? editData.motherDetails.occupation : '',
  motherContactNo: editData ? editData.motherDetails.contactNo : '',
  motherAddress1: editData ? editData.motherDetails.address1 : '',
  motherAddress2: editData ? editData.motherDetails.address2 : '',
  motherAddress3: editData ? editData.motherDetails.address3 : '',

  motherCountry: editData?.motherDetails?.countryName
    ? {
        name: editData?.motherDetails?.countryName,
        isoCode: editData?.motherDetails?.countryIsoCode,
      }
    : { name: 'India', isoCode: 'IN' },
  motherState: editData?.motherDetails?.stateName
    ? {
        name: editData?.motherDetails?.stateName,
        isoCode: editData?.motherDetails?.stateIsoCode,
      }
    : { name: '', isoCode: '' },
  motherCity: editData?.motherDetails?.city
    ? { name: editData?.motherDetails?.city }
    : { name: '' },

  motherPinCode: editData ? editData?.motherDetails?.pinCode : '',
  spouseName: editData ? editData.spouseDetails.name : '',
  spouseOccupation: editData ? editData.spouseDetails.occupation : '',
  spouseContactNo: editData ? editData.spouseDetails.contactNo : '',

  spouseAddress1: editData ? editData.spouseDetails.address1 : '',
  spouseAddress2: editData ? editData.spouseDetails.address2 : '',
  spouseAddress3: editData ? editData.spouseDetails.address3 : '',

  spouseCountry: editData?.spouseDetails?.countryName
    ? {
        name: editData?.spouseDetails?.countryName,
        isoCode: editData?.spouseDetails?.countryIsoCode,
      }
    : { name: 'India', isoCode: 'IN' },
  spouseState: editData?.spouseDetails?.stateName
    ? {
        name: editData?.spouseDetails?.stateName,
        isoCode: editData?.spouseDetails?.stateIsoCode,
      }
    : { name: '', isoCode: '' },
  spouseCity: editData?.spouseDetails?.city
    ? { name: editData?.spouseDetails?.city }
    : { name: '' },

  spousePinCode: editData ? editData?.spouseDetails?.pinCode : '',
});

export const documentsInitialValues = () => ({ documents: new FormData() });

export const workExperienceInitialValues = (editData: any) => ({
  experiences: editData
    ? editData.workExperiences.map((i: any) => ({
        ...i,
        fromDate: dayjs(i.fromDate, 'YYYY-MM-DD'),
        toDate: dayjs(i.toDate, 'YYYY-MM-DD'),
      }))
    : [],
});

export const payrollInitialValues = (editData: any) => ({
  bankName: editData ? editData.bankDetails.bankName : '',
  branchName: editData ? editData.bankDetails.branchName : '',
  accountHolderName: editData ? editData.bankDetails.accountHolderName : '',
  accountNumber: editData ? editData.bankDetails.accountNumber : '',
  ifscCode: editData ? editData.bankDetails.ifscCode : '',
  pfType: '',
  epfNumber: '',
  uanNumber: '',
  basicSalary: '',
  punchId: '',
  shiftName: '',
});

const steps = [
  'Personal Information',
  'Family Information',
  'Documents',
  'Work Experience',
  'Payroll',
  // 'Performance and Development',
];

const EmployeeFrom = ({ editData, handleClose }: any) => {
  const [activeStep, setActiveStep] = useState(0);

  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBasicInformationMutation,
    isThrowError: true,
  });
  const [addUser] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserMutation,
    isThrowError: true,
  });
  const [updateFamilyInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyInformationMutation,
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

  const initialValues = useMemo(
    () => ({
      ...personalInformationInitialValues(editData),
      ...familyInformationInitialValues(editData),
      ...documentsInitialValues(),
      ...workExperienceInitialValues(editData),
      ...payrollInitialValues(editData),
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleBasicInformation = useCallback(
    async (values: any, formik: any) => {
      if (!values.employeeId) {
        const resp = await addEmployee({
          profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName,
          shortName: values.shortName,

          employeeStatusType: values.employeeStatusType,

          dateOfBirth: values.dob.format('YYYY-MM-DD'),
          familyCast: values.familyCast,
          castType: values.castType,
          genderType: values.gender,
          religion: values.religion,
          maritalStatus: values.maritalStatus,
          bloodGroup: values.bloodGroup,
          mobileNo: values.mobileNo,
          email: values.email,

          department: values.department,
          designation: values.designation,
          dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

          employeeGroup: values.employeeGroup,
          qualification: values.qualification,
          roleId: values.role,
          identificationMark1: values.identificationMark1,

          address1: values.addressLine1,
          address2: values.addressLine2,
          address3: values.addressLine3,

          country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
          city: values?.city?.name,
          state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
          pincode: `${values.pincode}`,
          educationMediumStageId: values.organization,
          shiftId: values.shift,
        }).unwrap();
        formik.setFieldValue('employeeId', resp.data.id);
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
            contactNo: values.fatherContactNo,
            address1: values.fatherAddress1,
            address2: values.fatherAddress2,
            address3: values.fatherAddress3,
            countryName: values?.fatherCountry?.name,
            countryIsoCode: values?.fatherCountry?.isoCode,
            stateName: values?.fatherState?.name,
            stateIsoCode: values?.fatherState?.isoCode,
            city: values?.fatherCity?.name,
            pincode: values.fatherPinCode,
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            contactNo: values.motherContactNo,
            address1: values.motherAddress1,
            address2: values.motherAddress2,
            address3: values.motherAddress3,

            countryName: values?.motherCountry?.name,
            countryIsoCode: values?.motherCountry?.isoCode,
            stateName: values?.motherState?.name,
            stateIsoCode: values?.motherState?.isoCode,

            city: values?.motherCity?.name,
            pincode: values.motherPinCode,
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            contactNo: values.spouseContactNo,
            address1: values.spouseAddress1,
            address2: values.spouseAddress2,
            address3: values.spouseAddress3,
            countryName: values?.spouseCountry?.name,
            countryIsoCode: values?.spouseCountry?.isoCode,
            stateName: values?.spouseState?.name,
            stateIsoCode: values?.spouseState?.isoCode,
            city: values?.spouseCity?.name,
            pincode: values.spousePinCode,
          },
        },
      }).unwrap();
      return res;
    },
    [updateFamilyInfo]
  );
  const handleWorkExperience = useCallback(
    async (values: any, formik: any) => {
      const res = await updateExperienceInfo({
        employeeId: values.employeeId,
        body: values.experiences.map((i: any) => ({
          ...i,
          fromDate: i.fromDate ? i.fromDate.format('YYYY-MM-DD') : null,
          toDate: i.toDate ? i.toDate.format('YYYY-MM-DD') : null,
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
          bankName: values.bankName,
          branchName: values.branchName,
          accountHolderName: values.accountHolderName,
          accountNumber: values.accountNumber,
          ifscCode: values.ifscCode,
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
            // userId: res.data.id,
            profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            // employeeCode: values.code,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            shortName: values.shortName,

            employeeStatusType: values.employeeStatusType,

            dateOfBirth: values.dob.format('YYYY-MM-DD'),
            familyCast: values.familyCast,
            castType: values.castType,
            genderType: values.gender,
            religion: values.religion,
            maritalStatus: values.maritalStatus,
            bloodGroup: values.bloodGroup,
            mobileNo: values.mobileNo,
            email: values.email,

            department: values.department,
            designation: values.designation,
            dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

            employeeGroup: values.employeeGroup,
            qualification: values.qualification,
            roleId: values.role,
            identificationMark1: values.identificationMark1,

            address1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3,

            country: values?.country?.name
              ? { name: values?.country?.name, isoCode: values?.country?.isoCode }
              : undefined,
            city: values?.city?.name,
            state: values?.state?.name
              ? { name: values?.state?.name, isoCode: values?.state?.isoCode }
              : undefined,

            pincode: `${values.pincode}`,
            educationMediumStageId: values.organization,
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

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      const isChanged = isEqual(values, initialValues);

      if (isChanged) {
        setActiveStep(activeStep + 1);
        return;
      }
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
            await handleBasicInformation(values, formik);
            if (isSaveButton) {
              shikshaMitraToast.success({ message: 'Employee added successfully' });
            }
          }
        } else if (activeStep === 1) {
          await handleFamilyInformation(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Family information updated successfully' });
          }
        } else if (activeStep === 3) {
          await handleWorkExperience(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Work experience updated successfully' });
          }
        } else if (activeStep === 4) {
          await handleBankDetailsInformation(values, formik);
          if (isSaveButton) {
            shikshaMitraToast.success({ message: 'Bank details updated successfully' });
          }
        }
        if (!isSaveButton) {
          setActiveStep(activeStep + 1);
        }
      } catch (error) {
        console.log(error, '============================');
      }
      setIsLoading(false);
      if (isLastStep) {
        handleClose();
      }
    },
    [
      activeStep,
      editData,
      handelUpdateEmployee,
      handleBankDetailsInformation,
      handleBasicInformation,
      handleClose,
      handleFamilyInformation,
      handleWorkExperience,
      initialValues,
    ]
  );

  return (
    <CustomStepperWithFormik
      initialValues={initialValues}
      steps={steps}
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
        // <FormikDetectChanges values={formik.values} initialValues={initialValues}>

        <FormSlider step={step} formik={formik} />
        // </FormikDetectChanges>
      )}
    />
  );
};

export default EmployeeFrom;

const FormSlider = ({ step, formik }: { step: number; formik: any }) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, overflowX: 'hidden' }}>
      {steps.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction="left"
              key={index}
            >
              <Box display="flex">
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
                  display={step === 2 || step === 1 ? 'block' : 'flex'}
                  flexWrap="wrap"
                  gap={2}
                  width="100%"
                >
                  <Grid container spacing={3}>
                    {' '}
                    {allFields[step].map((field) => (
                      <Grid
                        item
                        xs={[1, 2, 3].includes(step) ? 12 : 4}
                        md={[1, 2, 3].includes(step) ? 12 : 4}
                        key={field.name}
                        {...field.gridProps}
                      >
                        {field.renderComp ? (
                          field.renderComp({
                            formik,
                            field,
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
                                helperText: formik.touched[field.name] && formik.errors[field.name],
                                error:
                                  formik.touched[field.name] && Boolean(formik.errors[field.name]),
                              },
                            }}
                          />
                        ) : (
                          <ShakingTextField
                            error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
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
