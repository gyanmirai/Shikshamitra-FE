'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddServiceTypeMutation,
  useUpdateServiceTypeMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import { serviceTypeValidationSchema } from './ServiceTypeValidation';
import { getServiceTypeInitialValues } from './ServiceTypeInitialValues';

import type { IServiceTypeFormProps } from './type';

const ServiceTypeForm: React.FC<IServiceTypeFormProps> = ({ open, onClose, editData }) => {
  const { addServiceType, isLoading: isAdding } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddServiceTypeMutation,
  });
  const { updateServiceType, isLoading: isUpdating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateServiceTypeMutation,
  });

  const formik = useFormik({
    initialValues: getServiceTypeInitialValues(editData),
    validationSchema: serviceTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.typeName,
          description: values.description || '',
          isActive: true,
        };

        if (editData) {
          await updateServiceType({
            servicingTypeId: editData.id,
            body: payload,
          });
          shikshaMitraToast.success({
            message: `Service Type: ${values.typeName} updated successfully`,
          });
        } else {
          await addServiceType(payload);
          shikshaMitraToast.success({
            message: `Service Type: ${values.typeName} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save service type',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Servicing Type Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.typeName && formik.errors.typeName) || false}
            >
              <TextField
                fullWidth
                label="Type Name *"
                name="typeName"
                size="small"
                value={formik.values.typeName}
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

                  formik.setFieldValue('typeName', value);
                }}
                error={formik.touched.typeName && Boolean(formik.errors.typeName)}
                helperText={formik.touched.typeName && formik.errors.typeName}
              />
            </ShakingTextField>
          </Grid>
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

export default ServiceTypeForm;
