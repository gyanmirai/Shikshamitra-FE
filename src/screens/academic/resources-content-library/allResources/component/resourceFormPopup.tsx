'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import type { TResource } from '../all-resources';

interface ResourceFormProps {
  onSubmit: (values: TResource) => void;
  onClose: () => void;
  data: TResource | null;
  isEdit: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'draft'));
  const dialog = useBoolean();
  const formik = useFormik<TResource>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      resourceName: isEdit && data ? data.resourceName : '',
      category: isEdit && data ? data.category : '',
      fileType: isEdit && data ? data.fileType : '',
      description: isEdit && data ? data.description : '',
      status: isEdit && data ? data.status : 'draft',
      uploadedBy: '',
      dateUploaded: isEdit && data ? dayjs(data.dateUploaded) : null,
    },
    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        status: isDraft ? 'Unpublish' : 'Publish',
        uploadedBy: 'abc',
        dateUploaded: isEdit ? dayjs(values.dateUploaded) : dayjs(), // Only update if not in edit mode
      };
      onSubmit(updatedValues);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '250px' }}>
          <Grid container spacing={2} marginTop={1}>
            <Grid size={{ xs: 12 }}>
              <TextField
                disabled={isEdit}
                label="Resource Title"
                size="small"
                name="resourceName"
                value={formik.values.resourceName}
                onChange={formik.handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                disabled={isEdit}
                label="Description"
                size="small"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomSelect
                label="Category"
                options={[
                  { value: 'Worksheet', label: 'Worksheet' },
                  { value: 'audio', label: 'Audio' },
                  { value: 'document', label: 'Document' },
                ]}
                value={formik.values.category}
                onChange={(val) => {
                  formik.setFieldValue('typeOfResource', val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            {/* <Grid size={{ xs: 12 }}>
      <CustomSelect
        label="File Type"
        options={[
          { value: 'video', label: 'Video' },
          { value: 'audio', label: 'Audio' },
          { value: 'document', label: 'Document' },
        ]}
        value={formik.values.fileType}
        onChange={(val) => {
          formik.setFieldValue('fileType', val as string);
        }}
        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
      />
    </Grid> */}

            <Grid size={{ xs: 12 }}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Drag Your Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsDraft(true);
              formik.handleSubmit();
            }}
            color="warning"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              setIsDraft(false);
              formik.handleSubmit();
            }}
          >
            Save and Publish
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default ResourceForm;
