'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, MenuItem, TextField, Autocomplete, DialogActions } from '@mui/material';
import {
  useAddDriverConductorMutation,
  useUpdateDriverConductorMutation,
} from 'src/redux/transport/vehicle-management/driver-conductor-api';

import { driverConductorValidationSchema } from './DriverManagementValidation';
import { getDriverConductorInitialValues } from './DriverManagementInitialValues';

import type { IDriverConductorFormProps } from './type';

const getEmployeeLabel = (employee: any) => {
  if (!employee) return '';
  const name = employee.fullName || employee.employeeName || employee.name || '';
  const code = employee.employeeIdentifier || employee.employeeCode || '';
  return code ? `${name || code} (${code})` : name;
};

const DriverConductorForm: React.FC<IDriverConductorFormProps> = ({ onClose, editData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { data: employeeData } = useGetEmployeeQuery({ page: 1, pageSize: 100 });
  const [createStaff, { isLoading: isCreating }] = useAddDriverConductorMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateDriverConductorMutation();
  const employeeOptions = employeeData?.items || employeeData?.data || [];

  const formik = useFormik({
    initialValues: getDriverConductorInitialValues(editData),
    validationSchema: driverConductorValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const body = {
          employeeId: values.employeeId,
          role: Number(values.role),
          licenseNo: values.licenceNo || null,
          licenseExpiryDate: values.licenceExpiry
            ? dayjs(values.licenceExpiry).toISOString()
            : null,
          experienceYears:
            values.experienceYears === '' || values.experienceYears === null
              ? null
              : Number(values.experienceYears),
          remarks: values.remarks || null,
        };

        if (editData?.id) {
          await updateStaff({
            staffId: editData.id,
            academicMediumId: currentMedium?.id,
            body,
          }).unwrap();
        } else {
          await createStaff({
            academicMediumId: currentMedium?.id,
            body,
          }).unwrap();
        }

        shikshaMitraToast.success({
          message: editData
            ? 'Transport staff updated successfully.'
            : 'Transport staff created successfully.',
        });
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.detail || error?.data?.message || 'Failed to save transport staff.',
        });
      }
    },
  });

  const selectedEmployee =
    employeeOptions.find((employee: any) => employee.id === formik.values.employeeId) ||
    (editData
      ? {
          id: editData.employeeGuid,
          fullName: editData.name,
          employeeIdentifier: editData.employeeId,
        }
      : null);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.employeeId && formik.errors.employeeId)}>
              <Autocomplete
                options={employeeOptions}
                value={selectedEmployee}
                getOptionLabel={getEmployeeLabel}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(_, value) => {
                  formik.setFieldValue('employeeId', value?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee"
                    size="small"
                    error={!!(formik.touched.employeeId && formik.errors.employeeId)}
                    helperText={formik.touched.employeeId && formik.errors.employeeId}
                  />
                )}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Role"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={!!(formik.touched.role && formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
            >
              <MenuItem value={0}>Driver</MenuItem>
              <MenuItem value={1}>Conductor</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Licence No."
              name="licenceNo"
              value={formik.values.licenceNo}
              onChange={formik.handleChange}
              error={!!(formik.touched.licenceNo && formik.errors.licenceNo)}
              helperText={formik.touched.licenceNo && formik.errors.licenceNo}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Licence Expiry"
              name="licenceExpiry"
              value={
                formik.values.licenceExpiry
                  ? dayjs(formik.values.licenceExpiry).format('YYYY-MM-DD')
                  : ''
              }
              onChange={formik.handleChange}
              error={!!(formik.touched.licenceExpiry && formik.errors.licenceExpiry)}
              helperText={formik.touched.licenceExpiry && (formik.errors.licenceExpiry as string)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Experience Years"
              name="experienceYears"
              value={formik.values.experienceYears}
              onChange={formik.handleChange}
              error={!!(formik.touched.experienceYears && formik.errors.experienceYears)}
              helperText={formik.touched.experienceYears && formik.errors.experienceYears}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Remarks"
              name="remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          color="inherit"
          onClick={() => onClose(null, false)}
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          variant="contained"
          disabled={isCreating || isUpdating}
          onClick={() => formik.handleSubmit()}
          sx={{ borderRadius: 1, px: 3, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
        >
          {isCreating || isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default DriverConductorForm;
