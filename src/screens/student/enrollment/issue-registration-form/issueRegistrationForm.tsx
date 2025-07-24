import type { FormikValues } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Card, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { validatePhoneNumber } from 'src/utils/validate-phone-number';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateStudentInquiryMutation } from 'src/redux/student/inquiry/inquiry-api';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { IInquiryData } from '../Inquiry';

interface IssueRegistrationFormProps {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IInquiryData;
}

const IssueRegistrationForm: React.FC<IssueRegistrationFormProps> = ({ handleClose, editData }) => {
  const initialValues = {
    formNumber: '',
    amount: null,
  };

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
          amount: Yup.number().required('Amount is required'),
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
                  primaryContactNumber: editData.primaryContactNumber,
                  secondaryContactNumber: editData?.secondaryContactNumber
                    ? validatePhoneNumber(editData?.secondaryContactNumber)
                    : '',
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
            shikshaMitraToast.success({
              message: `Registration Form Issued Successfully for ${editData.firstName} ${editData.lastName} on ${dayjs().format('DD-MM-YYYY')}.`,
            });
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
          <>
            <DialogScrollContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ShakingTextField error={!!(touched.formNumber && errors.formNumber) || false}>
                    <TextField
                      fullWidth
                      size="small"
                      name="formNumber"
                      label="Form Number *"
                      error={touched.formNumber && Boolean(errors.formNumber)}
                      helperText={touched.formNumber && errors.formNumber}
                      value={values.formNumber}
                      onChange={handleChange}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12}>
                  <ShakingTextField error={!!(touched.amount && errors.amount) || false}>
                    <NumericFormatCustom
                      fullWidth
                      size="small"
                      name="amount"
                      label="Amount *"
                      value={values.amount}
                      onChange={(e) => {
                        const amount = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                        setFieldValue('amount', amount);
                      }}
                      error={touched.amount && Boolean(errors.amount)}
                      helperText={touched.amount && errors.amount}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </DialogScrollContent>
            <DialogActions>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                variant="outlined"
                onClick={handleClose}
                size="small"
              >
                Cancel
              </Button>
              <LoadingButton
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                loading={isUpdateLoading}
                type="submit"
                variant="contained"
                size="small"
                onClick={(e: any) => {
                  handleSubmit(e);
                }}
              >
                Submit
              </LoadingButton>
            </DialogActions>
          </>
        )}
      </Formik>
    </Card>
  );
};

export default IssueRegistrationForm;
