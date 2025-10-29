import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { LocationOn } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { RouteStatus, RouteStatusColor } from 'src/enums/route-status';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { InfoItem } from 'src/screens/transport/RouteManagement/RouteViewDetails/RouteInformationCard';

const RouteTopHeader = ({ formik }: { formik: any }) => {
  if (!formik?.values?.selectedRoute) {
    return (
      <SectionCard title="Route Details">
        <Box display="flex" justifyContent="center" alignItems="center" height={80}>
          <Box className="loader" height={24} />
        </Box>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Route Details">
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography variant="h6">{formik.values.selectedRoute.routeName}</Typography>
        <Typography variant="caption">{formik.values.selectedRoute.routeId}</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<LocationOn />}
          label="Start Point"
          value={formik.values.selectedRoute.startPoint}
          color="success.main"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<LocationOn />}
          label="End Point"
          value={formik.values.selectedRoute.endPoint}
          color="error.main"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Box display="flex" justifyContent="flex-end">
          <Label
            variant="soft"
            color={
              RouteStatusColor[formik.values.selectedRoute.status as RouteStatus] as LabelColor
            }
          >
            {RouteStatus[formik.values.selectedRoute.status]}
          </Label>
        </Box>
      </Grid>
    </SectionCard>
  );
};

export default RouteTopHeader;
