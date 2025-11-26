import { Label } from 'src/components/label';
import RouteIcon from '@mui/icons-material/Route';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Grid, Avatar, Typography } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStationOutlined';
import { useGetvehicleInformationQuery } from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

const VehicleInformationCard = () => {
  const { data: vehicle } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetvehicleInformationQuery,
  });

  return (
    <Card
      sx={{
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1.5 }}>
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
            bgcolor: 'default.lighter',
            borderRadius: 2,
            p: 1,
            mb: 1,
            border: '1px solid #c8e6c9',
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'center',
            }}
          >
            {vehicle?.model || 'Tata StarBus'} - {vehicle?.seatingCapacity || '40'} seater
          </Typography>
        </Box>

        {/* Vehicle Type and Capacity */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Vehicle Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Vehicle Type
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'primary.main',
                  ml: 3.5, // aligns text visually under label
                }}
              >
                {(vehicle?.vehicleType || 'Bus')?.length > 12
                  ? `${(vehicle?.vehicleType || 'Bus').slice(0, 12)}...`
                  : vehicle?.vehicleType || 'Bus'}
                /{vehicle?.feature || 'AC'}
              </Typography>
            </Box>
          </Grid>

          {/* Capacity */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <GroupIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Capacity
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'primary.main',
                  ml: 3.5, // aligns text perfectly under the label
                }}
              >
                {(vehicle?.seatingCapacity || '45') > 99
                  ? `${vehicle?.seatingCapacity || '45'} Seats`
                  : `${vehicle?.seatingCapacity || '45'} Seats`}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* School Assign No.  and Fuel Type */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Bus No.
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'primary.main',
                  ml: 3.5,
                }}
              >
                {vehicle?.schoolAssignedNumber || '01'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LocalGasStationIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Fuel Type
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'primary.main',
                  ml: 3.5,
                }}
              >
                {vehicle?.fuelType || '45'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Expiry Date Cards */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Insurance */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Insurance
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: 'primary.main',
                  ml: 3.5,
                }}
              >
                {vehicle?.insuranceExpiry || '10-12-2024'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 1,
                borderRadius: 2,
                p: 2,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RouteIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    color: 'text.secondary',
                    letterSpacing: 0.3,
                  }}
                >
                  Route
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  maxWidth: '100%',
                  color: 'primary.main',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ml: 3.5,
                }}
                title={vehicle?.route || 'Route-CC'}
              >
                {(vehicle?.route || 'Route-CC').length > 12
                  ? `${(vehicle?.route || 'Route-CC').slice(0, 12)}...`
                  : vehicle?.route || 'Route-CC'}
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
