import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Close } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Grid, Alert, Typography, IconButton } from '@mui/material';

const FlatRateConfiguration = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [showAlert, setShowAlert] = React.useState(true);

  const frequencyOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Half-Yearly', label: 'Half-Yearly' },
    { value: 'Yearly', label: 'Yearly' },
  ];

  const formik = useFormik({
    initialValues: {
      feeAmount: 1500,
      feeFrequency: 'Monthly',
      effectiveFrom: dayjs('2025-10-15'),
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <Box p={3}>
      <Typography variant="h6" color="primary" gutterBottom>
        Configure Flat Rate Model
      </Typography>

      <Grid container spacing={2} mt={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.feeAmount && formik.errors.feeAmount)}>
            <NumericFormatCustom
              size="small"
              fullWidth
              label="Fee Amount (₹) *"
              name="feeAmount"
              value={formik.values.feeAmount || ''}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(/[₹,\s]/g, '');
                formik.setFieldValue('feeAmount', Number(val));
              }}
              error={!!(formik.touched.feeAmount && formik.errors.feeAmount)}
              helperText={formik.touched.feeAmount && formik.errors.feeAmount}
              sx={{
                width: '100%',
                padding: '0',
                borderRadius: 1,
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.feeFrequency && formik.errors.feeFrequency)}>
            <CustomSelect
              label="Fee Frequency *"
              options={frequencyOptions}
              value={formik.values.feeFrequency}
              onChange={(val) => {
                formik.setFieldValue('feeFrequency', val);
              }}
              error={!!(formik.touched.feeFrequency && formik.errors.feeFrequency)}
              helperText={(formik.touched.feeFrequency && formik.errors.feeFrequency) as string}
              formControlProps={{ fullWidth: true }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.effectiveFrom && formik.errors.effectiveFrom)}>
            <DatePicker
              label="Effective From *"
              value={formik.values.effectiveFrom}
              onChange={(newValue) => formik.setFieldValue('effectiveFrom', newValue)}
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.effectiveFrom && formik.errors.effectiveFrom),
                  helperText:
                    formik.touched.effectiveFrom && typeof formik.errors.effectiveFrom === 'string'
                      ? formik.errors.effectiveFrom
                      : undefined,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>

      {showAlert && (
        <Alert
          severity="success"
          icon={<Iconify icon="lucide:info" />}
          sx={{ mt: 2 }}
          action={
            <IconButton size="small" onClick={() => setShowAlert(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          All students will be charged <strong>₹{formik.values.feeAmount}</strong> per{' '}
          <strong>{formik.values.feeFrequency.toLowerCase()}</strong>.
        </Alert>
      )}
    </Box>
  );
};

export default FlatRateConfiguration;
