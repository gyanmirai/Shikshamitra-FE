import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

interface FinanceSettingPaymentMethodDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: FormikValue) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface ServiceProviderDetail {
  serviceProviderName: string;
  serviceProviderMobile: string;
}

interface FormikValue {
  id: number;
  paymentMethodName: string;
  serviceProviderDetail: ServiceProviderDetail;
  integrationKey: string;
}

const validationSchema = Yup.object({
  paymentMethodName: Yup.string().required("Payment Method Name can't be empty"),
  serviceProviderDetail: Yup.object({
    serviceProviderName: Yup.string().required("Service Provider Name can't be empty"),
    serviceProviderMobile: Yup.string().required("Service Provider Mobile can't be empty"),
  }),
  integrationKey: Yup.string().required("Integration key can't be empty"),
});

const FinanceSettingPaymentMethodDialog: React.FC<FinanceSettingPaymentMethodDialogProps> = ({
  data,
  dialogValue,
  onClose,
  onSave,
  allData,
  isEdit,
}) => {
  // State to show message when payment method already exists
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  // Get isChanges state from redux store to track form modifications
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  // Initialize form values based on whether editing existing or creating new payment method
  const initialValues = useMemo(
    () => ({
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      paymentMethodName: isEdit ? (data.paymentMethodName ?? '') : '',
      serviceProviderDetail: {
        serviceProviderName: isEdit ? (data.serviceProviderDetail?.serviceProviderName ?? '') : '',
        serviceProviderMobile: isEdit
          ? (data.serviceProviderDetail?.serviceProviderMobile ?? '')
          : '',
      },
      integrationKey: isEdit ? (data.integrationKey ?? '') : '',
    }),
    [
      data.id,
      data.integrationKey,
      data.paymentMethodName,
      data.serviceProviderDetail?.serviceProviderMobile,
      data.serviceProviderDetail?.serviceProviderName,
      isEdit,
    ]
  );

  // Initialize formik with validation and submission handling
  const formik = useFormik<FormikValue>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      // Check if payment method name already exists in case of new entry
      const existingEntryIndex = allData.findIndex(
        (val: any) => val.paymentMethodName.toLowerCase() === values.paymentMethodName.toLowerCase()
      );

      // Allow submission if entry doesn't exist or if editing existing entry
      if (existingEntryIndex === -1 || isEdit) {
        setShowExistingEntryMessage(false);
        onSave(values);
      } else {
        setShowExistingEntryMessage(true);
      }
    },
  });

  // Track form changes and update redux store
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  // Handle dialog close with confirmation if form has changes
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Payment Method"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Payment Method' }]}
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
      <Box px="15px">
        {showExistingEntryMessage ? (
          <Typography component="span" variant="h6">
            This Tax System Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>

      <Box px="15px">
        <form onSubmit={formik.handleSubmit}>
          <Box pt="10px" display="flex" flexDirection="column" gap={3}>
            <TextField
              size="small"
              fullWidth
              name="paymentMethodName"
              label="Payment Method Name"
              value={formik.values.paymentMethodName}
              onChange={formik.handleChange}
              error={formik.touched.paymentMethodName && Boolean(formik.errors.paymentMethodName)}
              helperText={formik.touched.paymentMethodName && formik.errors.paymentMethodName}
            />
            <TextField
              size="small"
              fullWidth
              name="serviceProviderDetail.serviceProviderName"
              label="Service Provider Name"
              value={formik.values.serviceProviderDetail.serviceProviderName}
              onChange={formik.handleChange}
              error={
                formik.touched.serviceProviderDetail?.serviceProviderName &&
                Boolean(formik.errors.serviceProviderDetail?.serviceProviderName)
              }
              helperText={
                formik.touched.serviceProviderDetail?.serviceProviderName &&
                formik.errors.serviceProviderDetail?.serviceProviderName
              }
            />
            <TextField
              size="small"
              fullWidth
              name="serviceProviderDetail.serviceProviderMobile"
              label="Service Provider Mobile"
              value={formik.values.serviceProviderDetail.serviceProviderMobile}
              onChange={formik.handleChange}
              error={
                formik.touched.serviceProviderDetail?.serviceProviderMobile &&
                Boolean(formik.errors.serviceProviderDetail?.serviceProviderMobile)
              }
              helperText={
                formik.touched.serviceProviderDetail?.serviceProviderMobile &&
                formik.errors.serviceProviderDetail?.serviceProviderMobile
              }
            />
            <TextField
              size="small"
              fullWidth
              name="integrationKey"
              label="Integration Key"
              value={formik.values.integrationKey}
              onChange={formik.handleChange}
              error={formik.touched.integrationKey && Boolean(formik.errors.integrationKey)}
              helperText={formik.touched.integrationKey && formik.errors.integrationKey}
            />
          </Box>
        </form>
        {showExistingEntryMessage && <Typography color="error">Entry already exists</Typography>}
      </Box>

      <DialogActions>
        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </>
  );
};

export default FinanceSettingPaymentMethodDialog;
