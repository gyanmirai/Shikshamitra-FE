'use client';

import React from 'react';

import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ResourceDisposedTable from './component/disposed-screen-table';

const DisposedResourceScreen = () => {
  const links = [{ name: 'Resource Management' }, { name: 'Resource Disposed Screen' }];

  return (
    <>
      <CustomBreadcrumbs heading="Resource Disposed Screen" links={links} sx={{ px: 1, mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6} lg={3} pb="20px">
          <DatePicker
            label="From Date"
            format="DD-MM-YYYY"
            value={null}
            onChange={(value) => console.log('Date', value)}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={6} lg={3} pb="20px">
          <DatePicker
            label="To Date"
            format="DD-MM-YYYY"
            value={null}
            onChange={(value) => console.log('Date', value)}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Grid>
      </Grid>

      <ResourceDisposedTable />
    </>
  );
};

export default DisposedResourceScreen;
