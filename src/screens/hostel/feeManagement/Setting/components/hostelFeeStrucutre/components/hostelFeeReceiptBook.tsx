import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, TextField } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { receiptBookValidationSchema } from './validationSchema';

import type { IHostelFeeReceiptBookProps } from '../hostelFeeInterface';

const HostelFeeReceiptBook: React.FC<IHostelFeeReceiptBookProps> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
}) => {
  const formik = useFormik({
    // Initial form field values
    initialValues: {
      receiptBookName: '',
      receiptBookCode: '',
    },
    // Validation schema for form fields
    validationSchema: receiptBookValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      // Log form values for debugging
      console.log('Form Values:', values);
      // TODO: Implement API call or dispatch action to save form data
      // Example: dispatch(setIsChanges(true));
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={3} flexGrow={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <ShakingTextField
              error={formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)}
            >
              <TextField
                size="small"
                fullWidth
                autoFocus
                name="receiptBookName"
                label="Receipt Book Name"
                value={formik.values.receiptBookName}
                onChange={(e) =>
                  formik.setFieldValue('receiptBookName', capitalizeWords(e.target.value))
                }
                onBlur={formik.handleBlur}
                error={formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)}
                helperText={formik.touched.receiptBookName && formik.errors.receiptBookName}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <ShakingTextField
              error={formik.touched.receiptBookCode && Boolean(formik.errors.receiptBookCode)}
            >
              <TextField
                size="small"
                fullWidth
                name="receiptBookCode"
                label="Receipt Book Code"
                value={formik.values.receiptBookCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.receiptBookCode && Boolean(formik.errors.receiptBookCode)}
                helperText={formik.touched.receiptBookCode && formik.errors.receiptBookCode}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
        <SubmitButton type="submit" />
      </Box>
    </form>
  );
};

export default HostelFeeReceiptBook;
