import { Iconify } from 'src/components/iconify';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Grid, Button, Avatar, Typography } from '@mui/material';
import {
  useGetdriverQuery,
  useGetdocumentsQuery,
  useGetinsuranceQuery,
} from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

import type { IVehicleData } from '../Components/type';

const DriverRoutesAndVehicleDetails = ({ vehicle }: { vehicle: IVehicleData }) => {
  const { data: driver } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetdriverQuery,
  });

  const { data: insurance } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetinsuranceQuery,
  });

  const { data: documents } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetdocumentsQuery,
  });

  return (
    <Box>
      {/* Insurance Details */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          Insurance Details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">Insurance Company</Typography>
            <Typography sx={{ fontWeight: 300 }}>{insurance?.company}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">Policy Number</Typography>
            <Typography sx={{ fontWeight: 300 }}>{insurance?.policyNo}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography color="text.secondary">Coverage Amount</Typography>
            <Typography sx={{ fontWeight: 300 }}>
              ₹ {insurance?.coverage?.toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography color="text.secondary">Expiry Date</Typography>
            <Typography sx={{ fontWeight: 300 }}>{insurance?.expiry}</Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Current Driver & Route */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          Current Driver & Route
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={driver?.avatar} alt={driver?.name} sx={{ width: 48, height: 48 }} />
          <Box>
            <Typography sx={{ fontWeight: 500 }}>{driver?.name}</Typography>
            <Typography color="text.secondary" variant="body2">
              Licence: {driver?.licence}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {driver?.phone}
            </Typography>
          </Box>
          <Box sx={{ ml: 4 }}>
            <Typography color="text.secondary">Route: {driver?.route}</Typography>
            <Typography color="text.secondary" variant="body2">
              Start Point: {driver?.start}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              End Point: {driver?.end}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Documents */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          Documents
        </Typography>
        <Grid container spacing={2}>
          {documents?.map((doc: { key: string | number; label: string }) => (
            <Grid
              size={{ xs: 12 }}
              key={doc.key}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography>{doc.label}</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="material-symbols:visibility" />}
                // onClick={() => handleViewDocument(doc.key)}
              >
                View
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default DriverRoutesAndVehicleDetails;
