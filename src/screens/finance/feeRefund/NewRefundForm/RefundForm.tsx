import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Button, Typography, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import FeeRefundDetailsForm from './FeeRefundDetailForm';
import RefundGeneralInfoCard from './RefundGeneralInfoCard';
import {
  buildRefundInitialValues,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

interface FeeRefundFormProps {
  onCancel?: (e: React.MouseEvent, isSubmit: boolean) => void;
  loading?: boolean;
}

const FeeRefundFormComponent = ({
  onCancel,
  loading = false,
}: FeeRefundFormProps): React.ReactElement => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: buildRefundInitialValues(),
    validationSchema: buildRefundValidationSchema(currentYear),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      // onSubmit?.(buildFeeRefundPayload(values));
    },
  });
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <Card variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" mb={2}>
              Student Information
            </Typography>
            <RefundGeneralInfoCard formik={formik} />
          </Card>

          <FeeRefundDetailsForm formik={formik} />
        </BackPopUpChecked>
      </Scrollbar>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          disabled={loading}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={(e) => onCancel?.(e, false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={loading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={() => formik.handleSubmit()}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default FeeRefundFormComponent;
