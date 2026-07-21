import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShakingTextField from 'src/components/shaking-text-field';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, Checkbox, TextField, Autocomplete, DialogActions } from '@mui/material';

import type { IFacilityFormProps } from './type';

const AddFacilityForm: React.FC<IFacilityFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      facilityName: editData?.facilityName || '',
      description: editData?.description || '',
      facilities: editData?.facilities || [],
    },
    validationSchema: Yup.object().shape({
      facilityName: Yup.string().required('Facility Name is required'),
      description: Yup.string().required('Description is required'),
      facilities: Yup.array().required('Facilities are required'),
    }),
    onSubmit: (values) => {},
  });

  const facilitiesOptions = [
    { label: 'Gym', value: 'gym' },
    { label: 'Swimming Pool', value: 'pool' },
    { label: 'Parking', value: 'parking' },
    { label: 'WiFi', value: 'wifi' },
    { label: 'Laundry', value: 'laundry' },
  ];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.facilityName && formik.errors.facilityName)}
                >
                  <TextField
                    size="small"
                    label="Facility Name *"
                    name="facilityName"
                    fullWidth
                    value={formik.values.facilityName}
                    onChange={formik.handleChange}
                    error={formik.touched.facilityName && Boolean(formik.errors.facilityName)}
                    helperText={formik.touched.facilityName && formik.errors.facilityName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    size="small"
                    label="Description *"
                    name="description"
                    fullWidth
                    multiline
                    minRows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={12}>
                <ShakingTextField error={!!(formik.touched.facilities && formik.errors.facilities)}>
                  <Autocomplete
                    size="small"
                    multiple
                    options={facilitiesOptions}
                    getOptionLabel={(option: { label: string; value: string }) => option.label}
                    value={facilitiesOptions.filter((opt) =>
                      formik.values.facilities?.includes(opt.value)
                    )}
                    onChange={(_, newValue) => {
                      formik.setFieldValue(
                        'facilities',
                        newValue.map((val) => val.value)
                      );
                    }}
                    isOptionEqualToValue={(option: { value: string }, value: { value: string }) =>
                      option.value === value.value
                    }
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.value}
                        </li>
                      );
                    }}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        label="Facilities *"
                        name="facilities"
                        fullWidth
                        error={formik.touched.facilities && Boolean(formik.errors.facilities)}
                        helperText={formik.touched.facilities && formik.errors.facilities}
                      />
                    )}
                  />{' '}
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddFacilityForm;
