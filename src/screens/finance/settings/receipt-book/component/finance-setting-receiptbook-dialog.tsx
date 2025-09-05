import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

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
      id: isEdit
        ? (data?.id ?? Math.floor(Math.random() * 10000))
        : Math.floor(Math.random() * 10000),
      receiptBookName: isEdit ? (data?.receiptBookName ?? '') : '',
      receiptBookCode: isEdit ? (data?.receiptBookCode ?? '') : '',
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
        onClose(null, true);
      } else {
        setShowErrorMessage(true);
        onClose(null, true);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={3}>
            {/* Receipt Book Name Field */}
            <Grid size={{ xs: 12, sm: 12 }}>
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
                      label="Receipt Book Name *"
                      value={formik.values[field]}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                        formik.setFieldValue(field, value);
                      }}
                      error={error}
                      helperText={helperText}
                    />
                  </ShakingTextField>
                );
              })()}
            </Grid>

            {/* Receipt Book Code Field */}
            <Grid size={{ xs: 12, sm: 12 }} pb="20px">
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
                      label="Receipt Book Code *"
                      value={formik.values[field]}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                        formik.setFieldValue(field, value);
                      }}
                      error={error}
                      helperText={helperText}
                    />
                  </ShakingTextField>
                );
              })()}
            </Grid>
          </Grid>
        </Scrollbar>

        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => {
              onClose(null, false);
            }}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            startIcon={
              <Iconify
                icon={data ? GlobalIcons.edit : GlobalIcons.submit}
                width={data ? 16 : 20}
                height={data ? 16 : 20}
              />
            }
            type="submit"
            variant="contained"
            size="small"
          >
            {data ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default FinanceSettingReceiptbookDialog;
