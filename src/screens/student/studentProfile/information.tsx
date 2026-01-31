import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingScreen } from 'src/components/loading-screen';
import { getBase64String } from 'src/utils/get-base64-string';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useUpdateBasicDetailsMutation,
  useUpdateFamilyDetailsMutation,
  useGetStudentMedicalDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useUpdateParentBankDetailsMutation,
  useGetStudentAdditionalDetailsQuery,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentMedicalDetailsMutation,
  useGetStudentCommunicationDetailsQuery,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/registration/registration-api';

import { FormSlider } from '../enrollment/register/register-form';
import { familyFields } from '../enrollment/register/register-fields';
import { generalFormFields } from '../enrollment/register/GeneralFormFields';
import { medicalFields } from '../enrollment/register/render-medical-details';
import { bankDetailsFields } from '../enrollment/register/render-bank-details';
import { communicationFields } from '../enrollment/register/render-communication';
import { previousSchoolFields } from '../enrollment/register/render-previous-details';
import { additionalDetailsFields } from '../enrollment/register/render-additional-details';
import {
  bankDetailsValidation,
  familyFieldsValidation,
  generalFieldValidation,
  previousSchoolValidation,
  medicalDetailsValidations,
  additionalDetailsValidations,
  communicationFieldsValidation,
} from '../enrollment/register/register-form-validation';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from '../enrollment/register/initialvalues';

import type { StudentTabsComponentType } from '.';
import type { FieldsType } from '../enrollment/register/type';

export const fields = [
  generalFormFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'admission', label: 'Family' },
  { value: 'communication', label: 'Communication' },
  { value: 'additionalDetails', label: 'Additional Details' },
  { value: 'medicalRecords', label: 'Medical Records' },
  { value: 'previousSchool', label: 'Prev. School Details' },
  { value: 'bankDetails', label: 'Bank Details' },
];

export const validationSchemas = [
  generalFieldValidation,
  familyFieldsValidation,
  communicationFieldsValidation,
  additionalDetailsValidations,
  medicalDetailsValidations,
  previousSchoolValidation,
  bankDetailsValidation,
];

export function StudentInformation(props: StudentTabsComponentType) {
  const { student, refetch } = props;
  const editData = student;
  const [activeStep, setActiveStep] = useState(0);
  const [isBackClick, setIsBackClick] = useState(false);

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
              academicMediumId: values.medium,
              standardId: values.class,
              formNumber: values.formNo,
            },
          }).unwrap();
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData, updateBasicDetails]
  );

  const handleFamilyFormSubmit = useCallback(
    async (values: any, formik: any) => {
      try {
        await updateFamilyDetails({
          id: editData?.studentId || values?.id,
          body: {
            fatherDetails: {
              fullName: values.fatherName,
              dateOfBirth: values.fatherDob
                ? dateConvertor(values.fatherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.fatherOccupation,
              email: values.fatherEmail,
              contactNo: values.fatherContactNo,
              officeNo: values.fatherOfficeNo,
              qualification: values.fatherQualification,
              yearOfPassing: values.fatherPassOutYear,
              designation: values.fatherDesignation,
              organisation: values.fatherOrganization,
              aadharNo: String(values.fatherAadharNo),
              officeAddress: {
                address1: values.fatherOfficeAddress1,
                address2: values.fatherOfficeAddress2,
                address3: values.fatherOfficeAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.fatherOfficePincode,
              },
              localAddress: {
                address1: values.fatherAddress1,
                address2: values.fatherAddress2,
                address3: values.fatherAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.fatherLocalPincode,
              },
              remarks: values.fatherRemarks,
            },
            motherDetails: {
              fullName: values.motherName,
              dateOfBirth: values.motherDob
                ? dateConvertor(values.motherDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.motherOccupation,
              qualification: values.motherQualification,
              contactNo: values.motherContactNo,
              email: values.motherEmail,
              passOutYear: values.motherPassOutYear,
              officeNo: values.motherOfficeNo,
              officeAddress1: values.motherOfficeAddress1,
              officeAddress2: values.motherOfficeAddress2,
              officeAddress3: values.motherOfficeAddress3,
              designation: values.motherDesignation,
              organisation: values.motherOrganization,
              aadhaarNo: String(values.motherAadharNo),
              remarks: values.motherRemarks,
              officeAddress: {
                address1: values.motherOfficeAddress1,
                address2: values.motherOfficeAddress2,
                address3: values.motherOfficeAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.motherOfficePincode,
              },
              localAddress: {
                address1: values.motherAddress1,
                address2: values.motherAddress2,
                address3: values.motherAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.motherLocalPincode,
              },
            },
            guardianDetails: {
              fullName: values.guardianName,
              dateOfBirth: values.guardianDob
                ? dateConvertor(values.guardianDob?.format(dateFormat) || '') || ''
                : null,
              occupation: values.guardianOccupation,
              qualification: values.guardianQualification,
              contactNo: values.guardianContactNo,
              email: values.guardianEmail,
              passOutYear: values.guardianPassOutYear,
              officeNo: values.guardianOfficeNo,
              officeAddress1: values.guardianOfficeAddress1,
              officeAddress2: values.guardianOfficeAddress2,
              officeAddress3: values.guardianOfficeAddress3,
              designation: values.guardianDesignation,
              organisation: values.guardianOrganization,
              aadhaarNo: String(values.guardianAadharNo),
              remarks: values.guardianRemarks,
              officeAddress: {
                address1: values.guardianOfficeAddress1,
                address2: values.guardianOfficeAddress2,
                address3: values.guardianOfficeAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.guardianOfficePincode,
              },
              localAddress: {
                address1: values.guardianAddress1,
                address2: values.guardianAddress2,
                address3: values.guardianAddress3,
                country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
                state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
                city: values?.city?.name,
                pincode: values.guardianLocalPincode,
              },
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
            localAddress: {
              address1: values.localAddress1,
              address2: values.localAddress2,
              address3: values.localAddress3,
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              city: values?.city?.name,
              pincode: values.localPincode,
            },
            permanentAddress: {
              address1: values.permanentAddress1,
              address2: values.permanentAddress2,
              address3: values.permanentAddress3,
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              city: values?.city?.name,
              pincode: values.permanentPincode,
            },
            emergencyAddress: {
              address1: values.emergencyAddress1,
              address2: values.emergencyAddress2,
              address3: values.emergencyAddress3,
              country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
              state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
              city: values?.city?.name,
              pincode: values.emergencyPincode,
            },
            isPermanentSameAsLocal: values.sameAsLocalForPermanent,
            isEmergencySameAsLocal: values.emergencySameAsLocal,
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
            weightKg: +values.weight,
            heightCm: +values.height,
            bodyMassIndex: +values.bmi,
            hemoglobin: +values.haemoglobin,
            allergies: values.allergies,
            covidVaccinationDoses: values.covidVaccination,
            childImmunization: values.childImmunisation,
            immunizationRemarks: values.immunisationRemarks,
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
            schoolName: values.schoolName,
            schoolAddress: values.schoolAddress,
            board: values.schoolBoard,
            medium: values.schoolMedium,
            tcNumber: values.tcNumber,
            lastClassAttended: String(values.lastClassPassed),
            percentageObtained: +values.percentage,
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
            isBPLStudent: values.bplStudent,
            bplCardNo: values.bplCardNo,
            secondLanguage: values.secondLanguage,
            haveDisability: values.personWithDisability,
            emergencyRelativeName: values.relationName,
            emergencyRelation: values.relation,
            emergencyContactNo: values.emergencyContactNo,
            isSingleChild: values.singleChild,
            isSingleParentChild: values.singleParentChild,
          },
        }).unwrap();
      } catch (error) {
        throw new Error(error);
      }
    },
    [editData?.studentId, updateAdditionDetails]
  );

  const steps = useMemo(() => TABS.map((tab) => tab.label), []);

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
        if (activeStep === 0) {
          await handleGeneralFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Student details updated successfully' });
        } else if (activeStep === 1) {
          await handleFamilyFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Family details updated successfully' });
        } else if (activeStep === 2) {
          await handleCommunicationFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Communication details updated successfully' });
        } else if (activeStep === 3) {
          await handleAdditionalDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Additional details updated successfully' });
        } else if (activeStep === 4) {
          await handleMedicalFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Medical details updated successfully' });
        } else if (activeStep === 5) {
          await handlePreviousSchoolFormSubmit(values, formik);
          shikshaMitraToast.success({ message: 'Previous school details updated successfully' });
        } else if (activeStep === 6) {
          await handleBankDetailsFormSubmit(values, formik);
          shikshaMitraToast.success({
            message: `Registration for ${student?.firstName} ${student?.lastName} updated successfully`,
          });
        }

        if (!isSaveButton && !isLastStep) {
          setActiveStep((prev) => prev + 1);
          setIsBackClick(false);
        }

        refetch?.();
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
      handleCommunicationFormSubmit,
      handleFamilyFormSubmit,
      handleGeneralFormSubmit,
      handleMedicalFormSubmit,
      handlePreviousSchoolFormSubmit,
      refetch,
      student?.firstName,
      student?.lastName,
    ]
  );

  const initialValues = useMemo(
    () => ({
      ...generalFieldsInitialValues(student),
      ...familyFieldsInitialValues(student),
      ...CommunicationFieldsInitialValues(student),
      ...additionalDetailsInitialValues(student),
      ...medicalFieldsInitialValues(student),
      ...previousSchoolFieldsInitialValues(student),
      ...bankDetailsInitialValues(student),
    }),
    [student]
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Scrollbar>
        <Card sx={{ px: 0 }}>
          <CustomStepperWithFormik
            initialValues={initialValues}
            steps={steps}
            viewMode="vertical"
            activeStep={activeStep}
            handleBack={() => {
              setActiveStep((prev) => prev - 1);
              setIsBackClick(true);
            }}
            validationSchema={validationSchemas[activeStep]}
            onStepClick={(step) => {
              if (step < activeStep) setIsBackClick(true);
              else setIsBackClick(false);
              setActiveStep(step);
            }}
            isDisabledLabel={false}
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
              <StudentInformationForm
                formik={formik}
                step={step}
                editData={editData}
                isEdit
                isBackClick={isBackClick}
              />
            )}
          />
        </Card>
      </Scrollbar>
    </Box>
  );
}

const StudentInformationForm = ({ formik, step, editData, isEdit, isBackClick }: any) => {
  console.log('editData', editData);
  const initializedStepsRef = useRef<Record<number, boolean>>({});

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
      skip: !(editData?.studentId && step === 1),
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
        skip: !(editData?.studentId && step === 2),
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
        skip: !(editData?.studentId && step === 3),
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
        skip: !(editData?.studentId && step === 4),
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
        skip: !(editData?.studentId && step === 5),
      },
    });

  const { data: parentBankDetails, isLoading: parentBankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentBankDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && step === 6),
    },
  });

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;
    if (basicDetails?.data && step === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...generalFieldsInitialValues(basicDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (familyDetails?.data && step === 1) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...familyFieldsInitialValues(familyDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (studentCommunicationDetails?.data && step === 2) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...CommunicationFieldsInitialValues(studentCommunicationDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (studentAdditionalDetails?.data && step === 3) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...additionalDetailsInitialValues(studentAdditionalDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (studentMedicalDetails?.data && step === 4) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...medicalFieldsInitialValues(studentMedicalDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (previousSchoolDetails?.data && step === 5) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...previousSchoolFieldsInitialValues(previousSchoolDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    } else if (parentBankDetails?.data && step === 6) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...bankDetailsInitialValues(parentBankDetails?.data),
      }));
      initializedStepsRef.current[step] = true;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails?.data,
    familyDetails?.data,
    parentBankDetails?.data,
    previousSchoolDetails?.data,
    step,
    studentAdditionalDetails?.data,
    studentCommunicationDetails?.data,
    studentMedicalDetails?.data,
  ]);

  return basicDetailsLoading ||
    familyDetailsLoading ||
    studentCommunicationDetailsLoading ||
    studentAdditionalDetailsLoading ||
    studentMedicalDetailsLoading ||
    previousSchoolDetailsLoading ||
    parentBankDetailsLoading ? (
    <LoadingScreen />
  ) : (
    <FormSlider
      steps={TABS}
      isBackClick={isBackClick}
      step={step}
      containerProps={{
        sx: {
          p: 0,
        },
      }}
    >
      <Grid container spacing={2} p={2}>
        {fields[step].map((field: FieldsType) => (
          <Grid
            size={{
              xs: [1].includes(step) ? 12 : 3,
              md: [1].includes(step) ? 12 : 3,
            }}
            key={field.name}
            {...(field.gridProps || {})}
          >
            {field.renderComp ? (
              field.renderComp({
                formik,
                field,
                isEdit,
                isMainForm: false,
                editData,
              })
            ) : field.type === 'date' ? (
              <DatePicker
                label={field.label}
                name={field.name}
                value={formik.values[field.name]}
                format="DD-MM-YYYY"
                onChange={(newValue) => formik.setFieldValue(field.name, newValue)}
                disabled={!isEdit}
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
                disabled={!isEdit}
                // sx={{ maxWidth: '200px', width: '100%', ...(field?.sx || {}) }}
                {...(field?.otherProps || {})}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </FormSlider>
  );
};
