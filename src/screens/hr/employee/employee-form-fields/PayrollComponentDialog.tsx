import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Button, TextField, Typography, Autocomplete, DialogActions } from '@mui/material';
import {
  useGetEarningComponentsQuery,
  useGetDeductionComponentsQuery,
} from 'src/redux/hr/employee-payroll-api';

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
    params: {},
  });

  const formik = useFormik({
    initialValues: {
      selectedComponents: componentValues || [],
    },
    validationSchema: Yup.object({
      selectedComponents: Yup.array().min(1, 'Please select at least one Component'),
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
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">
            Add {type === 'earning' ? 'Earning' : 'Deduction'} Components
          </Typography>
          <CustomTooltip
            sx={{ textAlign: 'justify' }}
            arrow
            placement="right"
            title={`Add ${type === 'earning' ? 'Earning' : 'Deduction'} Components to the employee's payroll`}
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      maxWidth="sm"
    >
      <DialogScrollContent>
        <Autocomplete
          multiple
          fullWidth
          loading={isLoading}
          size="small"
          options={components?.items || []}
          getOptionLabel={(option: any) =>
            option?.earningComponentName || option?.deductionComponentName
          }
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
              label="Components *"
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
