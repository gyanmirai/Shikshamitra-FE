import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import React, { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

interface AddNewBookDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
}

const AddNewBookDialog: React.FC<AddNewBookDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
}) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

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

  const formik = useFormik<any>({
    initialValues: {},
    onSubmit: (values: any) => {
      console.log('Form Submitted:', values);
      onSave(values);
    },
  });

  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Book Management"
          links={[{ name: 'Library' }, { name: 'Book Management' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3} pt="10px">
            {/* Book Details */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="bookTitle"
                label="Book Title"
                value={formik.values.bookTitle}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="bookAuthor"
                label="Book Author"
                value={formik.values.bookAuthor}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="publisher"
                label="Publisher"
                value={formik.values.publisher}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Language"

                                    options={[{ value: 'English', lable: 'English' },

                                    ]}
                                    value={formik.values.language}
                                    onChange={(value) => formik.setFieldValue('language', value)}
                                    formControlProps={{ fullWidth: true }}
                                />
                            </Grid> */}

            {/* Edition Details */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Year"
                value={formik.values.year}
                onChange={(value) => formik.setFieldValue('year', value)}
                size="small"
                disabled={isEdit}
                fullWidth
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="totalCopies"
                                    label="Total Copies"
                                    value={formik.values.totalCopies}
                                    onChange={formik.handleChange}
                                    size="small"
                                    type="number"
                                />
                            </Grid> */}
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Category"
                options={[]}
                value={formik.values.category}
                onChange={(value) => formik.setFieldValue('category', value)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Condition"
                options={[]}
                value={formik.values.condition}
                onChange={(value) => formik.setFieldValue('condition', value)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            <Grid item xs={12} md={12}>
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
            <Grid item xs={12} md={12}>
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

          <DialogActions>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </>
  );
};

export default AddNewBookDialog;

// import React from 'react';
// import { useFormik } from 'formik';

// import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog';
// import CustomSelect from 'src/components/custom-select';

// interface AddNewBookDialogProps {
//     dialogValue: boolean;
//     data: any;
//     onSave: (values: any) => void;
//     onClose: () => void;
//     isEdit: boolean;
// }

// const AddNewBookDialog: React.FC<AddNewBookDialogProps> = ({
//     dialogValue,
//     data,
//     onSave,
//     onClose,
//     isEdit,
// }) => {
//     const formik = useFormik<any>({
//         initialValues: {
//             bookTitle: '',
//             bookAuthor: '',
//             isbn: '',
//             tags: '',
//             quantity: '',
//             category: '',
//             condition: '',
//         },
//         onSubmit: (values: any) => {
//             console.log('Form Submitted:', values);
//             onSave(values);
//         },
//     });

//     return (
//         <CustomDialog
//             title={`${isEdit ? 'Edit' : 'Create New'} Book Entry`}
//             open={dialogValue}
//             handleClose={onClose}
//         >
//             <Box>
//                 <form onSubmit={formik.handleSubmit}>
//                     <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
//                         <Grid container spacing={3} pt="10px">
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="bookTitle"
//                                     label="Book Title"
//                                     value={formik.values.bookTitle}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="bookAuthor"
//                                     label="Book Author"
//                                     value={formik.values.bookAuthor}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="isbn"
//                                     label="ISBN"
//                                     value={formik.values.isbn}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                     type="number"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="tags"
//                                     label="Tags"
//                                     value={formik.values.tags}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <TextField
//                                     fullWidth
//                                     name="quantity"
//                                     label="Quantity"
//                                     value={formik.values.quantity}
//                                     onChange={formik.handleChange}
//                                     size="small"
//                                     type="number"
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Year"
//                                     options={[]}
//                                     value={formik.values.year}
//                                     onChange={(value) => formik.setFieldValue('year', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Category"
//                                     options={[]}
//                                     value={formik.values.category}
//                                     onChange={(value) => formik.setFieldValue('category', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                             <Grid item xs={12} md={6}>
//                                 <CustomSelect
//                                     label="Condition"
//                                     options={[]}
//                                     value={formik.values.condition}
//                                     onChange={(value) => formik.setFieldValue('condition', value)}
//                                     formControlProps={{ fullWidth: true }}
//                                     disabled={isEdit}
//                                 />
//                             </Grid>
//                         </Grid>
//                     </Scrollbar>
//                     <DialogActions>
//                         <Button type="submit" variant="contained" size="small">
//                             Save
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Box>
//         </CustomDialog>
//     );
// };

// export default AddNewBookDialog;
