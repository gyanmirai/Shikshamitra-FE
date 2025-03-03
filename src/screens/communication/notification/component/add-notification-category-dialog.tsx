import React from 'react';
import { useFormik } from 'formik';

import { Button, TextField, DialogContent, DialogActions } from '@mui/material';

interface AddNotificationCategoryDialogProps {
  onClose: () => void;
}

const AddNotificationCategoryDialog: React.FC<AddNotificationCategoryDialogProps> = ({
  onClose,
}) => {
  const formik = useFormik({
    initialValues: {
      categoryName: '',
      categoryDescription: '',
      subCategoyName: '',
      moduleName: '',
    },
    onSubmit: (values) => {
      console.log('Submitted values:', values);

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
        {/* <TextField
          name="categoryDescription"
          label="Description"
          value={formik.values.categoryDescription}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          multiline
          rows={3}
          margin="dense"
        /> */}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button onClick={onClose} type="submit" variant="outlined" color="primary">
          Save
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddNotificationCategoryDialog;
