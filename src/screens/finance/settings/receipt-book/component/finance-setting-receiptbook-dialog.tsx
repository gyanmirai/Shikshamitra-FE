import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { receiptBookValidationSchema } from '../validationSchema';

import type { IProps, IReceiptBook } from '../receipt-book-interface';

const FinanceSettingReceiptbookDialog: React.FC<IProps> = ({
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
  const initialValues = useMemo<IReceiptBook>(
    () => ({
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      receiptBookName: isEdit ? (data.receiptBookName ?? '') : '',
      receiptBookCode: isEdit ? (data.receiptBookCode ?? '') : '',
    }),
    [data, isEdit]
  );

  // Formik hook for form handling with validation and submission logic
  const formik = useFormik<IReceiptBook>({
    initialValues,
    validationSchema: receiptBookValidationSchema,
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
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <Grid container spacing={2} pb="20px">
          {/* Receipt Book Name Field */}
          <Grid item xs={12} sm={12}>
            {(() => {
              const field = 'receiptBookName';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    name={field}
                    label="Receipt Book Name"
                    value={formik.values[field]}
                    onChange={(e) => formik.setFieldValue(field, capitalizeWords(e.target.value))}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>

          {/* Receipt Book Code Field */}
          <Grid item xs={12} sm={12} pb="20px">
            {(() => {
              const field = 'receiptBookCode';
              const error = formik.touched[field] && Boolean(formik.errors[field]);
              const helperText = formik.touched[field] && formik.errors[field];
              return (
                <ShakingTextField error={error}>
                  <TextField
                    size="small"
                    fullWidth
                    name={field}
                    label="Receipt Book Code"
                    value={formik.values[field]}
                    onChange={formik.handleChange}
                    error={error}
                    helperText={helperText}
                  />
                </ShakingTextField>
              );
            })()}
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};

export default FinanceSettingReceiptbookDialog;
