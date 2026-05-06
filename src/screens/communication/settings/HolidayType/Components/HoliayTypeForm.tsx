'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddHolidayTypeMutation,
  useUpdateHolidayTypeMutation,
} from 'src/redux/communication/holiday/holidayDataApi';

import { holidayTypeValidationSchema } from './HolidayTypeValidation';
import { getHolidayTypeInitialValues } from './HolidayTypeInitialValues';

import type { IHolidayFormProps } from '../type';

const HolidayTypeForm: React.FC<IHolidayFormProps> = ({ open, onClose, editData }) => {
  const [addHolidayType] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHolidayTypeMutation,
  });

  const [updateHolidayType] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHolidayTypeMutation,
  });

  const formik = useFormik({
    initialValues: getHolidayTypeInitialValues(editData),
    validationSchema: holidayTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editData) {
          // Update existing holiday type
          await updateHolidayType({
            holidayTypeId: editData.id || '',
            data: {
              name: values.holidayType,
              color: values.color,
              description: values.description,
            },
          }).unwrap();

          shikshaMitraToast.success({
            message: `Holiday type: ${values.holidayType} has been successfully updated`,
          });
        } else {
          // Create new holiday type
          await addHolidayType({
            name: values.holidayType,
            color: values.color,
            description: values.description,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Holiday type: ${values.holidayType} has been successfully created`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        console.error(error);
        shikshaMitraToast.error({
          message:
            error?.data?.message || `Failed to ${editData ? 'update' : 'create'} holiday type`,
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Holiday Type Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.holidayType && formik.errors.holidayType) || false}
            >
              <TextField
                fullWidth
                label="Holiday Type Name *"
                name="holidayType"
                size="small"
                value={formik.values.holidayType}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('holidayType', value);
                }}
                error={formik.touched.holidayType && Boolean(formik.errors.holidayType)}
                helperText={(formik.touched.holidayType && formik.errors.holidayType) as string}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Holiday Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('color', color)}
                initialColor={formik.values.color}
              />
            </ShakingTextField>
          </Grid>
          {/* Description */}
          <Grid size={12}>
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
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Submitting...' : editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default HolidayTypeForm;
