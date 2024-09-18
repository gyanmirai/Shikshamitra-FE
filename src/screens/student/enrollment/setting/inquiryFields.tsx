import React, { useState } from 'react';

import { Add, Delete } from '@mui/icons-material';
import { Box, Button, IconButton, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const InquiryFields = () => {
  const [field, setField] = useState<string>('');
  const dialog = useBoolean();
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
                <IconButton>
                  {' '}
                  <Delete />
                </IconButton>
              );
            },
          },
        ]}
        data={[]}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add New Field">
        <Box p={3}>
          <CustomSelect
            options={[]}
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
