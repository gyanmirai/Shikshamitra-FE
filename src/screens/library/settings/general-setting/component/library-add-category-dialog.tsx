import React from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { libraryAddCategoryValidationSchema } from './validationSchema';

import type { IAddCategoryDialogProps } from './libraray-category-dialog-interface';

const LibraryAddCategoryDialog: React.FC<IAddCategoryDialogProps> = ({ open, onClose }) => {
  const formik = useFormik({
    initialValues: {
      categoryName: '',
      description: '',
    },
    validationSchema: libraryAddCategoryValidationSchema,
    onSubmit: (values) => {
      onClose();
    },
  });

  return (
    <CustomDialog
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Add Category</Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Create and manage book categories here. When adding a new book you can select a category from this list."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      open={open}
      handleClose={onClose}
    >
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <ShakingTextField
              error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            >
              <TextField
                label="Category Name"
                name="categoryName"
                value={formik.values.categoryName}
                onChange={formik.handleChange}
                error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
                helperText={formik.touched.categoryName && formik.errors.categoryName}
                fullWidth
                required
                autoFocus
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.description && Boolean(formik.errors.description)}
            >
              <TextField
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                multiline
                rows={3}
                fullWidth
              />
            </ShakingTextField>
          </Box>
        </Scrollbar>
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            size="small"
            onClick={() => {
              formik.handleSubmit();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default LibraryAddCategoryDialog;
