import React, { useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Button, TextField } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const data = [
  { bankName: 'State Bank Of India', action: 'd' },

  { bankName: 'Axis', action: 'd' },
];
const BankConfiguration = () => {
  useEffect(() => {});
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box pt="15px" display="flex" alignItems="center" flexDirection="row" gap={3}>
          <TextField name="AddNewBank" label="Add New Bank" size="small" />

          <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
            New Bank
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box>
            <CustomizableTable
              tableId="bank-configuration"
              isShowedDense={false}
              isPagination={false}
              isFilter={false}
              isSearch={false}
              columns={[
                { id: 'bankName', label: 'Bank Name' },
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
              data={data}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BankConfiguration;
