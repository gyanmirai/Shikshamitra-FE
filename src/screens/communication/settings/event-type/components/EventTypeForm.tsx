'use client';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddEventTypeMutation,
  useUpdateEventTypeMutation,
} from 'src/redux/calendar/events/eventTypeApi';

import { eventTypeValidationSchema } from './EventTypeValidation';
import { getEventTypeInitialValues } from './EventTypeInitialValue';

import type { IEventFormProps } from '../type';

const EventTypeForm: React.FC<IEventFormProps> = ({ open, onClose, editData }) => {
  const [addEventType, { isLoading: addEventTypeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEventTypeMutation,
  });

  const [updateEventType, { isLoading: updateEventTypeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEventTypeMutation,
  });

  const formik = useFormik({
    initialValues: getEventTypeInitialValues(editData),
    validationSchema: eventTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editData) {
          // Update existing event type
          await updateEventType({
            eventTypeId: editData?.id,
            body: {
              name: values.name,
              color: values.color,
              description: values.description,
            },
          }).unwrap();

          shikshaMitraToast.success({
            message: `Event type: ${values.name} has been successfully updated`,
          });
        } else {
          // Create new event type
          await addEventType({
            name: values.name,
            color: values.color,
            description: values.description,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Event type: ${values.name} has been successfully created`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || `Failed to ${editData ? 'update' : 'create'} event type`,
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Event Type Name */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Event Type Name *"
                name="name"
                size="small"
                value={formik.values.name}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('name', value);
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={(formik.touched.name && formik.errors.name) as string}
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
                Event Type Color *
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
        <LoadingButton
          loading={addEventTypeLoading || updateEventTypeLoading}
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
        >
          {formik.isSubmitting ? 'Submitting...' : editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default EventTypeForm;
