'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Grid, Button, Checkbox, TextField, DialogActions, FormControlLabel } from '@mui/material';

interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: (_e: any, isSubmit?: boolean) => void;
  editData?: any;
}

const featureOptions = [
  'Air Conditioning',
  'Whiteboard',
  'CCTV',
  'Power Backup',
  'Emergency Exit',
  'Projector',
  'WiFi',
  'Audio System',
  'Wheelchair Access',
  'First Aid Kit',
];

const RoomForm: React.FC<IRoomFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      roomName: editData?.roomName || '',
      capacity: editData?.capacity || '',
      building: editData?.building || '',
      floor: editData?.floor || '',
      roomType: editData?.roomType || '',
      totalBenches: editData?.totalBenches || '',
      benchCapacity: editData?.benchCapacity || '',
      rows: editData?.rows || '',
      columns: editData?.columns || '',
      features: editData?.features || [],
    },
    validationSchema: Yup.object().shape({
      roomName: Yup.string().required('Room Name/No. is required'),
      capacity: Yup.number().required('Capacity (Total) is required'),
      building: Yup.string().required('Building is required'),
      floor: Yup.string().required('Floor is required'),
      roomType: Yup.string().required('Room Type is required'),
      totalBenches: Yup.number().required('Total Benches is required'),
      benchCapacity: Yup.number().required('Bench Capacity is required'),
      rows: Yup.number().required('Class Benches Rows is required'),
      columns: Yup.number().required('Class Benches Columns is required'),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Room ${editData ? 'updated' : 'added'} successfully!`,
      });
      onClose(null, true);
    },
  });

  const handleFeatureChange = (feature: string) => {
    const current = formik.values.features;
    if (current.includes(feature)) {
      formik.setFieldValue(
        'features',
        current.filter((f: any) => f !== feature)
      );
    } else {
      formik.setFieldValue('features', [...current, feature]);
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} mb={-3}>
            <SectionCard title="Basic Details">
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.roomName && !!formik.errors.roomName}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Room Name/No. *"
                    name="roomName"
                    value={formik.values.roomName}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^a-zA-Z-:0-9\s]/g, '')
                        .split(' ')
                        .map((word) =>
                          word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                        )
                        .join(' ');
                      formik.setFieldValue('roomName', value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.roomName && Boolean(formik.errors.roomName)}
                    helperText={(formik.touched.roomName && formik.errors.roomName) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.capacity && !!formik.errors.capacity}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Capacity (Total) *"
                    name="capacity"
                    type="number"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    inputProps={{ min: 0, max: 100 }}
                    error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                    helperText={(formik.touched.capacity && formik.errors.capacity) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.building && !!formik.errors.building}>
                  <CustomSelect
                    label="Building *"
                    name="building"
                    size="small"
                    options={[{ name: 'Building A' }, { name: 'Building B' }]}
                    labelKey="name"
                    valueKey="name"
                    value={formik.values.building}
                    onChange={(value) => formik.setFieldValue('building', value)}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.building && Boolean(formik.errors.building)}
                    helperText={(formik.touched.building && formik.errors.building) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.floor && !!formik.errors.floor}>
                  <CustomSelect
                    label="Floor *"
                    name="floor"
                    size="small"
                    options={[{ name: '1' }, { name: '2' }, { name: '3' }]}
                    labelKey="name"
                    valueKey="name"
                    value={formik.values.floor}
                    onChange={(value) => formik.setFieldValue('floor', value)}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.floor && Boolean(formik.errors.floor)}
                    helperText={(formik.touched.floor && formik.errors.floor) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.roomType && !!formik.errors.roomType}>
                  <CustomSelect
                    label="Room Type *"
                    name="roomType"
                    size="small"
                    options={[{ name: 'Lecture' }, { name: 'Lab' }]}
                    labelKey="name"
                    valueKey="name"
                    value={formik.values.roomType}
                    onChange={(value) => formik.setFieldValue('roomType', value)}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    helperText={(formik.touched.roomType && formik.errors.roomType) as string}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }} mb={-3}>
            <SectionCard title="Benches Details">
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.totalBenches && !!formik.errors.totalBenches}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Total Benches *"
                    name="totalBenches"
                    type="number"
                    value={formik.values.totalBenches}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.totalBenches && Boolean(formik.errors.totalBenches)}
                    helperText={
                      (formik.touched.totalBenches && formik.errors.totalBenches) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.benchCapacity && !!formik.errors.benchCapacity}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Bench Capacity *"
                    name="benchCapacity"
                    type="number"
                    value={formik.values.benchCapacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.benchCapacity && Boolean(formik.errors.benchCapacity)}
                    helperText={
                      (formik.touched.benchCapacity && formik.errors.benchCapacity) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.rows && !!formik.errors.rows}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Class Benches Rows *"
                    name="rows"
                    type="number"
                    value={formik.values.rows}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.rows && Boolean(formik.errors.rows)}
                    helperText={(formik.touched.rows && formik.errors.rows) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.columns && !!formik.errors.columns}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Class Benches Columns *"
                    name="columns"
                    type="number"
                    value={formik.values.columns}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.columns && Boolean(formik.errors.columns)}
                    helperText={(formik.touched.columns && formik.errors.columns) as string}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Features">
              <Grid container spacing={1} ml={2} mt={1}>
                {featureOptions.map((feature) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={feature}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                        />
                      }
                      label={feature}
                    />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RoomForm;
