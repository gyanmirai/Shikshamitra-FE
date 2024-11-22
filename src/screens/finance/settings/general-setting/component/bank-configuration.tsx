import React, { useEffect } from 'react';

import { Box, Grid, Button, MenuItem, MenuList, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const data = [
  { bankName: 'State Bank Of India', action: 'd' },

  { bankName: 'Axis', action: 'd' },
];
const BankConfiguration = () => {
  useEffect(() => {});
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid item xs={12} md={6}>
        <Box
          pt="15px"
          display="flex"
          justifyItems="center"
          alignItems="center"
          flexDirection="row"
          gap={3}
        >
          <TextField name="AddNewBank" label="Add New Bank" size="small" />

          <Button variant="contained" size="small">
            Add
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Box>
            <DataTable
              columns={[
                { key: 'bankName', label: 'Bank Name' },
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
              data={data}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BankConfiguration;
