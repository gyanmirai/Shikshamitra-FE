import React from 'react';
import { useFormik } from 'formik';

import { Button, TextField, DialogContent, DialogActions } from '@mui/material';

interface AddEventListDialogProps {
  onClose: () => void;
}

const AddEventListDialog: React.FC<AddEventListDialogProps> = ({ onClose }) => {
  const formik = useFormik({
    initialValues: {
      eventName: '',
      eventDescription: '',
    },
    onSubmit: (values) => {
      console.log('Submitted values:', values);

      onClose(); // Close dialog after submitting
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        {/* Category Name Field */}
        <TextField
          name="eventName"
          label="Event Name"
          value={formik.values.eventName}
          onChange={formik.handleChange}
          size="small"
          fullWidth
          margin="dense"
        />

        {/* Description Field */}
        <TextField
          name="enterDescription"
          label="Event Description"
          value={formik.values.eventDescription}
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
        <Button onClick={onClose} type="submit" variant="outlined" color="primary">
          Save
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddEventListDialog;
