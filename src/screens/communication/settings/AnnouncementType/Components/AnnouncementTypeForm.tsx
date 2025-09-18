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

import { announcementTypeValidationSchema } from './AnnouncementTypeValidation';
import { getAnnouncementTypeInitialValues } from './AnnoucementTypeinitialValues';

import type { IAnnouncementFormProps } from './type';

const AnnouncementTypeForm: React.FC<IAnnouncementFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getAnnouncementTypeInitialValues(editData),
    validationSchema: announcementTypeValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.announcementType} updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.announcementType} added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Announcement Type Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.announcementType && formik.errors.announcementType) || false}
            >
              <TextField
                fullWidth
                label="Announcement Type Name *"
                name="announcementType"
                size="small"
                value={formik.values.announcementType}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('announcementType', value);
                }}
                error={formik.touched.announcementType && Boolean(formik.errors.announcementType)}
                helperText={
                  (formik.touched.announcementType && formik.errors.announcementType) as string
                }
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

export default AnnouncementTypeForm;
