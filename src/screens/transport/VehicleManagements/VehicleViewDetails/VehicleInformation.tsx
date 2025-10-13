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
          bgcolor: '#000',
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
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>
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
        <Grid container spacing={6} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <PersonIcon sx={{ fontSize: 16, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Driver</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>
              {vehicle?.driverName || 'Mayur Solanki'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <RouteIcon sx={{ fontSize: 16, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Route</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>
              {vehicle?.route || 'Route-CC'}
            </Typography>
          </Grid>
        </Grid>

        {/* Vehicle Type and Capacity */}
        <Grid container spacing={6} sx={{ mb: 1 }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <DirectionsCarIcon sx={{ fontSize: 16, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Vehicle Type</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>
              {vehicle?.vehicleType || 'Bus'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <GroupIcon sx={{ fontSize: 16, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Capacity</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>
              {vehicle?.seatingCapacity || '45'} Seats
            </Typography>
          </Grid>
        </Grid>

        {/* Expiry Dates Header */}
        <Box
          sx={{
            bgcolor: '#e8f5e9',
            borderRadius: 2,
            px: 1.5,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid #c8e6c9',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 16, color: '#22c55e' }} />
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#2e7d32',
            }}
          >
            Expiry Dates
          </Typography>
        </Box>

        {/* Expiry Date Cards */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Insurance */}
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #b3e5fc',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#e1f5fe',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUserIcon sx={{ fontSize: 14, color: '#0288d1' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#0288d1', fontWeight: 500 }}>
                  Insurance
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.insuranceExpiry || '10-12-2024'}
              </Typography>
            </Box>
          </Grid>

          {/* Fitness */}
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
                <DescriptionIcon sx={{ fontSize: 14, color: '#388e3c' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#388e3c', fontWeight: 500 }}>
                  Fitness
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.fitnessExpiry || '15-01-2025'}
              </Typography>
            </Box>
          </Grid>

          {/* PUC */}
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{
                border: '1px solid #e1bee7',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#f3e5f5',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DescriptionIcon sx={{ fontSize: 14, color: '#8e24aa' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#8e24aa', fontWeight: 500 }}>
                  PUC
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
                {vehicle?.pucExpiry || '10-12-2024'}
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
                <DescriptionIcon sx={{ fontSize: 14, color: '#388e3c' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#388e3c', fontWeight: 500 }}>
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
              transition: 'all 0.3s ease',
            }}
          >
            <Box
              className="inner-dot"
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#fff',
                transition: 'all 0.3s ease',
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
              transition: 'all 0.3s ease',
            }}
          >
            <Box
              className="inner-dot"
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#fff',
                transition: 'all 0.3s ease',
              }}
            />
          </Avatar>
        </Box>
      </Box>
    </Card>
  );
};

export default VehicleInformationCard;
