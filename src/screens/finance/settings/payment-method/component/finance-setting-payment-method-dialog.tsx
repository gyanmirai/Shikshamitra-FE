import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

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
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
      paymentMethodName: isEdit ? (data.paymentMethodName ?? '') : '',
      serviceProviderDetail: {
        serviceProviderName: isEdit ? (data.serviceProviderDetail?.serviceProviderName ?? '') : '',
        serviceProviderMobile: isEdit
          ? (data.serviceProviderDetail?.serviceProviderMobile ?? '')
          : '',
      },
      integrationKey: isEdit ? (data.integrationKey ?? '') : '',
    },
    validationSchema,
    onSubmit: (values) => {
      const existingEntryIndex = allData.findIndex(
        (val: any) => val.paymentMethodName.toLowerCase() === values.paymentMethodName.toLowerCase()
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
  });

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Create New'} Payment Method`}
      open={dialogValue}
      handleClose={onClose}
      maxWidth="md"
    >
      <Box px="15px">
        {showExistingEntryMessage ? (
          <Typography component="span" variant="h6">
            This Tax System Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
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
      </Scrollbar>
      <DialogActions>
        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceSettingPaymentMethodDialog;
