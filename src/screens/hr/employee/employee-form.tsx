import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { convertBase64Format } from 'src/utils/base64Formate';
import { ConvertRtkResponse } from 'src/utils/convrtRtkResponse';

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

import { UploadAvatar } from 'src/components/upload';
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
  gender: editData ? editData.genderType : '',
  religion: editData ? editData.religion : '',
  maritalStatus: editData ? editData.maritalStatus : '',
  bloodGroup: editData ? editData.bloodGroup : '',
  mobileNo: editData ? editData.mobileNo : '',
  email: editData ? editData.email : '',
  department: editData ? editData.department : '',
  designation: editData ? editData.designation : '',
  dateOfJoining: editData ? dayjs(editData.dateOfJoining, 'YYYY-MM-DD') : null,
  employeeGroup: editData ? editData.employeeGroup : '',
  qualification: editData ? editData.qualification : '',
  role: editData ? editData?.role?.id : '',
  identificationMark1: editData ? editData.identificationMark1 : '',

  address: editData ? editData.address : '',
  state: editData ? editData?.state : '',
  city: editData ? editData?.city : '',
  pincode: editData ? editData?.pinCode : '',
  employeeId: editData ? editData.id : '',
  organization: editData ? editData?.educationMediumStageId : '',
});

export const familyInformationInitialValues = (editData: any) => ({
  sameAsFatherAddressForMother: false,
  sameAsFatherAddressForSpouse: false,
  fatherName: editData ? editData.fatherDetails.name : '',
  fatherOccupation: editData ? editData.fatherDetails.occupation : '',
  fatherContactNo: editData ? editData.fatherDetails.contactNo : '',
  fatherAddress: editData ? editData.fatherDetails.address : '',
  fatherState: editData ? editData?.fatherDetails?.state : '',
  fatherCity: editData ? editData?.fatherDetails?.city : '',
  fatherPinCode: editData ? editData?.fatherDetails?.pinCode : '',
  motherName: editData ? editData.motherDetails.name : '',
  motherOccupation: editData ? editData.motherDetails.occupation : '',
  motherContactNo: editData ? editData.motherDetails.contactNo : '',
  motherAddress: editData ? editData.motherDetails.address : '',
  motherState: editData ? editData?.motherDetails?.state : '',
  motherCity: editData ? editData?.motherDetails?.city : '',
  motherPinCode: editData ? editData?.motherDetails?.pinCode : '',
  spouseName: editData ? editData.spouseDetails.name : '',
  spouseOccupation: editData ? editData.spouseDetails.occupation : '',
  spouseContactNo: editData ? editData.spouseDetails.contactNo : '',
  spouseAddress: editData ? editData.spouseDetails.address : '',
  spouseState: editData ? editData?.spouseDetails?.state : '',
  spouseCity: editData ? editData?.spouseDetails?.city : '',
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
  console.log(
    '🚀 ~ file: employee-form.tsx:165 ~ EmployeeFrom ~ familyInformationInitialValues(editData):',
    familyInformationInitialValues(editData)
  );

  const handleBasicInformation = useCallback(
    async (values: any, formik: any) => {
      if (!values.employeeId) {
        const res = ConvertRtkResponse(
          await addUser({
            userName: `${values.firstName}${values.lastName}`,
            name: values.firstName,
            surname: values.lastName,
            email: values.email,
            phoneNumber: values.mobileNo,
            isActive: true,
            lockoutEnabled: true,
            roleNames: [],
            password: 'Test@123',
          })
        );

        const resp = await addEmployee({
          userId: res.data.id,
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

          address: values.address,
          city: values.city,
          state: values.state,
          pincode: `${values.pincode}`,
          educationMediumStageId: values.organization,
        });
        formik.setFieldValue('employeeId', resp.data.id);
      }
    },
    [addEmployee, addUser]
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
            address: values.fatherAddress,
            state: values.fatherState,
            city: values.fatherCity,
            pincode: values.fatherPinCode,
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            contactNo: values.motherContactNo,
            address: values.motherAddress,
            state: values.motherState,
            city: values.motherCity,
            pincode: values.motherPinCode,
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            contactNo: values.spouseContactNo,
            address: values.spouseAddress,
            state: values.spouseState,
            city: values.spouseCity,
            pincode: values.spousePinCode,
          },
        },
      });
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
      });
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
      });
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

            address: values.address,
            city: values.city,
            state: values.state,
            pincode: `${values.pincode}`,
            educationMediumStageId: values.organization,
          },
        });

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },
    [updateEmployee]
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
      handleNext={async (isLastStep, values, formik, setIsLoading) => {
        const isChanged = isEqual(values, initialValues);

        if (isChanged) {
          setActiveStep(activeStep + 1);
          return;
        }
        try {
          setIsLoading(true);
          if (editData && activeStep === 0) {
            await handelUpdateEmployee(values, formik, editData.id);
          } else if (activeStep === 0) {
            if (values.employeeId) {
              await handelUpdateEmployee(values, formik, values.employeeId);
            } else {
              await handleBasicInformation(values, formik);
            }
          } else if (activeStep === 1) {
            await handleFamilyInformation(values, formik);
          } else if (activeStep === 3) {
            await handleWorkExperience(values, formik);
          } else if (activeStep === 4) {
            await handleBankDetailsInformation(values, formik);
          }
          setActiveStep(activeStep + 1);
        } catch (error) {
          console.log(error, '============================');
        }
        setIsLoading(false);
        if (isLastStep) {
          handleClose();
        }
      }}
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
              <Box display="flex" gap={2}>
                {step === 0 && (
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
                )}
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
                      >
                        {field.renderComp ? (
                          field.renderComp({ formik, field })
                        ) : field.type === 'date' ? (
                          <DatePicker
                            label={field.label}
                            name={field.name}
                            value={formik.values[field.name]}
                            format="DD/MM/YYYY"
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
                            error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                            helperText={formik.touched[field.name] && formik.errors[field.name]}
                            fullWidth
                            sx={{ ...(field?.sx || {}) }}
                            {...(field?.otherProps || {})}
                          />
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
