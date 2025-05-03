import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import capitalizeWords from 'src/utils/capitalizeText';

import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { receiptBookValidationSchema } from './validationSchema';

const HostelReceiptBookDialogForDropdown = () => {
  const formik = useFormik({
    // Initial form values for receipt book name and code
    initialValues: {
      receiptBookName: '',
      receiptBookCode: '',
    },
    // Validation schema for form fields
    validationSchema: receiptBookValidationSchema,
    // Handle form submission
    onSubmit: (values) => {
      console.log('Form Values:', values);
      // TODO: Implement API call to save receipt book details
      // TODO: Dispatch action to update store after successful save
      // dispatch(setIsChanges(true));
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
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {}}
          variant="outlined"
        >
          Cancel
        </Button>
        <SubmitButton type="submit" />
      </Box>
    </form>
  );
};

export default HostelReceiptBookDialogForDropdown;
