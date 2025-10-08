import { Label } from 'src/components/label';
import { Box, Card, Grid, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetvehicleInformationQuery } from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

const VehicleInformationCard = () => {
  const { data: vehicle } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetvehicleInformationQuery,
  });

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      {/* Heading */}
      <Typography variant="h6" mb={2} color="primary.main">
        Vehicle Information
      </Typography>

      <Grid container spacing={2} alignItems="center">
        {/* Registration No. */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Registration No.</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {vehicle?.registrationNo}
          </Typography>
        </Grid>

        {/* Vehicle Type */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Vehicle Type</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {vehicle?.vehicleType}
          </Typography>
        </Grid>

        {/* Make & Model + Status */}
        <Grid size={{ xs: 4 }} display="flex" alignItems="center" gap={1}>
          <Box>
            <Typography color="text.secondary">Make & Model</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {vehicle?.model}
            </Typography>
          </Box>
          {vehicle?.status && (
            <Label color="success" sx={{ ml: 3 }}>
              {vehicle.status}
            </Label>
          )}
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 2 }} />

      <Grid container spacing={2}>
        {/* Seating Capacity */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Seating Capacity</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {vehicle?.seatingCapacity}
          </Typography>
        </Grid>

        {/* Year of Manufacture */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Year of Manufacture</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {vehicle?.yearOfManufacture}
          </Typography>
        </Grid>

        {/* Color */}
        <Grid size={{ xs: 4 }}>
          <Typography color="text.secondary">Color</Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {vehicle?.vehicleColor}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

export default VehicleInformationCard;
