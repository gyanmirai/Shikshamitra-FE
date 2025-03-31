import type { FormikValues } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Button, TextField, DialogActions } from '@mui/material';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateStudentInquiryMutation } from 'src/redux/student/inquiry/inquiry-api';

import { Scrollbar } from 'src/components/scrollbar';

import type { IInquiryData } from '../Inquiry';

interface IssueRegistrationFormProps {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryData;
}

const IssueRegistrationForm: React.FC<IssueRegistrationFormProps> = ({ handleClose, editData }) => {
  const initialValues = {
    formNumber: '',
  };
  console.log('editData---', editData);

  const [updateInquiry, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentInquiryMutation,
  });

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object({
          formNumber: Yup.string().required('Form Number is required'),
        })}
        onSubmit={async (
          values: FormikValues,
          { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
        ) => {
          try {
            if (editData) {
              await updateInquiry({
                id: editData?.id,
                body: {
                  firstName: editData.firstName,
                  middleName: editData.middleName,
                  lastName: editData.lastName,
                  formNumber: values.formNumber,
                  previousSchoolName: editData.previousSchoolName,
                  dateOfBirth:
                    dateConvertor(dayjs(editData.dateOfBirth)?.format(dateFormat) || '') || '',
                  // age: editData.age,
                  dateOfInquiry:
                    dateConvertor(dayjs(editData.dateOfInquiry)?.format(dateFormat) || '') || '',
                  genderType: editData.genderType,
                  parentContactNumber: editData.parentContactNumber,
                  alternativeContactNumber: editData.alternativeContactNumber,
                  city: editData.city,
                  state: editData.state,
                  pinCode: editData.pinCode,
                  address: editData.address,
                  inquiryStatusType: 0,
                  educationMediumId: editData.educationMediumId,
                  academicYearId: editData.academicYearId,
                  standardId: editData.standardId,
                  inquiryPreferenceId: editData.inquiryPreferenceId,
                  educationBoardId: editData.educationBoardId,
                },
              }).unwrap();
            }
            handleClose(null, true);
          } catch (error) {
            console.error('Error:', error);
          }
        }}
      >
        {({
          errors,
          touched,
          handleChange,
          isSubmitting,
          setFieldValue,
          values,
          handleSubmit,
          handleBlur,
        }) => (
          <Box
            component={Form}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            onSubmit={handleSubmit}
          >
            <Scrollbar
              sx={{
                p: 2,
                height: '100%',
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="formNumber"
                    label="Form Number"
                    error={touched.formNumber && Boolean(errors.formNumber)}
                    helperText={touched.formNumber && errors.formNumber}
                    value={values.formNumber}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Scrollbar>
            <DialogActions sx={{ flexShrink: 0, p: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <LoadingButton loading={isUpdateLoading} type="submit" variant="contained">
                Submit
              </LoadingButton>
            </DialogActions>
          </Box>
        )}
      </Formik>
    </Card>
  );
};

export default IssueRegistrationForm;
