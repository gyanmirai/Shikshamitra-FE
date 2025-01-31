import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';

import {
  Grid,
  Menu,
  Button,
  MenuItem,
  TextField,
  DialogContent,
  DialogActions,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const placeholderOptions = [
  { label: 'Fee Type', value: '[Fee Type]' },
  { label: 'Month/Term', value: '[Month/Term]' },
  { label: 'Due Date', value: '[Due Date]' },
  { label: 'Amount', value: '[Amount]' },
];

const AddNotificationTemplateDialog = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const editorRef = useRef<any>(null); // Reference for the editor

  const formik = useFormik({
    initialValues: {
      category: '',
      templateName: '',
      content: '',
    },
    onSubmit: (values) => {
      console.log('Submitted values:', values);
    },
  });

  // Function to insert placeholder at cursor position
  const handleInsertPlaceholder = (value: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current; // Reference to the text editor

      // Get current cursor position
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      // Insert the placeholder at the cursor position
      const newText =
        formik.values.content.substring(0, startPos) +
        value +
        formik.values.content.substring(endPos);

      // Update the form state
      formik.setFieldValue('content', newText);

      // Restore the cursor position after inserting text
      setTimeout(() => {
        textarea.selectionStart = startPos + value.length;
        textarea.selectionEnd = startPos + value.length;
      }, 0);
    }

    setAnchorEl(null); // Close the dropdown
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Category Selection */}
          <Grid item xs={12} md={6}>
            <CustomSelect
              label="Select Category"
              options={[{ label: 'Fee Reminders', value: 'feeReminder' }]}
              value={formik.values.category}
              onChange={(value) => formik.setFieldValue('category', value)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>

          {/* Template Name Field */}
          <Grid item xs={12} md={6}>
            <TextField
              name="templateName"
              label="Template Name"
              value={formik.values.templateName}
              onChange={formik.handleChange}
              size="small"
              fullWidth
              margin="dense"
            />
          </Grid>

          {/* Editor with Placeholder Dropdown */}
          <Grid item xs={12} display="flex" flexDirection="column">
            <Button
              variant="outlined"
              size="small"
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ alignSelf: 'flex-end', mb: 1 }}
            >
              Insert Placeholder
            </Button>

            {/* Editor */}
            {/* <Editor
                            ref={editorRef} // Attach reference to Editor
                            value={formik.values.content}
                            onChange={(value) => formik.setFieldValue('content', value)}
                            placeholder="Type your message here..."
                            sx={{ width: '100%' }}
                        /> */}

            <TextField
              ref={editorRef}
              value={formik.values.content}
              onChange={(e) => formik.setFieldValue('content', e.target.value)}
              multiline
              rows={6}
            />

            {/* Dropdown for Placeholder Options */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {placeholderOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => handleInsertPlaceholder(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button type="submit" variant="outlined" color="primary">
          Save
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddNotificationTemplateDialog;
