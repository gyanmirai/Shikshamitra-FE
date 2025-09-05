import React from 'react';
import { useFormik } from 'formik';
import SubmitButton from 'src/components/submit-button';
import { TextField, DialogContent, DialogActions } from '@mui/material';

import type { IAddNotificationCategoryDialogProps } from '../notification-interface';

const AddNotificationCategoryDialog: React.FC<IAddNotificationCategoryDialogProps> = ({
  onClose,
}) => {
  const formik = useFormik({
    initialValues: {
      categoryName: '',
      placeHolderList: '',
      subCategoyName: '',
      moduleName: '',
    },
    onSubmit: (values) => {
      onClose(); // Close dialog after submitting
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        <TextField
          name="moduleName"
          label="Module Name"
          value={formik.values.moduleName}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          margin="dense"
        />

        {/* Category Name Field */}
        <TextField
          name="categoryName"
          label="Category Name"
          value={formik.values.categoryName}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          margin="dense"
        />

        <TextField
          name="subCategoryName"
          label="Sub Category Name"
          value={formik.values.subCategoyName}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          margin="dense"
        />

        {/* Description Field */}
        <TextField
          name="enterplaceholder"
          label="Enter Placeholder(s) (separate with commas)"
          value={formik.values.placeHolderList}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          multiline
          rows={4}
          margin="dense"
        />
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};

export default AddNotificationCategoryDialog;
