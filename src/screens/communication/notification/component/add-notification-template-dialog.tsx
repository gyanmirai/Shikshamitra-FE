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
  const editorRef = useRef<HTMLTextAreaElement | null>(null); // Reference for the editor

  const formik = useFormik({
    initialValues: {
      category: '',
      templateName: '',
      content: '',
      notificationType: '',
      subCategory: '',
      role: '',
    },
    onSubmit: (values) => {},
  });

  // Function to insert placeholder at cursor position
  const handleInsertPlaceholder = (value: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current; // Reference to the text editor
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
        textarea.setSelectionRange(startPos + value.length, startPos + value.length);
      }, 0);
    }

    setAnchorEl(null); // Close the dropdown
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent>
        <Grid container spacing={2} pt="20px">
          {/* Category Selection */}
          <Grid item xs={6}>
            <CustomSelect
              label="Select Category"
              options={[{ label: 'Fees', value: 'feeReminder' }]}
              value={formik.values.category}
              onChange={(value) => formik.setFieldValue('category', value)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              label="Select Sub Category"
              options={[{ label: 'Overdue', value: 'overdue' }]}
              value={formik.values.subCategory}
              onChange={(value) => formik.setFieldValue('subCategory', value)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              label="Select Type"
              options={[
                { label: 'Manual', value: 'manual' },
                { label: 'Auto', value: 'auto' },
              ]}
              value={formik.values.notificationType}
              onChange={(value) => formik.setFieldValue('notificationType', value)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomSelect
              label="Select Role"
              options={
                formik.values.category
                  ? [
                      { label: 'Parent', value: 'parent' },
                      { label: 'Teacher', value: 'teacher' },
                    ]
                  : []
              }
              value={formik.values.role}
              onChange={(val) => formik.setFieldValue('role', val)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>
          {/* Template Name Field */}

          <Grid item xs={6}>
            <TextField
              name="templateName"
              label="Template Name"
              value={formik.values.templateName}
              onChange={formik.handleChange}
              size="small"
              fullWidth
              margin="dense"
              sx={{ margin: 0, padding: 0 }}
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

            <TextField
              inputRef={editorRef} // Use inputRef instead of ref
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
