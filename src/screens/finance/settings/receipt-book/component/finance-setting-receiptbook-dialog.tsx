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
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const initialValues = useMemo<ReceiptBook>(
    () => ({
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      receiptBookName: isEdit ? (data.receiptBookName ?? '') : '',
      receiptBookCode: isEdit ? (data.receiptBookCode ?? '') : '',
    }),
    [data, isEdit]
  );

  const formik = useFormik<ReceiptBook>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const exists = allData.some(
        (entry) => entry.receiptBookName.toLowerCase() === values.receiptBookName.toLowerCase()
      );

      if (!exists || isEdit) {
        setShowErrorMessage(false);
        onSave(values);
      } else {
        setShowErrorMessage(true);
      }
    },
  });

  useEffect(() => {
    dispatch(setIsChanges(!isEqual(formik.values, initialValues)));
  }, [formik.values, initialValues, dispatch]);

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
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                fullWidth
                name="receiptBookName"
                label="Receipt Book Name"
                value={formik.values.receiptBookName}
                onChange={(e) =>
                  formik.setFieldValue('receiptBookName', capitalizeWords(e.target.value))
                }
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

      {showErrorMessage && (
        <Typography fontSize={13} color="error">
          Book Receipt already exists
        </Typography>
      )}
    </Box>
  );
};

export default FinanceSettingReceiptbookDialog;
