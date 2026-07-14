import { useRef, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetBasicDetailsQuery,
  useGetFamilyDetailsQuery,
  useGetParentBankDetailsQuery,
  useGetStudentMedicalDetailsQuery,
  useGetPreviousSchoolDetailsQuery,
  useGetStudentAdditionalDetailsQuery,
  useGetStudentCommunicationDetailsQuery,
} from 'src/redux/student/registration/registration-api';

import { familyFields } from './form-fields/register-fields';
import { generalFormFields } from './form-fields/GeneralFormFields';
import { medicalFields } from './form-fields/render-medical-details';
import { bankDetailsFields } from './form-fields/render-bank-details';
import { communicationFields } from './form-fields/render-communication';
import { previousSchoolFields } from './form-fields/render-previous-details';
import { additionalDetailsFields } from './form-fields/render-additional-details';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from './form-fields/initialvalues';

import type { FieldsType } from './form-fields/type';

export const fields = [
  generalFormFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];

interface StudentInformationFormProps {
  tabIndex: number;
  editData: any;
  isEdit: boolean;
  refetch?: () => void;
}

export const StudentInformationForm = ({
  tabIndex,
  editData,
  isEdit,
}: StudentInformationFormProps) => {
  const initializedStepsRef = useRef<Record<number, boolean>>({});

  const { data: basicDetails, isLoading: basicDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBasicDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && tabIndex === 0),
    },
  });

  const { data: familyDetails, isLoading: familyDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFamilyDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && tabIndex === 1),
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
        skip: !(editData?.studentId && tabIndex === 2),
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
        skip: !(editData?.studentId && tabIndex === 3),
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
        skip: !(editData?.studentId && tabIndex === 4),
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
        skip: !(editData?.studentId && tabIndex === 5),
      },
    });

  const { data: parentBankDetails, isLoading: parentBankDetailsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetParentBankDetailsQuery,
    params: {
      studentId: editData?.studentId,
    },
    options: {
      skip: !(editData?.studentId && tabIndex === 6),
    },
  });

  // This component is read-only for now - just displays the form fields
  // Form submission will be implemented later
  const formik: any = {
    values: {} as Record<string, any>,
    errors: {} as Record<string, any>,
    touched: {} as Record<string, any>,
    handleChange: () => {},
    handleBlur: () => {},
    setFieldValue: () => {},
  };

  useEffect(() => {
    if (initializedStepsRef.current[tabIndex]) return;

    // Load data based on tab index
    if (basicDetails?.data && tabIndex === 0) {
      const values = generalFieldsInitialValues(basicDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (familyDetails?.data && tabIndex === 1) {
      const values = familyFieldsInitialValues(familyDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (studentCommunicationDetails?.data && tabIndex === 2) {
      const values = CommunicationFieldsInitialValues(studentCommunicationDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (studentAdditionalDetails?.data && tabIndex === 3) {
      const values = additionalDetailsInitialValues(studentAdditionalDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (studentMedicalDetails?.data && tabIndex === 4) {
      const values = medicalFieldsInitialValues(studentMedicalDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (previousSchoolDetails?.data && tabIndex === 5) {
      const values = previousSchoolFieldsInitialValues(previousSchoolDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    } else if (parentBankDetails?.data && tabIndex === 6) {
      const values = bankDetailsInitialValues(parentBankDetails?.data);
      Object.assign(formik.values, values);
      initializedStepsRef.current[tabIndex] = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails?.data,
    familyDetails?.data,
    parentBankDetails?.data,
    previousSchoolDetails?.data,
    tabIndex,
    studentAdditionalDetails?.data,
    studentCommunicationDetails?.data,
    studentMedicalDetails?.data,
  ]);

  if (
    basicDetailsLoading ||
    familyDetailsLoading ||
    studentCommunicationDetailsLoading ||
    studentAdditionalDetailsLoading ||
    studentMedicalDetailsLoading ||
    previousSchoolDetailsLoading ||
    parentBankDetailsLoading
  ) {
    return <LoadingScreen />;
  }

  return (
    <Grid container spacing={2}>
      {fields[tabIndex].map((field: FieldsType) => (
        <Grid
          size={{
            xs: [1].includes(tabIndex) ? 12 : 3,
            md: [1].includes(tabIndex) ? 12 : 3,
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
              {...(field?.otherProps || {})}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
};
