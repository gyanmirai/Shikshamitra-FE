'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useSubjectForm } from './hooks/useSubjectForm';

import type { ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ open, onClose, editData }) => {
  const { formik, isSaveLoading } = useSubjectForm({
    onClose,
    editData,
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
            >
              <TextField
                fullWidth
                label="Subject Name *"
                name="subjectName"
                size="small"
                value={formik.values.subjectName}
                onChange={(e) => {
                  const value = e.target.value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('subjectName', value);
                }}
                error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                helperText={formik.touched.subjectName && formik.errors.subjectName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  color={
                    formik.touched.subjectColor && formik.errors.subjectColor
                      ? 'error.main'
                      : 'text.primary'
                  }
                >
                  Subject Color *
                </Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="This subject color is used throughout the system to visually identify this subject."
                >
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer' }}
                      color="info.main"
                      width={18}
                      height={18}
                    />
                  </Box>
                </CustomTooltip>
              </Box>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                initialColor={formik.values.subjectColor}
              />
            </ShakingTextField>
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
          size="small"
          variant="contained"
          loading={isSaveLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => formik.handleSubmit(e)}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default SettingSubjectForm;
