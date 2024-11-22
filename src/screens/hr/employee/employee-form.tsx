import dayjs from 'dayjs';
import * as Yup from 'yup';
import { isEqual } from 'lodash';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { convertBase64Format } from 'src/utils/base64Formate';

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

const personalInformationInitialValues = (editData: any) => ({
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
  status: editData ? editData?.employeeStatusType : EmployeeStatusType.Active,
  subject: editData ? editData.subject : [],
  dob: editData ? dayjs(editData.dateOfBirth, 'YYYY-MM-DD') : null,
  familyCast: editData ? editData.familyCast : '',
  castCategory: editData ? editData.castCategory : '',
  gender: editData ? editData.gender : '',
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
  role: editData ? editData.role : '',
  identificationMark1: editData ? editData.identificationMark1 : '',
  identificationMark2: editData ? editData.identificationMark2 : '',
  identificationMark3: editData ? editData.identificationMark3 : '',
  address: editData ? editData.address : '',
  state: editData ? editData?.state : '',
  city: editData ? editData?.city : '',
  pinCode: editData ? editData?.pinCode : '',
});

const familyInformationInitialValues = (editData: any) => ({
  sameAsFatherAddressForMother: false,
  sameAsFatherAddressForSpouse: false,
  fatherName: editData ? editData.fatherDetails.name : '',
  fatherOccupation: editData ? editData.fatherDetails.occupation : '',
  fatherContactNo: editData ? editData.fatherDetails.contactNo : '',
  fatherAddress: editData ? editData.fatherDetails.address : '',
  motherName: editData ? editData.motherDetails.name : '',
  motherOccupation: editData ? editData.motherDetails.occupation : '',
  motherContactNo: editData ? editData.motherDetails.contactNo : '',
  motherAddress: editData ? editData.motherDetails.address : '',
  spouseName: editData ? editData.spouseDetails.name : '',
  spouseOccupation: editData ? editData.spouseDetails.occupation : '',
  spouseContactNo: editData ? editData.spouseDetails.contactNo : '',
  spouseAddress: editData ? editData.spouseDetails.address : '',
});
const documentsInitialValues = () => ({ documents: [] });

const workExperienceInitialValues = (editData: any) => ({
  experiences: editData
    ? editData.workExperiences.map((i: any) => ({
        ...i,
        fromDate: dayjs(i.fromDate, 'YYYY-MM-DD'),
        toDate: dayjs(i.toDate, 'YYYY-MM-DD'),
      }))
    : [],
});

const payrollInitialValues = (editData: any) => ({
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

const EmployeeFrom = ({ editData }: any) => {
  const [activeStep, setActiveStep] = useState(0);
  const [addEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBasicInformationMutation,
  });
  const [addUser] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserMutation,
  });
  const [updateFamilyInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyInformationMutation,
  });
  const [updateExperienceInfo] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExperienceInformationMutation,
  });
  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBankDetailsMutation,
  });

  const [updateEmployee] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeMutation,
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
        const res = await addUser({
          userName: `${values.firstName}${values.lastName}`,
          name: values.firstName,
          surname: values.lastName,
          email: values.email,
          phoneNumber: values.mobileNo,
          isActive: true,
          lockoutEnabled: true,
          roleNames: [],
          password: 'Test@123',
        });
        formik.setFieldValue('employeeId', res.data.id);
        await addEmployee({
          userId: res.data.id,
          profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
          employeeCode: values.code,
          lastName: values.lastName,
          firstName: values.firstName,
          middleName: values.middleName,
          shortName: values.shortName,

          employeeStatusType: values.status,

          dateOfBirth: values.dob.format('YYYY-MM-DD'),
          familyCast: values.familyCast,
          castType: 0,
          gender: 0,
          religion: values.religion,
          maritalStatus: 0,
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
          identificationMark2: values.identificationMark2,
          identificationMark3: values.identificationMark3,
          address: values.address,
        });
      } else {
        updateEmployee({
          id: values.employeeId,
          body: {
            profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            employeeCode: values.code,
            lastName: values.lastName,
            firstName: values.firstName,
            middleName: values.middleName,
            shortName: values.shortName,

            employeeStatusType: values.status,

            dateOfBirth: values.dob.format('YYYY-MM-DD'),
            familyCast: values.familyCast,
            castType: 0,
            gender: 0,
            religion: values.religion,
            maritalStatus: 0,
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
            identificationMark2: values.identificationMark2,
            identificationMark3: values.identificationMark3,
            address: values.address,
          },
        });
      }
    },
    [addEmployee, addUser, updateEmployee]
  );
  const handleFamilyInformation = useCallback(
    async (values: any, formik: any) => {
      await updateFamilyInfo({
        employeeId: values.employeeId,
        body: {
          fatherDetails: {
            name: values.fatherName,
            occupation: values.fatherOccupation,
            contactNo: values.fatherContactNo,
            address: values.fatherAddress,
          },
          motherDetails: {
            name: values.motherName,
            occupation: values.motherOccupation,
            contactNo: values.motherContactNo,
            address: values.motherAddress,
          },
          spouseDetails: {
            name: values.spouseName,
            occupation: values.spouseOccupation,
            contactNo: values.spouseContactNo,
            address: values.spouseAddress,
          },
        },
      });
    },
    [updateFamilyInfo]
  );
  const handleWorkExperience = useCallback(
    async (values: any, formik: any) => {
      await updateExperienceInfo({
        employeeId: values.employeeId,
        body: values.experiences.map((i: any) => ({
          ...i,
          fromDate: i.fromDate.format('YYYY-MM-DD'),
          toDate: i.toDate.format('YYYY-MM-DD'),
        })),
      });
    },
    [updateExperienceInfo]
  );
  const handleBankDetailsInformation = useCallback(
    async (values: any, formik: any) => {
      await updateBankDetails({
        employeeId: values.employeeId,
        body: {
          bankName: values.bankName,
          branchName: values.branchName,
          accountHolderName: values.accountHolderName,
          accountNumber: values.accountNumber,
          ifscCode: values.ifscCode,
        },
      });
    },
    [updateBankDetails]
  );

  return (
    <CustomStepperWithFormik
      initialValues={initialValues}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={Yup.object({
        name: Yup.string(),
      })}
      handleNext={async (isLastStep, values, formik) => {
        try {
          if (editData && activeStep === 0) {
            await updateEmployee({
              id: editData.id,
              body: {
                profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
                employeeCode: values.code,
                lastName: values.lastName,
                firstName: values.firstName,
                middleName: values.middleName,
                shortName: values.shortName,

                employeeStatusType: values.status,

                dateOfBirth: values.dob.format('YYYY-MM-DD'),
                familyCast: values.familyCast,
                castType: 0,
                gender: 0,
                religion: values.religion,
                maritalStatus: 0,
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
                identificationMark2: values.identificationMark2,
                identificationMark3: values.identificationMark3,
                address: values.address,
              },
            });
          } else if (activeStep === 0) {
            await handleBasicInformation(values, formik);
          } else if (activeStep === 1) {
            await handleFamilyInformation(values, formik);
          } else if (activeStep === 3) {
            await handleWorkExperience(values, formik);
          } else if (activeStep === 4) {
            await handleBankDetailsInformation(values, formik);
          }
        } catch (error) {
          console.log(error);
        }
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik }: any) => (
        <FormikDetectChanges values={formik.values} initialValues={initialValues}>
          <FormSlider step={step} formik={formik} />
        </FormikDetectChanges>
      )}
    />
  );
};

export default EmployeeFrom;

const FormSlider = ({ step, formik }: { step: number; formik: any }) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
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
                  <Grid container spacing={2}>
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
