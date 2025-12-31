import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetEarningComponentsQuery,
  useGetDeductionComponentsQuery,
} from 'src/redux/employee-payroll/employee-payroll-api';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (selected: any) => void;
  type: 'earning' | 'deduction';
  employeeId?: string;
  values?: any[];
};

export default function PayrollComponentDialog({
  values: componentValues,
  open,
  onClose,
  onAdd,
  type,
  employeeId,
}: Props) {
  const { data: components, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation:
      type === 'earning' ? useGetEarningComponentsQuery : useGetDeductionComponentsQuery,
  });

  const formik = useFormik({
    initialValues: {
      selectedComponents: componentValues || [],
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
          loading={isLoading}
          size="small"
          options={components?.items || []}
          getOptionLabel={(option: any) => option?.componentName || option?.name}
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
