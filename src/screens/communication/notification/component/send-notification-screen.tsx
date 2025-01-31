import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
  Grid,
  Button,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  FormControl,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select'; // Custom select component
import { CheckBox } from '@mui/icons-material';

import CustomizableTable from 'src/components/customizabaleTable';
// Assuming the Editor component is pre-built

// Placeholder options
const placeholderOptions = [
  { label: 'Fee Type', value: '[Fee Type]' },
  { label: 'Month/Term', value: '[Month/Term]' },
  { label: 'Due Date', value: '[Due Date]' },
  { label: 'Amount', value: '[Amount]' },
];

const SendNotificationScreen = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipient, setRecipient] = useState<string>(''); // For recipient
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<any>({
    organization: '',
    class: '',
    division: '',
    absentWithoutNotice: false,
    lateFee: false,
    overdueFee: false,
    library: false,
    transport: false,
    homework: false,
  });

  // Sample data for filters
  const organizations = ['Org 1', 'Org 2', 'Org 3'];
  const classes = ['Class 1', 'Class 2', 'Class 3'];
  const divisions = ['Division A', 'Division B', 'Division C'];

  const formik = useFormik({
    initialValues: {
      category: '',
      templateName: '',
      content: '',
      organization: '',
    },
    onSubmit: (values) => {
      console.log('Sending Notification with values:', values);
    },
  });

  // Insert placeholder into the editor content
  const handleInsertPlaceholder = (value: string) => {
    if (formik.values.content) {
      const newText = `${formik.values.content} ${value}`;
      formik.setFieldValue('content', newText);
    }
    setAnchorEl(null); // Close dropdown
  };

  // Handle change for the filters
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Filters Section */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* Select Organization */}
                <Grid item xs={12} md={4}>
                  <CustomSelect
                    label="Select Organization"
                    options={[{ label: 'Fee Reminders', value: 'feeReminder' }]}
                    value={formik.values.organization}
                    onChange={(value) => formik.setFieldValue('organization', value)}
                    formControlProps={{ sx: { minWidth: 140 }, fullWidth: true }}
                  />
                  {/* <CustomSelect
                                        label="Select Organization"
                                        options={organizations.map((org) => ({ label: org, value: org }))}
                                        value={filters.organization}
                                        onChange={(value) => handleFilterChange('organization', value)}
                                        formControlProps={{ fullWidth: true }}
                                    /> */}
                </Grid>

                {/* Select Class */}
                <Grid item xs={12} md={4}>
                  <CustomSelect
                    label="Select Class"
                    options={classes.map((cls) => ({ label: cls, value: cls }))}
                    value={filters.class}
                    onChange={(value) => handleFilterChange('class', value)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>

                {/* Select Division */}
                <Grid item xs={12} md={4}>
                  <CustomSelect
                    label="Select Division"
                    options={divisions.map((div) => ({ label: div, value: div }))}
                    value={filters.division}
                    onChange={(value) => handleFilterChange('division', value)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                {/* Additional Filters */}
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.absentWithoutNotice}
                        onChange={(e) =>
                          handleFilterChange('absentWithoutNotice', e.target.checked)
                        }
                      />
                    }
                    label="Absent without Notice"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.lateFee}
                        onChange={(e) => handleFilterChange('lateFee', e.target.checked)}
                      />
                    }
                    label="Late Fee"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.overdueFee}
                        onChange={(e) => handleFilterChange('overdueFee', e.target.checked)}
                      />
                    }
                    label="Overdue Fee"
                  />
                </Grid>

                {/* More checkboxes for library, transport, homework can be added here */}
              </Grid>
            </Grid>

            {/* Select Template */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  label="Select Template"
                >
                  <MenuItem value="feeReminder">Fee Reminder</MenuItem>
                  <MenuItem value="overdueFeeReminder">Overdue Fee Reminder</MenuItem>
                  {/* More templates can be added here */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button type="submit" variant="outlined" color="primary">
            Send Notification
          </Button>
        </DialogActions>
      </form>

      <CustomizableTable
        columns={[
          {
            id: 'select',
            label: '',
            render(value, row) {
              return <CheckBox />;
            },
          },
          { id: 'student', label: 'Name' },
          { id: 'message', label: 'Message' },
        ]}
        data={[]}
        tableId="send-notification-table"
      />
    </>
  );
};

export default SendNotificationScreen;
