import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

// Static data for components
const EARNING_COMPONENTS = [
  'Basic Salary',
  'House Rent Allowance (HRA)',
  'Transport Allowance',
  'Special Allowance',
  'Medical Allowance',
  'Bonus',
];

const DEDUCTION_COMPONENTS = [
  'Provident Fund (PF)',
  'Professional Tax',
  'Income Tax (TDS)',
  'Loan Recovery',
  'Health Insurance',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (selected: string[]) => void;
  type: 'earning' | 'deduction';
};

export default function PayrollComponentDialog({ open, onClose, onAdd, type }: Props) {
  const options = type === 'earning' ? EARNING_COMPONENTS : DEDUCTION_COMPONENTS;

  const formik = useFormik({
    initialValues: {
      selectedComponents: [] as string[],
    },
    validationSchema: Yup.object({
      selectedComponents: Yup.array().min(1, 'Please select at least one component'),
    }),
    onSubmit: (values, { resetForm }) => {
      onAdd(values.selectedComponents);
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
      title={`Add ${type === 'earning' ? 'Earning' : 'Deduction'} Components`}
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Autocomplete
          multiple
          fullWidth
          size="small"
          options={options}
          getOptionLabel={(option) => option}
          slotProps={{
            chip: {
              size: 'small',
              variant: 'soft',
            },
          }}
          value={formik.values.selectedComponents || []}
          onChange={(e, newValue) => formik.setFieldValue('selectedComponents', newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Components"
              placeholder="Choose components"
              error={formik.touched.selectedComponents && Boolean(formik.errors.selectedComponents)}
              helperText={
                formik.touched.selectedComponents && (formik.errors.selectedComponents as string)
              }
            />
          )}
        />
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleClose}
          color="inherit"
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
