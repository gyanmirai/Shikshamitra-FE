import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface FinanceSettingReceiptbookDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: FormikValue) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  id: number;
  receiptBookName: string;
  receiptBookCode: string;
}

const FinanceSettingReceiptbookDialog: React.FC<FinanceSettingReceiptbookDialogProps> = ({
  isEdit,
  data,
  onSave,
  onClose,
  allData,
  dialogValue,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  const initialValues = useMemo<FormikValue>(
    () => ({
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),

      receiptBookName: isEdit ? (data.receiptBookName ?? '') : '',
      receiptBookCode: isEdit ? (data.receiptBookCode ?? '') : '',
    }),
    [data, isEdit]
  );

  const formik = useFormik<FormikValue>({
    initialValues,
    onSubmit: (values) => {
      const existingEntryIndex = allData.findIndex(
        (val: any) => val.receiptBookName.toLowerCase() === values.receiptBookName.toLowerCase()
      );

      if (existingEntryIndex === -1 || isEdit) {
        setShowExistingEntryMessage(false);
        onSave(values);
      } else {
        setShowExistingEntryMessage(true);
        return;
      }

      console.log('Form Submitted:', values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  return (
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Receipt Book"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Receipt Book' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
          <Box display="flex" flexDirection="row" gap={2}>
            <TextField
              size="small"
              fullWidth
              name="receiptBookName"
              label="Receipt Book Name"
              value={formik.values.receiptBookName}
              onChange={formik.handleChange}
              error={formik.touched.receiptBookName && Boolean(formik.errors.receiptBookName)}
              helperText={formik.touched.receiptBookName && formik.errors.receiptBookName}
            />

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
          </Box>
        </Box>

        <DialogActions>
          <Button type="submit" variant="outlined" size="small">
            Save
          </Button>
        </DialogActions>
      </form>
      {showExistingEntryMessage ? (
        <Typography fontSize={13} color="error">
          Book Receipt Already exists
        </Typography>
      ) : (
        <Box pb="13px" />
      )}
    </Box>
  );
};

export default FinanceSettingReceiptbookDialog;
