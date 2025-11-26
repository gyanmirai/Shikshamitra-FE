import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import FeeRefundDetailsForm from './FeeRefundDetailForm';
import RefundGeneralInfoCard from './RefundGeneralInfoCard';
import {
  buildRefundInitialValues,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

const FeeRefundFormComponent = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
}: {
  student: any | null;
  onSubmit?: (values: any) => void;
  onCancel?: (e: any, isSubmit: boolean) => void;
  loading?: boolean;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: buildRefundInitialValues(),
    validationSchema: buildRefundValidationSchema(currentYear),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (onSubmit) {
        onSubmit(values);
      } else {
        // else handle
      }
    },
  });

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          {/* Pass formik down to RefundGeneralInfoCard */}
          <RefundGeneralInfoCard
            student={student}
            formik={formik}
            // open={open}
            // onClose={onClose}
            // editData={editData}
          />
          <FeeRefundDetailsForm formik={formik} />
        </BackPopUpChecked>
      </Scrollbar>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={(e: any) => {
            onCancel?.(e, false);
          }}
          disabled={loading}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => {
            formik.handleChange(e);
            formik.handleBlur(e);
            formik.handleSubmit(e);
          }}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default FeeRefundFormComponent;
