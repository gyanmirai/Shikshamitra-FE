import React from 'react';

import { Box, Grid, Button, MenuItem, MenuList, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const SetDefaultFeeComponent = () => (
  
    

<Box display="flex" flexDirection="column" gap={2}>
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <Box>
        <DataTable
          columns={[
            { key: 'existingFeeHead', label: 'Existing Fee Head' },
            {
              key: 'action',
              label: 'Action',
              render(row: any) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }: any) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            // uploadModal.onTrue();
                            // popover.onClose();
                          }}
                        >
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            sx={{ height: '16px', width: '16px' }}
                          />
                          Delete
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={[
            { existingFeeHead: 'Tuition Fee', action: 'Delete' },
            { existingFeeHead: 'Sports Fee', action: 'Delete' },
          ]}
        />
      </Box>
    </Grid>

    <Grid item xs={12} md={6}>
      <Box pt="15px" display="flex" flexDirection="column" gap={3}>
        <TextField
          name="Add new fee head"
          label="Add New Fee Head"
          size="small"
          fullWidth
        />
        {/* <CustomSelect
          label="Predefined components"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 150 } }}
        /> */}
      </Box>
      <Box py="15px" display="flex" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Add
        </Button>
      </Box>
    </Grid>
  </Grid>
</Box>

   
 
);

export default SetDefaultFeeComponent;
