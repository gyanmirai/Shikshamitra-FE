'use client';

import React, { useState } from 'react';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useGetClassQuery } from 'src/redux/class/classApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box , Grid, Select, Divider, MenuItem, InputLabel, IconButton, FormControl } from '@mui/material';


const UploadStudentDocumentsScreen = () => {
  const { data: classes, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const dialog = useBoolean();
  const [divisions, setDivisions] = useState([]);
  const [classValue, setClassValue] = React.useState('');
  const [division, setDivision] = React.useState('');

  const handleClassChange = (event: any) => {
    setClassValue(event.target.value);
    setDivisions(classes.items.find((item: any) => item.id === event.target.value).divisions);
  };

  const handleDivisionChange = (event: any) => {
    setDivision(event.target.value);
  };

  // Dummy data for the table
  const dummyData = [
    { id: 1, fullName: 'John Doe', upload: 'Not uploaded' },
    { id: 2, fullName: 'Jane Smith', upload: 'Uploaded' },
    { id: 3, fullName: 'Mike Johnson', upload: 'Not uploaded' },
    { id: 4, fullName: 'Emily Brown', upload: 'Uploaded' },
    { id: 5, fullName: 'David Wilson', upload: 'Not uploaded' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Upload Student Documents"
        links={[
          { name: 'Student' },
          { name: 'Student Record' },
          { name: 'Upload Student Documents' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel id="class-select-label" size="small">
              Class
            </InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={classValue}
              label="Class"
              onChange={handleClassChange}
              size="small"
            >
              {isLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : classes?.items.length > 0 ? (
                classes.items.map((classItem: any) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No class available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel id="division-select-label" size="small">
              Division
            </InputLabel>
            <Select
              labelId="division-select-label"
              id="division-select"
              value={division}
              label="Division"
              onChange={handleDivisionChange}
              size="small"
              disabled={!classValue}
              sx={{ cursor: !classValue ? 'no-drop !important' : 'default' }}
            >
              {divisions && divisions.length > 0 ? (
                divisions.map((divisionItem: any) => (
                  <MenuItem key={divisionItem.id} value={divisionItem.id}>
                    {divisionItem.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No division available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {division && (
        <CustomizableTable
          tableId="upload-student-documents"
          columns={[
            { id: 'fullName', label: 'Full Name' },
            {
              id: 'upload',
              label: 'Upload Documents',
              render(value, row) {
                return (
                  <IconButton onClick={dialog.onTrue}>
                    <Iconify icon="heroicons-outline:upload" />
                  </IconButton>
                );
              },
            },
          ]}
          data={dummyData}
        />
      )}

      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Upload Documents">
        <UploadPhotoFlow />
      </CustomDialog>
    </Box>
  );
};

export default UploadStudentDocumentsScreen;

const UploadPhotoFlow = () => (
  <Box p={2}>
    <Upload />
  </Box>
);
