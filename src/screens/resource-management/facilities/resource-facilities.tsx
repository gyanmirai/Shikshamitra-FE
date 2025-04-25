'use client';

import React from 'react';

import { Box, Grid } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import BookFacilitySection from './component/bookfacility-section';
import UpcomingBookingSection from './component/upcoming-booking-section';
import AllFacilitiesTableSection from './component/all-facilities-table-section';
import FacilitiesAllocationOverview from './component/facilities-allocation-overview';
import ResourceFacilitiesCardSection from './component/resource-facilities-card-section';

const ResourceFacilities = () => (
  <>
    <CustomBreadcrumbs
      heading="Classroom & Facilities"
      links={[{ name: 'Resource Management' }, { name: 'Classroom & Facilities' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <Box display="flex" flexDirection="column" gap={3}>
      <ResourceFacilitiesCardSection />
      <FacilitiesAllocationOverview />
      <AllFacilitiesTableSection />
      <Grid container spacing={2} pb="20px" alignItems="stretch">
        <Grid item md={12} lg={6} sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <BookFacilitySection />
          </Box>
        </Grid>
        <Grid item md={12} lg={6} sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <UpcomingBookingSection />
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default ResourceFacilities;
