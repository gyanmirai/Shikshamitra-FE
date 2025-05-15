import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  FormControl,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const facilitiesOptions = ['AC', 'Wi-Fi', 'Study Table', 'Attached Bathroom'];

const AddRoomCategoryForm = ({ dialog, onClose, editData }: any) => {
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values, using editData if available or empty defaults
    initialValues: {
      hostelType: editData?.hostelType || '',
      hostelName: editData?.hostelName || '',
      categoryName: editData?.categoryName || '',
      maximumOccupancy: editData?.maximumOccupancy || '',
      facilities: editData?.facilities || [],
    },
    validationSchema: Yup.object().shape({
      hostelType: Yup.string().required('Hostel Type is required'),
      hostelName: Yup.string().required('Hostel Name is required'),
      categoryName: Yup.string().required('Category Name is required'),
      maximumOccupancy: Yup.number()
        .required('Maximum Occupancy is required')
        .positive('Must be positive')
        .integer('Must be an integer'),
    }),
    onSubmit: (values) => {
      console.log('Form Values:', values);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <ShakingTextField
                    error={!!(formik.touched.categoryName && formik.errors.categoryName)}
                  >
                    <Autocomplete
                      id="hostel-type"
                      options={['Boys', 'Girls', 'Staff']}
                      value={formik.values.hostelType}
                      onChange={(_, value) => formik.setFieldValue('hostelType', value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Hostel Type *"
                          size="small"
                          error={formik.touched.hostelType && Boolean(formik.errors.hostelType)}
                          helperText={
                            formik.touched.hostelType &&
                            typeof formik.errors.hostelType === 'string'
                              ? formik.errors.hostelType
                              : ''
                          }
                        />
                      )}
                    />
                  </ShakingTextField>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    id="hostel-name"
                    options={['Block A', 'Block B', 'Main Hostel', 'Annex']}
                    value={formik.values.hostelName}
                    onChange={(_, value) => formik.setFieldValue('hostelName', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hostel Name *"
                        size="small"
                        error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                        helperText={
                          formik.touched.hostelName && typeof formik.errors.hostelName === 'string'
                            ? formik.errors.hostelName
                            : ''
                        }
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.categoryName && formik.errors.categoryName)}
                >
                  <TextField
                    size="small"
                    label="Category Name *"
                    name="categoryName"
                    fullWidth
                    value={formik.values.categoryName}
                    onChange={formik.handleChange}
                    error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                    helperText={
                      formik.touched.categoryName && typeof formik.errors.categoryName === 'string'
                        ? formik.errors.categoryName
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.maximumOccupancy && formik.errors.maximumOccupancy)}
                >
                  <TextField
                    size="small"
                    label="Maximum Occupancy *"
                    name="maximumOccupancy"
                    type="number"
                    fullWidth
                    value={formik.values.maximumOccupancy}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.maximumOccupancy && Boolean(formik.errors.maximumOccupancy)
                    }
                    helperText={
                      formik.touched.maximumOccupancy &&
                      typeof formik.errors.maximumOccupancy === 'string'
                        ? formik.errors.maximumOccupancy
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    multiple
                    id="students-select"
                    options={[
                      { label: 'Air Conditioning', value: 'AC' },
                      { label: 'Wi-Fi', value: 'WIFI' },
                      { label: 'TV', value: 'TV' },
                      { label: 'Hot Water', value: 'HOT_WATER' },
                      { label: 'Attached Bathroom', value: 'BATHROOM' },
                      { label: 'Study Table', value: 'STUDY_TABLE' },
                      { label: 'Wardrobe', value: 'WARDROBE' },
                      { label: 'Laundry Service', value: 'LAUNDRY' },
                      { label: 'Mini Fridge', value: 'FRIDGE' },
                      { label: 'Housekeeping', value: 'HOUSEKEEPING' },
                    ]}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.label}
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Facilities"
                        placeholder="Select Facilities"
                        size="small"
                      />
                    )}
                  />
                </FormControl>
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

export default AddRoomCategoryForm;
