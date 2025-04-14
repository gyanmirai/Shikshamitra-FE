import React from 'react';
import { useFormik } from 'formik';

import { TextField, DialogContent, DialogActions } from '@mui/material';

import SubmitButton from 'src/components/submit-button';

import type { IAddEventListDialogProps } from '../notification-interface';

const AddEventListDialog: React.FC<IAddEventListDialogProps> = ({ onClose }) => {
  const formik = useFormik({
    initialValues: {
      eventName: '',
      eventDescription: '',
    },
    onSubmit: (values) => {
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
        <SubmitButton onClick={onClose} />
      </DialogActions>
    </form>
  );
};

export default AddEventListDialog;
