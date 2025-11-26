import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import type { IAddNewBookDialogProps } from '../book-management-interface';

const AddNewBookDialog: React.FC<IAddNewBookDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
}) => {
  // Initial form values for the book details
  const initialValues = useMemo(
    () => ({
      bookTitle: '',
      bookAuthor: '',
      isbn: '',
      tags: '',
      totalCopies: '',
      availableCopies: '',
      category: '',
      condition: '',
      year: '',
      publisher: '',
      language: '',
      editionNotes: '',
    }),
    []
  );

  // Initialize formik for form handling
  const formik = useFormik<any>({
    initialValues,
    onSubmit: (values: any) => {
      onSave(values); // Pass form values to parent component
    },
  });

  return (
    <CustomDialog title="Add New Book" open={dialogValue} handleClose={onClose} maxWidth="md">
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
            <Grid container spacing={3} pt="10px">
              {/* Book Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="bookTitle"
                  label="Book Title"
                  value={formik.values.bookTitle}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="bookAuthor"
                  label="Book Author"
                  value={formik.values.bookAuthor}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="isbn"
                  label="ISBN"
                  value={formik.values.isbn}
                  onChange={formik.handleChange}
                  size="small"
                  type="number"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="publisher"
                  label="Publisher"
                  value={formik.values.publisher}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>

              {/* Edition Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Year"
                  value={formik.values.year}
                  onChange={(value) => formik.setFieldValue('year', value)}
                  size="small"
                  disabled={isEdit}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  name="availableCopies"
                  label="Available Copies"
                  value={formik.values.availableCopies}
                  onChange={formik.handleChange}
                  size="small"
                  type="number"
                />
              </Grid>

              {/* Additional Metadata */}
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Category"
                  options={[]}
                  value={formik.values.category}
                  onChange={(value) => formik.setFieldValue('category', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  label="Condition"
                  options={[]}
                  value={formik.values.condition}
                  onChange={(value) => formik.setFieldValue('condition', value)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
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
                      <Typography variant="body2">Drag Your Picture</Typography>
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

              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  fullWidth
                  name="editionNotes"
                  label="Edition Notes"
                  value={formik.values.editionNotes}
                  onChange={formik.handleChange}
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <SubmitButton onClick={() => {}} />
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default AddNewBookDialog;
