'use client';

import { useState } from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { announcementImpValidationSchema } from '../../validationSchema';

import type { IImportantFormProps } from '../../type';

export const ImportantForm: React.FC<IImportantFormProps> = ({
  onSubmit,
  data = null,
  isEdit = false,
}: IImportantFormProps) => {
  // State to track if the announcement is in draft status
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    // Set initial form values from provided data or empty strings
    initialValues: {
      importantLevel: data?.importantLevel || '',
      importantLevelDesc: data?.importantLevelDesc || '',
    },
    validationSchema: announcementImpValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(), // Use existing ID or generate new timestamp-based ID
        status: isDraft ? 'Unpublish' : 'Publish', // Set status based on draft state
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.importantLevel && formik.errors.importantLevel) || false}
              >
                <TextField
                  fullWidth
                  label="Important Level"
                  name="importantLevel"
                  size="small"
                  value={formik.values.importantLevel}
                  onChange={formik.handleChange}
                  error={formik.touched.importantLevel && Boolean(formik.errors.importantLevel)}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={
                  !!(formik.touched.importantLevelDesc && formik.errors.importantLevelDesc) || false
                }
              >
                <TextField
                  fullWidth
                  label="Important Level Desc"
                  name="importantLevelDesc"
                  size="small"
                  rows={4}
                  multiline
                  value={formik.values.importantLevelDesc}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.importantLevelDesc && Boolean(formik.errors.importantLevelDesc)
                  }
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
