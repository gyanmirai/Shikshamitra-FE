import React, { useState, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Slide, TextField } from '@mui/material';

import { fileToBase64 } from 'src/utils/file-to-base64';
import { getBase64String } from 'src/utils/get-base64-string';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useAddStudentRegistrationMutation,
  useUpdateParentBankDetailsMutation,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/registration/registration-api';

import { UploadAvatar } from 'src/components/upload';
import { useStandardAddress } from 'src/components/stardard-address';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchemas } from './register-form-validation';
import {
  allFields,
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  documentFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from './register-fields';

import type { IInquiryData } from '../Inquiry';
import type { FieldsType } from './register-fields';

const steps = [
  'General',
  'Documents',
  'Family Information',
  'Communication',
  // 'Account Detail',
  'Additional Details',
  'Medical Records',
  'Previous School Details',
  'Parents Bank Details',
];

const RegisterForm = ({
  editData,
  handleClose,
}: {
  editData: null | IInquiryData;
  handleClose: (e: any, isSubmit?: boolean) => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);

  // const [addUser] = useQueryAndMutation({
  //   type: 'mutation',
  //   currentQueryAndMutation: useAddUserMutation,
  //   isThrowError: true,
  // });

  const [addRegistration] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentRegistrationMutation,
  });
  const [updateBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBasicDetailsMutation,
  });
  const [updateFamilyDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFamilyDetailsMutation,
  });
  const [updateCommunicationDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentCommunicationDetailsMutation,
  });
  const [updateMedicalDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMedicalDetailsMutation,
  });
  const [updatePreviousSchoolDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePreviousSchoolDetailsMutation,
  });
  const [updateAdditionDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentAdditionalDetailsMutation,
  });
  const [updateBankDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateParentBankDetailsMutation,
  });

  const handleGeneralFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        // let res = null;

        // if (!values.userId && !editData?.studentBasicDetails?.userId) {
        //   res = await addUser({
        //     userName: `${values.firstName}${values.lastName}`,
        //     name: values.firstName,
        //     surname: values.lastName,
        //     email: values.email,
        //     phoneNumber: values.mobileNo,
        //     isActive: true,
        //     lockoutEnabled: true,
        //     roleNames: [],
        //     password: 'Test@123',
        //   }).unwrap();

        //   formik.setFieldValue('userId', res?.id);
        // }
        if (editData) {
          await updateBasicDetails({
            id: editData?.id || values?.id,
            body: {
              // userId: editData?.studentBasicDetails?.userId || values.userId || res?.id,
              profilePicture: values.photo ? getBase64String(values.photo) : '',
              aadhaarNo: String(values.adharNo),
              religion: values.religion,
              familyCast: values.familyCast,
              castType: values.castCategory,
              motherTongue: values.motherTongue,
              nationality: values.nationality,
              birthPlace: values.birthPlace,
              temporaryGr: values.temporaryGr,
              remarks: values.remarks,
            },
          }).unwrap();
        } else {
          const resp = await addRegistration({
            formNumber: values.formNo,
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            previousSchoolName: values.previousSchool,

            dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
            genderType: values.gender,
            parentContactNumber: values.mobileNo,
            alternativeContactNumber: values.alternativeContactNumber,

            academicYearId: values.academicYear,
            educationBoardId: values.board,
            educationMediumId: values.medium,
            standardId: values.class,
            // userId: values.userId || res?.id,
            profilePicture: values.photo ? getBase64String(values.photo) : '',
            mobileNo: values.mobileNo,
            email: values.email,
            aadhaarNo: String(values.adharNo),
            religion: values.religion,
            familyCast: values.familyCast,
            castType: values.castCategory,
            motherTongue: values.motherTongue,
            nationality: values.nationality,
            birthPlace: values.birthPlace,
            temporaryGr: values.temporaryGr,
            remarks: values.remarks,
          }).unwrap();
          formik.setFieldValue('id', resp?.id);
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    [addRegistration, editData, updateBasicDetails]
  );
  const handleFamilyFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateFamilyDetails({
          id: editData?.id || values?.id,
          body: {
            fatherDetails: {
              name: values.fatherName,
              dateOfBirth: dateConvertor(values.fatherDob?.format(dateFormat) || '') || '',
              occupation: values.fatherOccupation,
              qualification: values.fatherQualification,
              contactNo: values.fatherContactNo,
              email: values.fatherEmail,
              passOutYear: values.fatherPassOutYear,
              officeNo: values.fatherOfficeNo,
              officeAddress: values.fatherOfficeAddress,
              designation: values.fatherDesignation,
              organisation: values.fatherOrganization,
              aadhaarNo: String(values.fatherAadharNo),
              remarks: values.fatherRemarks,
              address: values.fatherAddress,
            },
            motherDetails: {
              name: values.motherName,
              dateOfBirth: dateConvertor(values.motherDob?.format(dateFormat) || '') || '',
              occupation: values.motherOccupation,
              qualification: values.motherQualification,
              contactNo: values.motherContactNo,
              email: values.motherEmail,
              passOutYear: values.motherPassOutYear,
              officeNo: values.motherOfficeNo,
              officeAddress: values.motherOfficeAddress,
              designation: values.motherDesignation,
              organisation: values.motherOrganization,
              aadhaarNo: String(values.motherAadharNo),
              remarks: values.motherRemarks,
              address: values.motherAddress,
            },
            guardianDetails: {
              name: values.guardianName,
              dateOfBirth: dateConvertor(values.guardianDob?.format(dateFormat) || '') || '',
              occupation: values.guardianOccupation,
              qualification: values.guardianQualification,
              contactNo: values.guardianContactNo,
              email: values.guardianEmail,
              passOutYear: values.guardianPassOutYear,
              officeNo: values.guardianOfficeNo,
              officeAddress: values.guardianOfficeAddress,
              designation: values.guardianDesignation,
              organisation: values.guardianOrganization,
              aadhaarNo: String(values.guardianAadharNo),
              remarks: values.guardianRemarks,
              address: values.guardianAddress,
            },
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateFamilyDetails]
  );
  const handleCommunicationFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateCommunicationDetails({
          id: editData?.id || values?.id,
          body: {
            primaryContactNo: values.primaryContactNumber,
            parentContactNo: values.parentContactNumber,
            parentEmail: values.parentEmail,
            studentContactNo: values.studentContactNo,
            studentEmail: values.studentEmail,
            whatsAppNo: values.whatsAppContactNo,
            localAddress: values.localAddress,
            localState: values.localState,
            localCity: values.localCity,
            localPinCode: values.localPincode,
            permanentAddress: values.permanentAddress,
            permanentState: values.permanentState,
            permanentCity: values.permanentCity,
            permanentPinCode: values.permanentPincode,
            emergencyAddress: values.emergencyAddress,
            emergencyState: values.emergencyState,
            emergencyCity: values.emergencyCity,
            emergencyPinCode: values.emergencyPincode,
            remarks: values.remarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateCommunicationDetails]
  );
  const handleMedicalFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateMedicalDetails({
          id: editData?.id || values?.id,
          body: {
            weight: values.weight,
            height: values.height,
            bodyMassIndex: values.bmi,
            haemoglobin: values.haemoglobin,
            allergies: values.allergies,
            covidVaccination: values.covidVaccination,
            childImmunisation: values.childImmunisation,
            immunisationRemarks: values.immunisationRemarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateMedicalDetails]
  );
  const handlePreviousSchoolFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updatePreviousSchoolDetails({
          id: editData?.id || values?.id,
          body: {
            previousSchoolName: values.schoolName,
            previousSchoolAddress: values.schoolAddress,
            previousSchoolBoard: values.schoolBoard,
            previousSchoolMedium: values.schoolMedium,
            tcNo: values.tcNumber,
            lastClassPassed: String(values.lastClassPassed),
            percentage: values.percentage,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updatePreviousSchoolDetails]
  );

  const handleBankDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateBankDetails({
          id: editData?.id || values?.id,
          body: {
            bankName: values.bankName,
            branchName: values.branchName,
            accountHolderName: values.accountHolderName,
            accountNumber: values.accountNo,
            ifscCode: values.ifscCode,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateBankDetails]
  );
  const handleAdditionalDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateAdditionDetails({
          id: editData?.id || values?.id,
          body: {
            category: values.category,
            rightToEducation: values.RTE,
            bplStudent: values.bplStudent,
            bplCardNo: values.bplCardNo,
            personWithDisability: values.personWithDisability,
            secondLanguage: values.secondLanguage,
            emergencyContactNo: values.emergencyContactNo,
            singleParentChild: values.singleParentChild,
            singleChild: values.singleChild,
            sponsorName: values.sponsorName,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.id, updateAdditionDetails]
  );

  console.log(validationSchemas[activeStep], 'sdfdsfdsfsdfds========');
  const { RenderCountry, RenderState, RenderCity } = useStandardAddress();
  return (
    <CustomStepperWithFormik
      onStepClick={(index) => {
        if (editData) {
          setActiveStep(index);
        }
      }}
      scrollbarHeight="55vh"
      initialValues={{
        ...generalFieldsInitialValues(editData),
        ...documentFieldsInitialValues(editData),
        ...familyFieldsInitialValues(editData),
        ...CommunicationFieldsInitialValues(editData),
        ...additionalDetailsInitialValues(editData),
        ...medicalFieldsInitialValues(editData),
        ...previousSchoolFieldsInitialValues(editData),
        ...bankDetailsInitialValues(editData),
      }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={validationSchemas[activeStep]}
      handleNext={async (isLastStep, values, formik, setIsLoading) => {
        setIsLoading(true);
        try {
          if (activeStep === 0) {
            await handleGeneralFormSubmit(values, formik);
          } else if (activeStep === 2) {
            await handleFamilyFormSubmit(values, formik);
          } else if (activeStep === 3) {
            await handleCommunicationFormSubmit(values, formik);
          } else if (activeStep === 4) {
            await handleAdditionalDetailsFormSubmit(values, formik);
          } else if (activeStep === 5) {
            await handleMedicalFormSubmit(values, formik);
          } else if (activeStep === 6) {
            await handlePreviousSchoolFormSubmit(values, formik);
          } else if (activeStep === 7) {
            await handleBankDetailsFormSubmit(values, formik);
          }
          if (!isLastStep) {
            setActiveStep(activeStep + 1);
          } else {
            handleClose(null, true);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }}
      renderItem={({ activeStep: step, formik, isBackClick }: any) => (
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <FormSlider step={step} steps={steps} isBackClick={isBackClick}>
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
              <Grid container spacing={2.5}>
                {allFields[step].map((field: FieldsType) => (
                  <Grid item xs={4} md={4} key={field.name} {...(field.gridProps || {})}>
                    {field.renderComp ? (
                      field.renderComp({
                        formik,
                        field,
                        isEdit: true,
                        RenderCountry,
                        RenderState,
                        RenderCity,
                      })
                    ) : field.type === 'date' ? (
                      <DatePicker
                        label={field.label}
                        name={field.name}
                        value={formik.values[field.name]}
                        format="DD/MM/YYYY"
                        onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                        slotProps={{
                          textField: {
                            placeholder: field.placeholder,
                            fullWidth: true,
                            size: 'small',
                            helperText: formik.touched[field.name] && formik.errors[field.name],
                            error: formik.touched[field.name] && Boolean(formik.errors[field.name]),
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
                        // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                        {...((typeof field?.otherProps === 'function'
                          ? field?.otherProps({ formik })
                          : field?.otherProps) || {})}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </FormSlider>
        </BackPopUpChecked>
      )}
    />
  );
};

export default RegisterForm;

const FormSlider = ({
  step,
  steps: allStep,
  children,
  isBackClick,
}: {
  step: number;
  steps: any[];
  children?: any;
  isBackClick: boolean;
}) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%' }}>
      {allStep.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction={isBackClick ? 'right' : 'left'}
              key={index}
            >
              {children}
            </Slide>
          )
      )}
    </Box>
  );
};
