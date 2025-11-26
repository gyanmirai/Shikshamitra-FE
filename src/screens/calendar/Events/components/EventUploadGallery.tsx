'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import { Grid, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IEventAnnouncement } from '../type';

const validationSchema = Yup.object({
  file: Yup.mixed()
    .required('Please upload a photo or video')
    .test('fileType', 'Only image or video files are allowed', (value) => {
      if (!value) return false;
      const file = Array.isArray(value) ? value[0] : value;
      return file && (file.type.startsWith('image/') || file.type.startsWith('video/'));
    }),
});

const UploadFileUploadForm = ({
  event,
  onClose,
}: {
  event: IEventAnnouncement | null;
  onClose?: (e: any, isSubmit: boolean) => void;
}) => {
  const formik = useFormik({
    initialValues: {
      file: [],
    },
    validationSchema,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: 'File uploaded successfully!',
      });
      onClose?.(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <FileUploader
              value={formik.values.file as any}
              multiple
              showVisibleDocumentCount={3}
              onChange={(value) => formik.setFieldValue('file', value)}
              primaryText="Please Upload Your Files"
              secondaryText="Maximum file size is 5MB per file"
            />
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose?.(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          type="submit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default UploadFileUploadForm;
