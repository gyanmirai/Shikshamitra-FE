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

  const options: any[] = components?.items || [];

  // Helper to get a consistent ID from either an option (uses _id) or a
  // componentValue (uses componentId or id from the salary-structure API).
  const getId = (item: any): string | undefined => item?._id ?? item?.componentId ?? item?.id;

  // Resolve already-selected components against the fetched options list,
  // matching by the flexible ID so MUI Autocomplete gets real option objects.
  const resolvedInitialValues = (componentValues || [])
    .map((cv: any) => options.find((opt: any) => getId(opt) === getId(cv)) ?? null)
    .filter(Boolean);

  const formik = useFormik({
    initialValues: {
      selectedComponents: resolvedInitialValues,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      selectedComponents: Yup.array().min(1, 'Please select at least one Component'),
    }),
    onSubmit: (values, { resetForm }) => {
      onAdd(values.selectedComponents);
      resetForm();
      onClose();
    },
  });

  // Keep selectedComponents in sync when options finish loading (important for update flow)
  const syncedValue = formik.values.selectedComponents
    .map((cv: any) => options.find((opt: any) => getId(opt) === getId(cv)) ?? null)
    .filter(Boolean);

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
          options={options}
          getOptionLabel={(option: any) =>
            option?.earningComponentName || option?.deductionComponentName || ''
          }
          isOptionEqualToValue={(option: any, value: any) => getId(option) === getId(value)}
          slotProps={{
            chip: {
              size: 'small',
              variant: 'soft',
            },
          }}
          value={syncedValue}
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
