import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, Skeleton, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
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
        {isLoading ? (
          <Skeleton variant="rounded" height={40} width="100%" />
        ) : (
          <PaginatedSearchSelect
            multiple
            fullWidth
            noOptionsText="No results found"
            size="small"
            label="Select Components"
            placeholder="Choose components"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            fetchOptions={async (searchQuery) => {
              const items = components?.items || [];
              const filtered = items.filter((item: any) =>
                (item?.componentName || item?.name)
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              );
              return {
                data: filtered.map((option: any) => ({
                  label: option?.componentName || option?.name || '',
                  id: option.id,
                  ...option,
                })),
                hasMore: false,
              };
            }}
            value={formik.values.selectedComponents || []}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(option: any) =>
              option?.label || option?.componentName || option?.name || ''
            }
            renderOption={(props, option: any) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            minChars={0}
            onChange={(_, newValue: any) => formik.setFieldValue('selectedComponents', newValue)}
            error={formik.touched.selectedComponents && Boolean(formik.errors.selectedComponents)}
            helperText={
              formik.touched.selectedComponents && (formik.errors.selectedComponents as string)
            }
          />
        )}
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
