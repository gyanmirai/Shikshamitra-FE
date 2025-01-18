import React from 'react';

import { Box, Grid, Button, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const ConfigurePaymentStatusComponent = () => (
  <>
    {/* <Typography component="span" variant="h6">
      Configure Payment Status Options
    </Typography> */}

    <Box py="15px" display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomizableTable
            tableId="payment-status"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'paymentStatus', label: 'Payment Status' },
              {
                id: 'action',
                label: 'Action',
                render(row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {}}
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
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <TextField name="Add new status" label="Add New Status" size="small" />
            <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
              Payment Status
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default ConfigurePaymentStatusComponent;
