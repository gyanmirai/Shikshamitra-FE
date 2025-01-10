import React from 'react';

import { Box, Grid, Button, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const SetDefaultFeeComponent = () => (
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
        <TextField name="Add new fee head" label="Add New Fee Head" size="small" />

        <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
          New Head
        </Button>
      </Box>
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box>
          <CustomizableTable
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'existingFeeHead', label: 'Existing Fee Head' },
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
              { existingFeeHead: 'Tuition Fee', action: 'Delete' },
              { existingFeeHead: 'Sports Fee', action: 'Delete' },
            ]}
          />
        </Box>
      </Grid>
    </Grid>
  </Box>
);

export default SetDefaultFeeComponent;
