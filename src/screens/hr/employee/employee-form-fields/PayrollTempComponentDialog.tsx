import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (values: any) => void;
  type: 'earning' | 'deduction';
  initialValues?: {
    name: string;
    amount: string;
    applicableMonth: any;
  };
};

export default function PayrollTempComponentDialog({
  open,
  onClose,
  onAdd,
  type,
  initialValues,
}: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      amount: initialValues?.amount || '',
      applicableMonth: initialValues?.applicableMonth || null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      amount: Yup.number()
        .required('Amount is required')
        .transform((value, originalValue) => {
          if (typeof originalValue === 'string') {
            const cleaned = originalValue.replace(/[₹,\s]/g, '');
            // If cleaned value is not a valid number, return undefined
            // eslint-disable-next-line no-restricted-globals
            if (!cleaned || isNaN(Number(cleaned))) {
              return undefined;
            }
            return Number(cleaned);
          }
          return value;
        }),
      applicableMonth: Yup.mixed().required('Applicable month is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      onAdd({ ...values, isTemp: true });
      resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={`Add ${type === 'earning' ? 'Earning' : 'Deduction'} Component`}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            name="name"
            label="Name *"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <NumericFormatCustom
            label="Amount (₹) *"
            name="amount"
            fullWidth
            size="small"
            value={formik.values.amount}
            onChange={(e: any) => {
              let val = e.target.value;
              val = val.replace(/[₹,\s]/g, '');
              formik.setFieldValue('amount', val !== '' ? Number(val) : '');
              formik.setFieldTouched('amount', true, false);
            }}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={
              formik.touched.amount && typeof formik.errors.amount === 'string'
                ? formik.errors.amount
                : undefined
            }
          />

          <DatePicker
            label="Applicable Month *"
            format="MMM-YYYY"
            value={formik.values.applicableMonth}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            views={['year', 'month']}
            slotProps={{
              textField: {
                size: 'small',
                error: formik.touched.applicableMonth && Boolean(formik.errors.applicableMonth),
                helperText:
                  formik.touched.applicableMonth &&
                  typeof formik.errors.applicableMonth === 'string'
                    ? formik.errors.applicableMonth
                    : undefined,
              },
            }}
            onChange={(newValue) => formik.setFieldValue('applicableMonth', newValue)}
          />
        </Stack>
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          color="inherit"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={() => formik.handleSubmit()}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
