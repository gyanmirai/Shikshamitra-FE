import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { Grid, Alert, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
  useGetStudentCommunicationDetailsQuery,
  useUpdateStudentMedicalDetailsMutation,
  useUpdatePreviousSchoolDetailsMutation,
  useUpdateStudentAdditionalDetailsMutation,
  useUpdateStudentCommunicationDetailsMutation,
} from 'src/redux/student/records/student-profile-information-api';

import { familyFields } from './form-fields/register-fields';
import { profileSectionPayload } from './profile-section-payload';
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
  refetch,
}: StudentInformationFormProps) => {
  const [saveError, setSaveError] = useState<{ tabIndex: number; message: string } | null>(null);
  const [updateBasicDetails] = useUpdateBasicDetailsMutation();
  const [updateFamilyDetails] = useUpdateFamilyDetailsMutation();
  const [updateCommunicationDetails] = useUpdateStudentCommunicationDetailsMutation();
  const [updateAdditionalDetails] = useUpdateStudentAdditionalDetailsMutation();
  const [updateMedicalDetails] = useUpdateStudentMedicalDetailsMutation();
  const [updatePreviousSchoolDetails] = useUpdatePreviousSchoolDetailsMutation();
  const [updateBankDetails] = useUpdateParentBankDetailsMutation();
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

  const initialValues = useMemo<Record<string, any>>(() => {
    switch (tabIndex) {
      case 0:
        return generalFieldsInitialValues(basicDetails?.data);
      case 1:
        return familyFieldsInitialValues(familyDetails?.data);
      case 2:
        return CommunicationFieldsInitialValues(studentCommunicationDetails?.data);
      case 3:
        return additionalDetailsInitialValues(studentAdditionalDetails?.data);
      case 4:
        return medicalFieldsInitialValues(studentMedicalDetails?.data);
      case 5:
        return previousSchoolFieldsInitialValues(previousSchoolDetails?.data);
      case 6:
        return bankDetailsInitialValues(parentBankDetails?.data);
      default:
        return {};
    }
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
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const studentId = editData?.studentId;
      if (!studentId) return;
      const sources = [
        basicDetails?.data,
        familyDetails?.data,
        studentCommunicationDetails?.data,
        studentAdditionalDetails?.data,
        studentMedicalDetails?.data,
        previousSchoolDetails?.data,
        parentBankDetails?.data,
      ];
      const updateSection = [
        updateBasicDetails,
        updateFamilyDetails,
        updateCommunicationDetails,
        updateAdditionalDetails,
        updateMedicalDetails,
        updatePreviousSchoolDetails,
        updateBankDetails,
      ][tabIndex];
      if (!updateSection || !sources[tabIndex]) return;
      setSaveError(null);
      try {
        await updateSection({
          id: studentId,
          body: profileSectionPayload(tabIndex, values, sources[tabIndex]),
        }).unwrap();
        refetch?.();
      } catch (error: any) {
        const validationErrors = Object.values(error?.data?.errors ?? {}).flat();
        setSaveError({
          tabIndex,
          message:
            error?.data?.error?.message ??
            error?.data?.message ??
            (validationErrors.length ? validationErrors.join(' ') : null) ??
            'Could not save student information. Please try again.',
        });
        throw error;
      }
    },
  });

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
      {saveError?.tabIndex === tabIndex && (
        <Grid size={12}>
          <Alert severity="error">{saveError.message}</Alert>
        </Grid>
      )}
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
                  helperText: formik.touched[field.name] ? String(formik.errors[field.name] ?? '') : '',
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
              helperText={formik.touched[field.name] ? String(formik.errors[field.name] ?? '') : ''}
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
