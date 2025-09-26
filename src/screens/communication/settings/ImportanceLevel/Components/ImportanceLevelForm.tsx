'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { importanceLevelValidationSchema } from './ImportanceLevelValidation';
import { getImportanceLevelInitialValues } from './ImportanceLevelInitialValues';

import type { IImportanceLevelFormProps } from '../type';

const ImportanceLevelForm: React.FC<IImportanceLevelFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getImportanceLevelInitialValues(editData),
    validationSchema: importanceLevelValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Importance level : ${values.levelName} has been successfully updated`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Importance level : ${values.levelName} has been successfully added`,
        });
      }
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Importance Level Name */}
          <Grid size={12}>
            <ShakingTextField
              error={!!(formik.touched.levelName && formik.errors.levelName) || false}
            >
              <TextField
                fullWidth
                label="Importance Level Name *"
                name="levelName"
                size="small"
                value={formik.values.levelName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('levelName', value);
                }}
                error={formik.touched.levelName && Boolean(formik.errors.levelName)}
                helperText={(formik.touched.levelName && formik.errors.levelName) as string}
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
                Importance Level Color *
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
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ImportanceLevelForm;
