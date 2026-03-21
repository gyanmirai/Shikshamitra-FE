import type { FormikValues } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Card, Grid, Button, TextField, DialogActions } from '@mui/material';
import { useRegistrationFormDetailsMutation } from 'src/redux/student/inquiry/inquiry-api';

interface IssueRegistrationFormProps {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any;
}

const IssueRegistrationForm: React.FC<IssueRegistrationFormProps> = ({ handleClose, editData }) => {
  // Fixed registration form amount in rupees
  const amount = 100;

  // Initial form values
  const initialValues = {
    formNumber: '', // Student registration form number
    amount, // Registration fee amount
  };

  // Mutation hook for updating student inquiry
  // Returns updateInquiry function and loading state
  const [registrationFormIssue, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRegistrationFormDetailsMutation,
    popupConfig: { error: false },
  });

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object({
          formNumber: Yup.string()
            .trim()
            .required('Form number is required')
            .min(3, 'Form number must be between 3 and 50 characters')
            .max(50, 'Form number must be between 3 and 50 characters')
            .matches(
              /^[A-Z0-9-]+$/,
              'Form number must contain only uppercase letters, numbers, and hyphens'
            ),
          amount: Yup.number().required('Amount is required'),
        })}
        onSubmit={async (
          values: FormikValues,
          { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
        ) => {
          try {
            if (editData) {
              await registrationFormIssue({
                studentId: editData.studentId,
                body: {
                  formNumber: values.formNumber,
                  amount: values.amount,
                },
              }).unwrap();
            }
            handleClose(null, true);
            shikshaMitraToast.success({
              message: `Registration Form Issued Successfully for ${editData.studentName} on ${dayjs().format('DD-MM-YYYY')}.`,
            });
          } catch (error: any) {
            console.error('Error:', error);
            const errorData = error?.data?.errors || error?.data?.error;
            if (errorData) {
              if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                const errorMessages = Object.values(errorData).flat().join(', ');
                shikshaMitraToast.error({ message: errorMessages });
              } else if (typeof errorData === 'string') {
                shikshaMitraToast.error({ message: errorData });
              }
            } else {
              shikshaMitraToast.error({ message: error?.data?.message || 'Something went wrong' });
            }
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
                <Grid size={12}>
                  <ShakingTextField error={!!(touched.formNumber && errors.formNumber) || false}>
                    <TextField
                      fullWidth
                      size="small"
                      name="formNumber"
                      label="Form Number *"
                      error={touched.formNumber && Boolean(errors.formNumber)}
                      helperText={touched.formNumber && errors.formNumber}
                      value={values.formNumber}
                      onChange={(e) => {
                        const uppercaseLettersNumbersHyphens = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9-]/g, '');
                        if (uppercaseLettersNumbersHyphens.length <= 50) {
                          setFieldValue('formNumber', uppercaseLettersNumbersHyphens);
                        }
                      }}
                      inputProps={{ maxLength: 50 }}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={12}>
                  <ShakingTextField error={!!(touched.amount && errors.amount) || false}>
                    <NumericFormatCustom
                      fullWidth
                      size="small"
                      name="amount"
                      label="Amount *"
                      value={values.amount}
                      onChange={(e) => {
                        const amt = +(e.target.value?.match(/\d/g)?.join('') ?? '0');
                        setFieldValue('amount', amt);
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
