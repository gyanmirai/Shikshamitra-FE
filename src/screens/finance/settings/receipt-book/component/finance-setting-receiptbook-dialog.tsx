import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Card, Button, TextField, Typography } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

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
  const validationSchema = Yup.object().shape({
    receiptBookName: Yup.string()
      .trim()
      .required('Receipt Book Name is required')
      .min(2, 'Receipt Book Name must be at least 2 characters')
      .max(50, 'Receipt Book Name cannot exceed 50 characters'),

    receiptBookCode: Yup.string()
      .trim()
      .required('Receipt Book Code is required')
      .matches(/^[A-Za-z0-9_-]+$/, 'Invalid Receipt Book Code format')
      .max(20, 'Receipt Book Code cannot exceed 20 characters'),
  });
  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
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
    <Box display="flex" flexDirection="column" gap={2} height="100%">
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
      <form
        onSubmit={formik.handleSubmit}
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card
          sx={{
            height: '100%',
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            pt="10px"
            display="flex"
            flexDirection="column"
            height="100%"
            gap={3}
            flexGrow={1}
            p={2}
          >
            <Box display="flex" flexDirection="row" gap={2}>
              <TextField
                size="small"
                fullWidth
                name="receiptBookName"
                label="Receipt Book Name"
                value={formik.values.receiptBookName}
                onChange={(e) => {
                  formik.setFieldValue('receiptBookName', capitalizeWords(e.target.value));
                }}
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

          <Box display="flex" justifyContent="flex-end" gap={2} p={2}>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </Box>
        </Card>
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
