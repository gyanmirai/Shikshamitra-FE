import type { BoxProps } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useCallback } from 'react';
import { Category } from 'src/enums/studnet-category';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Grid, Slide, TextField } from '@mui/material';
import { getBase64String } from 'src/utils/get-base64-string';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useGetStudentMedicalDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useAddStudentRegistrationMutation,
  useUpdateParentBankDetailsMutation,
  useGetStudentAdditionalDetailsQuery,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,
  useGetStudentCommunicationDetailsQuery,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/registration/registration-api';

import { allFields } from './register-fields';
import { validationSchemas } from './register-form-validation';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  documentFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from './initialvalues';

import type {
  FieldsType,
  IBankDetailsResponse,
  IPreviousSchoolResponse,
  IFamilyInformationResponse,
  IGeneralInformationResponse,
  IMedicalInformationResponse,
  IAdditionalInformationResponse,
  ICommunicationInformationResponse,
} from './type';

const steps = [
  'General',
  'Documents',
  'Family',
  'Communication',
  // 'Account Detail',
  'Additional Details',
  'Medical Records',
  'Prev. School Details',
  'Bank Details',
];

const RegisterForm = ({
  editData,
  handleClose,
  isComeFromIssueForm = false,
}: {
  editData:
    | null
    | IGeneralInformationResponse
    | IBankDetailsResponse
    | IPreviousSchoolResponse
    | IFamilyInformationResponse
    | ICommunicationInformationResponse
    | IAdditionalInformationResponse
    | IMedicalInformationResponse;
  handleClose: (e: any, isSubmit?: boolean) => void;
  isComeFromIssueForm?: boolean;
}) => {
  const [activeStep, setActiveStep] = useState(0);

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
        if (editData) {
          await updateBasicDetails({
            id: editData?.studentId || values?.id,
            body: {
              firstName: values.firstName,
              middleName: values.middleName,
              lastName: values.lastName,
              dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
              gender: values.gender,
              profilePictureUrl: values.photo ? getBase64String(values.photo) : '',
              primaryContactNo: values.primaryContactNumber,
              secondaryContactNo: values.secondaryContactNumber,
              email: values.email,
              aadharNo: String(values.adharNo),
              apparId: values.apparId,
              panNo: values.panNo,
              religion: values.religion,
              familyCast: values.familyCast,
              castCategory: values.castCategory,
              nationality: values.nationality,
              birthPlace: values.birthPlace,
              motherTongue: values.motherTongue,
              adderss1: values.addressLine1,
              address2: values.addressLine2,
              address3: values.addressLine3,
              city: values?.city?.name,
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              pincode: String(values.pinCode),
              previousSchool: values.previousSchool,
              lastClassPassed: values.lastClassPassed,
              educationMediumId: values.medium,
              standardId: values.class,

              formNumber: values.formNo,
              // academicYearId: values.academicYear,
              // educationBoardId: values.board,
            },
          }).unwrap();
          // if (isComeFromIssueForm) {
          //   await moveToRegistration(editData?.id);
          //   // router.push('/student/enrollment/registration');
          // }
        } else {
          const resp = await addRegistration({
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            dateOfBirth: dateConvertor(values.dob?.format(dateFormat) || '') || '',
            gender: values.gender,
            profilePictureUrl: values.photo ? getBase64String(values.photo) : '',
            primaryContactNo: values.primaryContactNumber,
            secondaryContactNo: values.secondaryContactNumber,
            email: values.email,
            aadharNo: String(values.adharNo),
            apparId: values.apparId,
            panNo: values.panNo,
            religion: values.religion,
            familyCast: values.familyCast,
            castCategory: values.castCategory,
            nationality: values.nationality,
            birthPlace: values.birthPlace,
            motherTongue: values.motherTongue,
            adderss1: values.addressLine1,
            address2: values.addressLine2,
            address3: values.addressLine3,
            city: values?.city?.name,
            state: values?.state?.name,
            country: values?.country?.name,
            pincode: String(values.pinCode),
            previousSchool: values.previousSchool,
            lastClassPassed: values.lastClassPassed,
            educationMediumId: values.medium,
            standardId: values.class,

            formNumber: values.formNo,
            // academicYearId: values.academicYear,
            // educationBoardId: values.board,
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
          id: editData?.studentId || values?.id,
          body: {
            fatherDetails: {
              name: values.fatherName,
              dateOfBirth: values.fatherDob
                ? dateConvertor(values.fatherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.fatherOccupation,
              qualification: values.fatherQualification,
              contactNo: values.fatherContactNo,
              email: values.fatherEmail,
              passOutYear: +values.fatherPassOutYear,
              officeNo: values.fatherOfficeNo,
              officeAddress1: values.fatherOfficeAddress1,
              officeAddress2: values.fatherOfficeAddress2,
              officeAddress3: values.fatherOfficeAddress3,
              designation: values.fatherDesignation,
              organisation: values.fatherOrganization,
              aadhaarNo: String(values.fatherAadharNo),
              remarks: values.fatherRemarks,
              address1: values.fatherAddress1,
              address2: values.fatherAddress2,
              address3: values.fatherAddress3,
              officeCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              officeState: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              officeCity: values?.city?.name,
              officePincode: values.fatherOfficePincode,
              localCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              localState: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              localCity: values?.city?.name,
              localPincode: values.fatherLocalPincode,
            },
            motherDetails: {
              name: values.motherName,
              dateOfBirth: values.motherDob
                ? dateConvertor(values.motherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.motherOccupation,
              qualification: values.motherQualification,
              contactNo: values.motherContactNo,
              email: values.motherEmail,
              passOutYear: +values.motherPassOutYear,
              officeNo: values.motherOfficeNo,
              officeAddress1: values.motherOfficeAddress1,
              officeAddress2: values.motherOfficeAddress2,
              officeAddress3: values.motherOfficeAddress3,
              designation: values.motherDesignation,
              organisation: values.motherOrganization,
              aadhaarNo: String(values.motherAadharNo),
              remarks: values.motherRemarks,
              officeCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              officeState: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              officeCity: values?.city?.name,
              officePincode: values.motherOfficePincode,
              localCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              Slocaltate: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              localCity: values?.city?.name,
              localPincode: values.motherLocalPincode,
            },
            guardianDetails: {
              name: values.guardianName,
              dateOfBirth: values.guardianDob
                ? dateConvertor(values.guardianDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.guardianOccupation,
              qualification: values.guardianQualification,
              contactNo: values.guardianContactNo,
              email: values.guardianEmail,
              passOutYear: +values.guardianPassOutYear,
              officeNo: values.guardianOfficeNo,
              officeAddress1: values.guardianOfficeAddress1,
              officeAddress2: values.guardianOfficeAddress2,
              officeAddress3: values.guardianOfficeAddress3,
              designation: values.guardianDesignation,
              organisation: values.guardianOrganization,
              aadhaarNo: String(values.guardianAadharNo),
              remarks: values.guardianRemarks,
              address1: values.guardianAddress1,
              address2: values.guardianAddress2,
              address3: values.guardianAddress3,
              officeCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              officeState: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              officeCity: values?.city?.name,
              officePincode: values.guardianOfficePincode,
              localCountry: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              localState: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              localCity: values?.city?.name,
              localPincode: values.guaediannLocalPincode,
            },
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateFamilyDetails]
  );
  const handleCommunicationFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateCommunicationDetails({
          id: editData?.studentId || values?.id,
          body: {
            primaryContactNo: values.commPrimaryContactNumber,
            parentContactNo: values.parentContactNumber,
            parentEmail: values.parentEmail,
            studentContactNo: values.studentContactNo,
            studentEmail: values.studentEmail,
            whatsAppNo: values.whatsAppContactNo,
            localAddress: values.localAddress,
            localCountryName: values?.localCountry?.name || '',
            localCountryIsoCode: values?.localCountry?.isoCode || '',
            localStateName: values?.localState?.name || '',
            localStateIsoCode: values?.localState?.isoCode || '',
            localCity: values.localCity.name,
            localPinCode: values.localPincode,
            permanentAddress: values.permanentAddress,
            permanentCountryName: values?.permanentCountry?.name || '',
            permanentCountryIsoCode: values?.permanentCountry?.isoCode || '',

            permanentStateName: values?.permanentState?.name || '',
            permanentStateIsoCode: values?.permanentState?.isoCode || '',

            permanentCity: values?.permanentCity?.name,
            permanentPinCode: values.permanentPincode,
            emergencyAddress: values.emergencyAddress,
            emergencyStateName: values.emergencyState?.name || '',
            emergencyStateIsoCode: values.emergencyState?.isoCode || '',
            emergencyCountryName: values.emergencyCountry?.name || '',
            emergencyCountryIsoCode: values.emergencyCountry?.isoCode || '',

            emergencyCity: values?.emergencyCity?.name,
            emergencyPinCode: values.emergencyPincode,
            remarks: values.remarks,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateCommunicationDetails]
  );
  const handleMedicalFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateMedicalDetails({
          id: editData?.studentId || values?.id,
          body: {
            weight: +values.weight,
            height: +values.height,
            bodyMassIndex: +values.bmi,
            haemoglobin: +values.haemoglobin,
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
    [editData?.studentId, updateMedicalDetails]
  );
  const handlePreviousSchoolFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updatePreviousSchoolDetails({
          id: editData?.studentId || values?.id,
          body: {
            previousSchoolName: values.schoolName,
            previousSchoolAddress: values.schoolAddress,
            previousSchoolBoard: values.schoolBoard,
            previousSchoolMedium: values.schoolMedium,
            tcNo: values.tcNumber,
            lastClassPassed: String(values.lastClassPassed),
            percentage: +values.percentage,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updatePreviousSchoolDetails]
  );

  const handleBankDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateBankDetails({
          id: editData?.studentId || values?.id,
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
    [editData?.studentId, updateBankDetails]
  );
  const handleAdditionalDetailsFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateAdditionDetails({
          id: editData?.studentId || values?.id,
          body: {
            category: values.category,
            rightToEducation: values.category === Category.Rte,
            bplStudent: values.bplStudent,
            bplCardNo: values.bplCardNo,
            personWithDisability: values.personWithDisability,
            secondLanguage: values.secondLanguage,
            emergencyContactNo: values.emergencyContactNo,
            singleParentChild: values.singleParentChild,
            singleChild: values.singleChild,
            sponsorName: values.sponsorStudent.id,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateAdditionDetails]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          await handleGeneralFormSubmit(values, formik);
          if (!isComeFromIssueForm) {
            shikshaMitraToast.success({
              message: `${values.firstName} ${values.lastName}'s details updated successfully`,
            });
          }
        } else if (activeStep === 2) {
          await handleFamilyFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s family details updated successfully`,
          });
        } else if (activeStep === 3) {
          await handleCommunicationFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s communication details updated successfully`,
          });
        } else if (activeStep === 4) {
          await handleAdditionalDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s additional details updated successfully`,
          });
        } else if (activeStep === 5) {
          await handleMedicalFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s medical details updated successfully`,
          });
        } else if (activeStep === 6) {
          await handlePreviousSchoolFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s previous school details updated successfully`,
          });
        } else if (activeStep === 7) {
          await handleBankDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `${values.firstName} ${values.lastName}'s  Moved to Registration Successfully`,
          });
        }
        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        } else {
          handleClose(null, true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeStep,
      handleAdditionalDetailsFormSubmit,
      handleBankDetailsFormSubmit,
      handleClose,
      handleCommunicationFormSubmit,
      handleFamilyFormSubmit,
      handleGeneralFormSubmit,
      handleMedicalFormSubmit,
      handlePreviousSchoolFormSubmit,
      isComeFromIssueForm,
    ]
  );

  return (
    <CustomStepperWithFormik
      onStepClick={(index) => {
        if (editData) {
          setActiveStep(index);
        }
      }}
      validateOnChange
      initialValues={{
        ...generalFieldsInitialValues(editData as IGeneralInformationResponse),
        ...documentFieldsInitialValues(),
        ...familyFieldsInitialValues(editData as IFamilyInformationResponse),
        ...CommunicationFieldsInitialValues(editData as ICommunicationInformationResponse),
        ...additionalDetailsInitialValues(editData as IAdditionalInformationResponse),
        ...medicalFieldsInitialValues(editData as IMedicalInformationResponse),
        ...previousSchoolFieldsInitialValues(editData as IPreviousSchoolResponse),
        ...bankDetailsInitialValues(editData as IBankDetailsResponse),
      }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={validationSchemas[activeStep]}
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
      renderItem={({ activeStep: step, formik, isBackClick }: any) => (
        <RegisterStepForm
          activeStep={step}
          formik={formik}
          isBackClick={isBackClick}
          editData={editData}
        />
      )}
    />
  );
};

export default RegisterForm;

const RegisterStepForm = ({ activeStep: step, formik, isBackClick, editData }: any) => {
  // const [editData, setEditData] = useState<null | IInquiryResponse>(null);

  // // Custom boolean hook to manage form dialog visibility
  // const formDialog = useBoolean();

  const a = null;

  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 0),
    },
  });

  const { data: familyDetails, isLoading: familyDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFamilyDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 2),
    },
  });
  const { data: studentCommunicationDetails, isLoading: studentCommunicationDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentCommunicationDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 3),
      },
    });

  const { data: studentAdditionalDetails, isLoading: studentAdditionalDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentAdditionalDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 4),
      },
    });

  const { data: studentMedicalDetails, isLoading: studentMedicalDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetStudentMedicalDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 5),
      },
    });
  const { data: previousSchoolDetails, isLoading: previousSchoolDetailsLoading } =
    useQueryAndMutation({
      type: 'query',
      currentQueryAndMutation: useGetPreviousSchoolDetailsQuery,
      params: {
        studentId: editData?.studentId,
      },
      options: {
        skip: !(editData?.studentId && step === 6),
      },
    });

  const { data: parentBankDetails, isLoading: parentBankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentBankDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 7),
    },
  });

  console.log(basicDetails, 'basicDetails');

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <FormSlider step={step} steps={steps} isBackClick={isBackClick}>
        <Grid container spacing={2.5}>
          {allFields[step].map((field: FieldsType) => (
            <Grid size={4} key={field.name} {...(field.gridProps || {})}>
              {field.renderComp ? (
                field.renderComp({
                  formik,
                  field,
                  isEdit: true,
                  isMainForm: true,
                })
              ) : field.type === 'date' ? (
                <DatePicker
                  label={field.label}
                  name={field.name}
                  value={formik.values[field.name]}
                  format="DD-MM-YYYY"
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
                    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                    helperText={formik.touched[field.name] && formik.errors[field.name]}
                    fullWidth
                    // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                    {...((typeof field?.otherProps === 'function'
                      ? field?.otherProps({ formik })
                      : field?.otherProps) || {})}
                  />
                </ShakingTextField>
              )}
            </Grid>
          ))}
        </Grid>
      </FormSlider>
    </BackPopUpChecked>
  );
};

export const FormSlider = ({
  step,
  steps: allStep,
  children,
  isBackClick,
  containerProps = {},
}: {
  step: number;
  steps: any[];
  children?: any;
  isBackClick: boolean;
  containerProps?: BoxProps;
}) => {
  const { sx = {}, ...props } = containerProps;
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', ...sx }} {...props}>
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
