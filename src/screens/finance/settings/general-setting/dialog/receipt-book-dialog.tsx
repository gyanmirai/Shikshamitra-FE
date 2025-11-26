import React from 'react';
import { useFormik } from 'formik';
import { Box, Grid, TextField } from '@mui/material';
import capitalizeWords from 'src/utils/capitalizeText';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';

import { receiptBookValidationSchema } from '../../receipt-book/validationSchema';

const FinanceReceiptBookDialogForDropdown = () => {
  const formik = useFormik({
    initialValues: {
      receiptBookName: '',
      receiptBookCode: '',
    },
    validationSchema: receiptBookValidationSchema,
    onSubmit: (values) => {
      // You can dispatch your action or API call here
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
          <Grid size={{ xs: 12, sm: 6 }}>
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

          <Grid size={{ xs: 12, sm: 6 }}>
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

export default FinanceReceiptBookDialogForDropdown;
