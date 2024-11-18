import dayjs from 'dayjs';
import * as Yup from 'yup';
import { isEqual } from 'lodash';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { convertBase64Format } from 'src/utils/base64Formate';

import { useAddUserMutation } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useAddEmployeeMutation, useUpdateEmployeeMutation } from 'src/redux/employee/employeeApi';

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
  status: editData ? editData.status : '',
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
  state: editData ? editData?.state : '',
  city: editData ? editData?.city : '',
  pinCode: editData ? editData?.pinCode : '',
});

const familyInformationInitialValues = (editData: any) => ({
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
    currentQueryAndMutation: useAddEmployeeMutation,
  });
  const [addUser] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddUserMutation,
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
      handleNext={async (isLastStep, values) => {
        if (editData) {
          updateEmployee({
            id: editData.id,
            body: {
              userId: editData.userId,
              // organizationName: values.organizationName,
              code: values.code,
              lastName: values.lastName,
              firstName: values.firstName,
              middleName: values.middleName,
              shortName: values.shortName,
              status: values.status,
              dateOfBirth: values.dob.format('YYYY-MM-DD'),
              familyCast: values.familyCast,
              castType: 0,
              gender: 0,
              religion: values.religion,
              maritalStatus: 0,
              bloodGroup: values.bloodGroup,
              mobileNo: values.mobileNo,
              email: values.email,
              address: values.address,
              department: values.department,
              designation: values.designation,
              dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

              employeeGroup: values.employeeGroup,
              qualification: values.qualification,
              role: values.role,
              identificationMark1: values.identificationMark1,
              identificationMark2: values.identificationMark2,
              identificationMark3: values.identificationMark3,
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
              bankDetails: {
                bankName: values.bankName,
                branchName: values.branchName,
                accountHolderName: values.accountHolderName,
                accountNumber: values.accountNumber,
                ifscCode: values.ifscCode,
              },
              workExperiences: values.experiences.map((i: any) => ({
                ...i,
                fromDate: i.fromDate.format('YYYY-MM-DD'),
                toDate: i.toDate.format('YYYY-MM-DD'),
                employeeId: editData.employeeId,
              })),
              profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            },
          });
        } else if (isLastStep) {
          try {
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
            await addEmployee({
              userId: res.data.id,
              // organizationName: values.organizationName,
              code: values.code,
              lastName: values.lastName,
              firstName: values.firstName,
              middleName: values.middleName,
              shortName: values.shortName,
              status: values.status,
              dateOfBirth: values.dob.format('YYYY-MM-DD'),
              familyCast: values.familyCast,
              castType: 0,
              gender: 0,
              religion: values.religion,
              maritalStatus: 0,
              bloodGroup: values.bloodGroup,
              mobileNo: values.mobileNo,
              email: values.email,
              address: values.address,
              department: values.department,
              designation: values.designation,
              dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),

              employeeGroup: values.employeeGroup,
              qualification: values.qualification,
              role: values.role,
              identificationMark1: values.identificationMark1,
              identificationMark2: values.identificationMark2,
              identificationMark3: values.identificationMark3,
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
              bankDetails: {
                bankName: values.bankName,
                branchName: values.branchName,
                accountHolderName: values.accountHolderName,
                accountNumber: values.accountNumber,
                ifscCode: values.ifscCode,
              },
              workExperiences: values.experiences.map((i: any) => ({
                ...i,
                fromDate: i.fromDate.format('YYYY-MM-DD'),
                toDate: i.toDate.format('YYYY-MM-DD'),
                employeeId: res.data.id,
              })),
              profilePicture: values.photo.replace(/^data:\w+\/[\w-]+;base64,/, ''),
            });
          } catch (error) {
            console.log(error);
          }
          return;
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
                  <Box flexGrow={1} display="flex" alignItems="center">
                    <UploadAvatar
                      maxSize={3145728}
                      onDrop={async (acceptedFiles: File[]) => {
                        const value = acceptedFiles[0];
                        const base64 = await fileToBase64(value);
                        formik.setFieldValue('photo', base64);
                      }}
                      value={formik.values.photo}
                      error={formik.touched.photo && Boolean(formik.errors.photo)}
                    />
                  </Box>
                )}
                <Box p={2} display={step === 2 ? 'block' : 'flex'} flexWrap="wrap" gap={2}>
                  <Grid container spacing={2}>
                    {' '}
                    {allFields[step].map((field) => (
                      <Grid
                        item
                        xs={[2, 3].includes(step) ? 12 : 4}
                        md={[2, 3].includes(step) ? 12 : 4}
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
