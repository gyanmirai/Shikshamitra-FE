import React from 'react';
import { Box } from '@mui/material';

import StopsDetails from './StopDetails';
import RouteTopHeader from './RouteTopHeader';

const RouteStopDetails = ({ formik }: { formik: any }) => (
  <Box sx={{ height: '100%' }}>
    <RouteTopHeader routeDetails={formik.values.selectedRoute} />
    <StopsDetails formik={formik} />
  </Box>
);

export default RouteStopDetails;
