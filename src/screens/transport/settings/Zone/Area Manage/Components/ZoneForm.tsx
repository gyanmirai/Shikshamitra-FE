'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddZoneAreaOptionsMutation,
  useUpdateZoneAreaOptionsMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import { zoneValidationSchema } from './ZoneValidationSchema';
import { getZoneAreaInitialValues } from './zoneInitialValues';

import type { IZoneAreaFormProps } from './type';

const ZoneAreaForm: React.FC<IZoneAreaFormProps> = ({ open, onClose, editData }) => {
  const currentMediumId = useSelector((state: RootState) => state.globalState.currentMedium?.id);
  const [addZoneAreaOptions, { isLoading: isAdding }] = useAddZoneAreaOptionsMutation();
  const [updateZoneAreaOptions, { isLoading: isUpdating }] = useUpdateZoneAreaOptionsMutation();

  const formik = useFormik({
    initialValues: getZoneAreaInitialValues(editData),
    validationSchema: zoneValidationSchema,
    onSubmit: async (values) => {
      try {
        if (!currentMediumId) {
          shikshaMitraToast.error({ message: 'Academic medium is required to save zone/area' });
          return;
        }

        const payload = {
          name: values.zoneName,
          description: values.description || '',
          isActive: true,
        };

        if (editData) {
          await updateZoneAreaOptions({
            zoneAreaId: editData.id,
            academicMediumId: currentMediumId,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Zone/Area: ${values.zoneName} updated successfully`,
          });
        } else {
          await addZoneAreaOptions({
            academicMediumId: currentMediumId,
            body: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `Zone/Area: ${values.zoneName} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save zone/area',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Zone/Area Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.zoneName && formik.errors.zoneName) || false}
            >
              <TextField
                fullWidth
                label="Zone/Area Name *"
                name="zoneName"
                size="small"
                value={formik.values.zoneName}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/^\d+/, '') // Remove leading numbers
                    .trimStart(); // Remove leading spaces
                  value = value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');

                  formik.setFieldValue('zoneName', value);
                }}
                error={formik.touched.zoneName && Boolean(formik.errors.zoneName)}
                helperText={formik.touched.zoneName && formik.errors.zoneName}
              />
            </ShakingTextField>
          </Grid>
          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          disabled={isAdding || isUpdating}
        >
          {isAdding || isUpdating ? 'Saving...' : editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ZoneAreaForm;
