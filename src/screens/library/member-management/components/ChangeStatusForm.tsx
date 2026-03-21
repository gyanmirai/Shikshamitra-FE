import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import Autocomplete from '@mui/material/Autocomplete';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, IconButton, DialogActions } from '@mui/material';
import { useGetSelectStatusOptionsQuery } from 'src/redux/member-management/memberManagementApi';

import type { IChangeStatusPayload, IChangeStatusFormProps } from './type';

const ChangeStatusForm: React.FC<IChangeStatusFormProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { data: selectStatusOptions, isLoading: selectStatusLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelectStatusOptionsQuery,
  });

  // Ensure options have label, value, description
  const options = (selectStatusOptions || []).map((opt: any) => ({
    label: opt.label || opt.value,
    value: opt.value,
    description: opt.description || '',
  }));

  const formik = useFormik<IChangeStatusPayload>({
    initialValues: {
      status: options[0]?.value || 'Active',
      date: dayjs(),
      remarks: 'Active for this member.',
    },
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Member status changed to ${values.status} successfully`,
      });
      onClose(null, true);
    },
  });

  return selectStatusLoading ? (
    'loading.. ...'
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Select Status */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
              <Autocomplete
                options={options}
                value={
                  options.find((opt: { value: string }) => opt.value === formik.values.status) ||
                  options[0]
                }
                onChange={(_, newValue) => {
                  formik.setFieldValue('status', newValue?.value || options[0]?.value);
                }}
                size="small"
                disableClearable
                getOptionLabel={(option) => String(option.label)}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
                  >
                    {option.label}
                    <Box sx={{ marginLeft: 'auto' }}>
                      <CustomTooltip title={option.description} placement="right">
                        <IconButton
                          size="small"
                          sx={{
                            color:
                              option.value === 'Active'
                                ? theme.palette.success.main
                                : option.value === 'Inactive'
                                  ? theme.palette.error.main
                                  : option.value === 'Left'
                                    ? theme.palette.info.main
                                    : option.value === 'Retired'
                                      ? theme.palette.grey[500]
                                      : theme.palette.grey[500],
                          }}
                        >
                          <Iconify icon="mdi:information" width={20} />
                        </IconButton>
                      </CustomTooltip>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Select Status *"
                    fullWidth
                    error={!!(formik.touched.status && formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  />
                )}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DatePicker
              label="Date *"
              value={dayjs(formik.values.date)}
              onChange={(newValue) => {
                formik.setFieldValue('date', newValue);
              }}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!(formik.touched.date && formik.errors.date),
                  helperText: (formik.touched.date && formik.errors.date) as string,
                },
              }}
            />
          </Grid>

          {/* Remarks */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.remarks && formik.errors.remarks)}>
              <TextField
                fullWidth
                name="remarks"
                label="Remarks"
                multiline
                rows={4}
                value={formik.values.remarks}
                onChange={formik.handleChange}
                error={!!(formik.touched.remarks && formik.errors.remarks)}
                helperText={formik.touched.remarks && formik.errors.remarks}
                size="small"
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStatusForm;
