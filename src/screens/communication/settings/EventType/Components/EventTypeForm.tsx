'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { eventTypeValidationSchema } from './EventTypeValidation';
import { getEventTypeInitialValues } from './EventTypeInitialValue';

import type { IEventFormProps } from '../type';

const EventTypeForm: React.FC<IEventFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getEventTypeInitialValues(editData),
    validationSchema: eventTypeValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.eventType} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.eventType} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Event Type Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.eventType && formik.errors.eventType) || false}
            >
              <TextField
                fullWidth
                label="Event Type Name *"
                name="eventType"
                size="small"
                value={formik.values.eventType}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('eventType', value);
                }}
                error={formik.touched.eventType && Boolean(formik.errors.eventType)}
                helperText={(formik.touched.eventType && formik.errors.eventType) as string}
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
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default EventTypeForm;
