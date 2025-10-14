import { Label } from 'src/components/label';
import RouteIcon from '@mui/icons-material/Route';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Grid, Avatar, Typography } from '@mui/material';
import { useGetvehicleInformationQuery } from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

const VehicleInformationCard = () => {
  const { data: vehicle } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetvehicleInformationQuery,
  });
  console.log('🚀 ~ VehicleInformationCard ~ vehicle:', vehicle);

  return (
    <Card
      sx={{
        maxWidth: 300,
        borderRadius: 4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        mb: 2,
        '&:hover .navigation-dots': {
          '& .dot-avatar': {
            bgcolor: '#fff9c4',
            transform: 'scale(1.2)',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)',
            '& .inner-dot': {
              bgcolor: '#fbbf24',
              transform: 'scale(1.1)',
            },
          },
        },
      }}
    >
      {/* Black Header - Registration Number */}
      <Box
        sx={{
          bgcolor: 'primary.darker',
          color: 'white',
          py: 1,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {vehicle?.registrationNo || 'GJ-05-AD-2711'}
        </Typography>
      </Box>

      <Box sx={{ p: 1 }}>
        {/*  Header with Active Status */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' }}>
            {vehicle?.manufacturer || 'Tata'}
          </Typography>
          <Label
            color="success"
            variant="soft"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              px: 1,
            }}
          >
            {vehicle?.status || 'Active'}
          </Label>
        </Box>

        {/* Vehicle Model - Green Box */}
        <Box
          sx={{
            bgcolor: '#e8f5e9',
            borderRadius: 2,
            p: 1,
            mb: 1,
            border: '1px solid #c8e6c9',
          }}
        >
          <Typography
            sx={{
              color: '#2e7d32',
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'center',
            }}
          >
            {vehicle?.model || 'Tata StarBus'} - {vehicle?.seatingCapacity || '40'} seater
          </Typography>
        </Box>

        {/* Driver and Route Section */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Driver
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.driverName || 'Mayur Solanki'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RouteIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Route
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.route || 'Route-CC'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Vehicle Type and Capacity */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DirectionsCarIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Vehicle Type
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.vehicleType || 'Bus'}/{vehicle?.feature || 'AC'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GroupIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Capacity
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.seatingCapacity || '45'} Seats
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* School Assign No.  and Fuel Type */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DirectionsCarIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Bus No.
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.schoolAssignedNumber || '01'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GroupIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Fuel Type
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.fuelType || '45'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Expiry Date Cards */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Insurance */}
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUserIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Insurance
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.insuranceExpiry || '10-12-2024'}
              </Typography>
            </Box>
          </Grid>

          {/* Road Tax */}
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #c8e6c9',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e8f5e9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DescriptionIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 500 }}>
                  Road Tax
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.roadTaxExpiry || '15-01-2025'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Navigation with Light Yellow Spread Effect */}
        <Box
          className="navigation-dots"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 1,
          }}
        >
          <Avatar
            className="dot-avatar"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#fbbf24',
              cursor: 'pointer',
              transition: 'all 1.3s ease',
            }}
          >
            <Box
              className="inner-dot"
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#fff',
                transition: 'all 1.3s ease',
              }}
            />
          </Avatar>
          <Avatar
            className="dot-avatar"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#fbbf24',
              cursor: 'pointer',
              transition: 'all 1.3s ease',
            }}
          >
            <Box
              className="inner-dot"
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#fff',
                transition: 'all 1.3s ease',
              }}
            />
          </Avatar>
        </Box>
      </Box>
    </Card>
  );
};

export default VehicleInformationCard;
