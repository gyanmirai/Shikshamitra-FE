import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  Typography,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import { templates, allStudents } from '../notification-data';

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
    onSubmit: (values) => {},
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
            {/* Select Class, Division & Role */}
            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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
                value={formik.values.template}
                onChange={(val) => formik.setFieldValue('template', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>

          {/* Category & Template Selection */}
          <Grid container spacing={2} pt="20px">
            <Grid size={{ xs: 12, md: 4 }}>
              <CustomSelect
                label="Select Event"
                options={[{ label: 'Fees', value: 'Fees' }]}
                value={formik.values.category}
                onChange={(val) => formik.setFieldValue('category', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CustomSelect
                label="Select Template"
                options={
                  formik.values.category
                    ? [
                        { label: 'Overdue Fee Reminder', value: 'overdueFee' },
                        { label: 'General Fee Reminder', value: 'feeReminder' },
                      ]
                    : []
                }
                value={formik.values.template}
                onChange={(val) => formik.setFieldValue('template', val)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>

          {/* Communication Channel & Actions */}
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
          >
            <Box display="flex" flexDirection="column">
              <Typography sx={{ pt: 2 }} variant="h6">
                Select a Communication Channel
              </Typography>
              <Box display="flex" gap={2} flexDirection="row">
                <FormControlLabel
                  control={<Checkbox checked onChange={(e) => {}} />}
                  label="Email"
                />
                <FormControlLabel
                  control={<Checkbox checked onChange={(e) => {}} />}
                  label="Whatsapp"
                />
                <FormControlLabel
                  control={<Checkbox checked onChange={(e) => {}} />}
                  label="Message"
                />
              </Box>
            </Box>
            <Box display="flex" flexDirection="row" gap={2}>
              <Button
                startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
                type="submit"
                variant="outlined"
              >
                Reset Filter
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
                type="submit"
                variant="outlined"
              >
                Apply Filter
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
                type="submit"
                variant="outlined"
              >
                Send Notification
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </form>

      {/* Students Table */}
      <CustomizableTable
        columns={[
          {
            id: 'select',
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={
                    selectedStudents.length === filteredStudents.length &&
                    filteredStudents.length > 0
                  }
                  indeterminate={
                    selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(filteredStudents.map((student) => student.id)); // Select all
                    } else {
                      setSelectedStudents([]); // Deselect all
                    }
                  }}
                />
              );
            },

            render: (_, row) => (
              <Checkbox
                checked={selectedStudents.includes(row.id)}
                onChange={() => toggleStudentSelection(row.id)}
              />
            ),
          },
          { id: 'name', label: 'Student Name' },
          { id: 'contactNumber', label: 'Contact Number' },
          { id: 'email', label: 'Email' },

          {
            id: 'message',
            label: 'Message',
            render: (_, row) => {
              if (!formik.values.template) return '';
              return messageTemplate
                .replace('[Student Name]', row.name)
                .replace('[Amount]', '5000')
                .replace('[Due Date]', '15th Feb');
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
