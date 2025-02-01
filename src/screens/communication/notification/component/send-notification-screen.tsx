import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { Grid, Button, Checkbox, DialogContent, DialogActions } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

// Placeholder options for dynamic message formatting
const placeholderOptions = [
  { label: 'Student Name', value: '[Student Name]' },
  { label: 'Due Date', value: '[Due Date]' },
  { label: 'Fee Amount', value: '[Amount]' },
];

// Sample templates for different categories
const templates = {
  overdueFee: 'Dear [Student Name], your fee of [Amount] is overdue. Please pay before [Due Date].',
  feeReminder: 'Hello [Student Name], kindly pay your fee amount [Amount] before [Due Date].',
};

// Sample student data
const allStudents = [
  { id: 1, name: 'Alice Johnson', class: 'Class 1', division: 'A', organization: 'Org 1' },
  { id: 2, name: 'Bob Smith', class: 'Class 2', division: 'B', organization: 'Org 2' },
  { id: 3, name: 'Charlie Brown', class: 'Class 1', division: 'A', organization: 'Org 1' },
  { id: 4, name: 'David Williams', class: 'Class 3', division: 'C', organization: 'Org 3' },
  { id: 5, name: 'Emma Davis', class: 'Class 2', division: 'B', organization: 'Org 2' },
];

const SendNotificationScreen = () => {
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [messageTemplate, setMessageTemplate] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      organization: '',
      class: '',
      division: '',
      category: '',
      template: '',
    },
    onSubmit: (values) => {
      console.log('Sending Notification:', selectedStudents, messageTemplate);
    },
  });

  // **Filter students based on selected filters**
  useEffect(() => {
    const { organization, class: selectedClass, division } = formik.values;

    const filtered = allStudents.filter(
      (student) =>
        (!organization || student.organization === organization) &&
        (!selectedClass || student.class === selectedClass) &&
        (!division || student.division === division)
    );

    setFilteredStudents(filtered);
  }, [formik.values.organization, formik.values.class, formik.values.division, formik.values]);

  type TemplateKeys = 'overdueFee' | 'feeReminder';

  useEffect(() => {
    const templateKey = formik.values.template as TemplateKeys;

    if (templateKey in templates) {
      setMessageTemplate(templates[templateKey]);
    } else {
      setMessageTemplate('');
    }
  }, [formik.values.template]);

  // **Select or Deselect Students**
  const toggleStudentSelection = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} pt="20px">
            {/* Select Organization */}
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Organization"
                options={[
                  { label: 'Org 1', value: 'Org 1' },
                  { label: 'Org 2', value: 'Org 2' },
                  { label: 'Org 3', value: 'Org 3' },
                ]}
                value={formik.values.organization}
                onChange={(val) => formik.setFieldValue('organization', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            {/* Select Class */}
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Class"
                options={[
                  { label: 'Class 1', value: 'Class 1' },
                  { label: 'Class 2', value: 'Class 2' },
                  { label: 'Class 3', value: 'Class 3' },
                ]}
                value={formik.values.class}
                onChange={(val) => formik.setFieldValue('class', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            {/* Select Division */}
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Division"
                options={[
                  { label: 'A', value: 'A' },
                  { label: 'B', value: 'B' },
                  { label: 'C', value: 'C' },
                ]}
                value={formik.values.division}
                onChange={(val) => formik.setFieldValue('division', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>

          {/* Category & Template Selection */}
          <Grid container spacing={2} pt="20px">
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Category"
                options={[
                  { label: 'Overdue Fee', value: 'overdueFee' },
                  { label: 'Fee Reminder', value: 'feeReminder' },
                ]}
                value={formik.values.category}
                onChange={(val) => formik.setFieldValue('category', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Select Template"
                options={
                  formik.values.category
                    ? [
                        { label: 'Overdue Fee Template', value: 'overdueFee' },
                        { label: 'Fee Reminder Template', value: 'feeReminder' },
                      ]
                    : []
                }
                value={formik.values.template}
                onChange={(val) => formik.setFieldValue('template', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button type="submit" variant="contained" color="primary">
            Send Notification
          </Button>
        </DialogActions>
      </form>

      {/* Students Table */}
      <CustomizableTable
        columns={[
          {
            id: 'select',
            label: '',
            render: (_, row) => (
              <Checkbox
                checked={selectedStudents.includes(row.id)}
                onChange={() => toggleStudentSelection(row.id)}
              />
            ),
          },
          { id: 'name', label: 'Student Name' },
          {
            id: 'message',
            label: 'Message',
            render: (_, row) => {
              if (!formik.values.template) return '';
              return messageTemplate
                .replace('[Student Name]', row.name)
                .replace('[Amount]', '5000') // Placeholder amount
                .replace('[Due Date]', '15th Feb'); // Placeholder date
            },
          },
        ]}
        data={filteredStudents}
        tableId="send-notification-table"
      />
    </>
  );
};

export default SendNotificationScreen;
