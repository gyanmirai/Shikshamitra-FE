import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetEarningComponentsQuery,
  useGetDeductionComponentsQuery,
} from 'src/redux/hr/employee-payroll-api';
import {
  Box,
  Chip,
  Button,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  CircularProgress,
} from '@mui/material';

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

  const autocompleteOptions =
    isLoading || options.length === 0 ? [] : [{ __selectAll: true } as any, ...options];

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
  useFormikErrorFocus(formik);

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
        noValidate: true,
      }}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">
            Add {type === 'earning' ? 'Earning' : 'Deduction'} Components
          </Typography>
          {syncedValue.length > 0 && (
            <Chip
              label={`${syncedValue.length} selected`}
              size="small"
              color={type === 'earning' ? 'success' : 'error'}
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
          <CustomTooltip
            sx={{ textAlign: 'justify' }}
            arrow
            placement="right"
            title={`Add ${type === 'earning' ? 'Earning' : 'Deduction'} Components to the staff's payroll`}
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
          loadingText={
            <Box display="flex" alignItems="center" gap={1} justifyContent="center" py={1.5}>
              <CircularProgress size={20} color="inherit" />
              <Typography variant="body2" color="text.secondary">
                Loading components...
              </Typography>
            </Box>
          }
          size="small"
          options={autocompleteOptions}
          getOptionLabel={(option: any) =>
            (option as any).__selectAll
              ? 'Select all components'
              : option?.earningComponentName || option?.deductionComponentName || ''
          }
          isOptionEqualToValue={(option: any, value: any) =>
            !(option as any).__selectAll && getId(option) === getId(value)
          }
          disableCloseOnSelect
          slotProps={{
            chip: {
              size: 'small',
              variant: 'soft',
            },
          }}
          renderOption={(props, option, { selected }) => {
            if ((option as any).__selectAll) {
              const allSelected = syncedValue.length === options.length;
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps} role="option" aria-selected={allSelected}>
                  <Checkbox
                    checked={allSelected}
                    tabIndex={-1}
                    inputProps={{ 'aria-hidden': true }}
                    size="small"
                    sx={{ mr: 1, p: 0.5 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Typography>
                </li>
              );
            }
            const { key, ...restProps } = props as any;
            return (
              <li key={key} {...restProps}>
                <Checkbox
                  checked={selected}
                  tabIndex={-1}
                  inputProps={{ 'aria-hidden': true }}
                  size="small"
                  sx={{ mr: 1, p: 0.5 }}
                />
                {option?.earningComponentName || option?.deductionComponentName || ''}
              </li>
            );
          }}
          value={syncedValue}
          onChange={(_event, newValue) =>
            formik.setFieldValue(
              'selectedComponents',
              newValue.some((option) => option.__selectAll)
                ? syncedValue.length === options.length
                  ? []
                  : options
                : newValue
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              name="selectedComponents"
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
          type="submit"
          disabled={isLoading || formik.isSubmitting}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
