import React from 'react';

import { Box, Grid, Button, MenuItem, MenuList, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const ConfigurePaymentStatusComponent = () => (
  <>
    {/* <Typography component="span" variant="h6">
      Configure Payment Status Options
    </Typography> */}
 
<Box py="15px" display="flex" flexDirection="column" gap={3}>
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <DataTable
        columns={[
          { key: 'paymentStatus', label: 'Payment Status' },
          {
            key: 'action',
            label: 'Action',
            render(row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      {/* <MenuItem
                        onClick={() => {
                          // modal.onTrue();
                          // popover.onClose();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                        Edit
                      </MenuItem> */}
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
          { paymentStatus: 'Paid', action: 'edit' },
          { paymentStatus: 'Due', action: 'edit' },
          { paymentStatus: 'UnPaid', action: 'edit' },
        ]}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <Box display="flex" flexDirection="row" gap={3} alignItems="center">
        <TextField
          name="Add new status"
          label="Add New Status"
          size="small"
          fullWidth
        />
        <Button variant="contained" size="small">
          Add
        </Button>
      </Box>
    </Grid>
  </Grid>
</Box>

  </>
);

export default ConfigurePaymentStatusComponent;
