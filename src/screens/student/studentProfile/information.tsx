import { useRef, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { InformationTabs } from 'src/components/studentProfile/InformationTabs';
import {
  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetStudentMedicalDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
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

  return <InformationTabs student={student} refetch={refetch} />;
}

const StudentInformationForm = ({ formik, step, editData, isEdit, isBackClick }: any) => {
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
