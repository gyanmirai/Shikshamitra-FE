import React, { useState } from 'react';

import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Button, IconButton, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const InquiryFields = () => {
  const [field, setField] = useState<string>('');
  const dialog = useBoolean();

  const dummyData = [
    { id: 1, fieldName: 'First Name' },
    { id: 2, fieldName: 'Last Name' },
    { id: 3, fieldName: 'Email' },
    { id: 4, fieldName: 'Phone Number' },
    { id: 5, fieldName: 'Date of Birth' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Add New Field
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'fieldName', label: 'Filed Name' },
          {
            id: 'delete',
            label: 'Remove',
            isSort: false,
            render(value, row) {
              return (
                <IconButton color="error">
                  {' '}
                  <RemoveCircle />
                </IconButton>
              );
            },
          },
        ]}
        data={dummyData}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add New Field">
        <Box p={3}>
          <CustomSelect
            options={[
              { value: 'firstName', label: 'First Name' },
              { value: 'lastName', label: 'Last Name' },
              { value: 'email', label: 'Email' },
              { value: 'phoneNumber', label: 'Phone Number' },
              { value: 'dateOfBirth', label: 'Date of Birth' },
              { value: 'address', label: 'Address' },
              { value: 'gender', label: 'Gender' },
              { value: 'studentId', label: 'Student ID' },
              { value: 'gradeLevel', label: 'Grade Level' },
              { value: 'major', label: 'Major' },
            ]}
            value={field}
            label="select Field"
            onChange={(val: string | string[]) => {
              setField(val as string);
            }}
            formControlProps={{ fullWidth: true }}
          />
        </Box>
        <DialogActions>
          <Button variant="contained">Submit</Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default InquiryFields;
