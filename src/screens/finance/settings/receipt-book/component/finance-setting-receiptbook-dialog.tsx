import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Card, Grid, Button, TextField, Typography } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import AutoFocus from 'src/components/autofocus';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export interface ReceiptBook {
  id: number;
  receiptBookName: string;
  receiptBookCode: string;
  toggle?: boolean;
  action?: string;
}

interface Props {
  data: ReceiptBook;
  onSave: (values: ReceiptBook) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: ReceiptBook[];
}

const validationSchema = Yup.object().shape({
  receiptBookName: Yup.string()
    .trim()
    .required('Receipt Book Name is required')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters'),

  receiptBookCode: Yup.string()
    .trim()
    .required('Receipt Book Code is required')
    .matches(/^[A-Za-z0-9_-]+$/, 'Invalid format')
    .max(20, 'Cannot exceed 20 characters'),
});

const FinanceSettingReceiptbookDialog: React.FC<Props> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
}) => {
  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();
  // Get isChanges state from Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to track and display duplicate receipt book name error
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Memoized initial values for the form based on whether editing existing or creating new
  const initialValues = useMemo<ReceiptBook>(
    () => ({
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      receiptBookName: isEdit ? (data.receiptBookName ?? '') : '',
      receiptBookCode: isEdit ? (data.receiptBookCode ?? '') : '',
    }),
    [data, isEdit]
  );

  // Formik hook for form handling with validation and submission logic
  const formik = useFormik<ReceiptBook>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Check if receipt book name already exists in the data
      const exists = allData.some(
        (entry) => entry.receiptBookName.toLowerCase() === values.receiptBookName.toLowerCase()
      );

      // Allow save if entry doesn't exist or if editing existing entry
      if (!exists || isEdit) {
        setShowErrorMessage(false);
        onSave(values);
      } else {
        setShowErrorMessage(true);
      }
    },
  });

  // Effect to track form changes and update Redux state
  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [formik.values, initialValues, dispatch]);

  // Handler for closing the dialog with unsaved changes confirmation
  const handleClose = () => {
    if (isChanges && window.confirm('Are you sure you want to leave?')) {
      dispatch(setIsChanges(false));
      onClose();
    } else if (!isChanges) {
      onClose();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Receipt Book"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Receipt Book' }]}
          sx={{ px: 1, mb: 2 }}
        />

        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={handleClose}
          variant="contained"
          size="small"
        >
          Back
        </Button>
      </Box>

      <form
        onSubmit={formik.handleSubmit}
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card sx={{ height: '100%', boxShadow: 4, display: 'flex', flexDirection: 'column' }}>
          <Box p={2} display="flex" flexDirection="column" gap={3} flexGrow={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ShakingTextField
                  error={formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)}
                >
                  <AutoFocus>
                    <TextField
                      size="small"
                      fullWidth
                      name="receiptBookName"
                      label="Receipt Book Name"
                      value={formik.values.receiptBookName}
                      onChange={(e) =>
                        formik.setFieldValue('receiptBookName', capitalizeWords(e.target.value))
                      }
                      error={
                        formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)
                      }
                      helperText={formik.touched.receiptBookName && formik.errors.receiptBookName}
                    />
                  </AutoFocus>
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
                    error={formik.touched.receiptBookCode && Boolean(formik.errors.receiptBookCode)}
                    helperText={formik.touched.receiptBookCode && formik.errors.receiptBookCode}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </Box>
        </Card>
      </form>

      {showErrorMessage && (
        <Typography fontSize={13} color="error">
          Book Receipt already exists
        </Typography>
      )}
    </Box>
  );
};

export default FinanceSettingReceiptbookDialog;
