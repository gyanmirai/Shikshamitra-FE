'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
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
  useAddAnnouncementTypeMutation,
  useUpdateAnnouncementTypeMutation,
} from 'src/redux/communication/setting/announcementTypeSetting';

import { announcementTypeValidationSchema } from './AnnouncementTypeValidation';
import { getAnnouncementTypeInitialValues } from './AnnoucementTypeinitialValues';

import type { IAnnouncementType, IAnnouncementFormProps } from './type';

const AnnouncementTypeForm: React.FC<IAnnouncementFormProps> = ({ open, onClose, editData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [addAnnouncementType, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAnnouncementTypeMutation,
  });
  const [updateAnnouncementType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAnnouncementTypeMutation,
  });
  const formik = useFormik({
    initialValues: getAnnouncementTypeInitialValues(editData),
    validationSchema: announcementTypeValidationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          const payload = {
            data: {
              id: (editData as IAnnouncementType).id,
              announcementType: values.announcementType,
              color: values.color,
              description: values.description,
            },
          };
          await updateAnnouncementType(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.announcementType}" Announcement type updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            data: {
              announcementType: values.announcementType,
              color: values.color,
              description: values.description,
            },
          };
          await addAnnouncementType(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.announcementType}" Announcement type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save subject', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
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
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Announcment Type Color *
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          loading={isAddLoading || isUpdateLoading}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AnnouncementTypeForm;
