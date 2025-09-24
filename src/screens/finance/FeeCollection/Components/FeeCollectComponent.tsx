import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { FeeSummaryCard } from './StudentFeeDetail';
import PaymentDetailsForm, {
  buildInitialValues,
  buildValidationSchema,
} from './PaymentDetailsForm';

import type { IStudentFee } from './type';

const FeeCollectComponent = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
}: {
  student: IStudentFee | null;
  onSubmit?: (values: any) => void;
  onCancel?: (e: any, isSubmit: boolean) => void;
  loading?: boolean;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: buildInitialValues(),
    validationSchema: buildValidationSchema(currentYear),
    enableReinitialize: true,
    onSubmit: (values) => {
      // This logic will be moved from PaymentDetailsForm
      if (onSubmit) {
        onSubmit(values);
        onCancel?.(null, true);
      } else {
        console.log('Form submission data:', values);
      }
    },
  });
  console.log('formik----', formik.errors);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <FeeSummaryCard student={student} />
          <PaymentDetailsForm formik={formik} />
        </BackPopUpChecked>
      </Scrollbar>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            onCancel?.(null, false);
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

export default FeeCollectComponent;
