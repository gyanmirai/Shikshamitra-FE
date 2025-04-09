import React from 'react';

import { Box, Typography } from '@mui/material';

import TransportMap from 'src/screens/transport/routesAndSchedules/component/view-on-map-dialog';

import { Iconify } from 'src/components/iconify/iconify';

import { studentDetails } from './transport-profile-data/data';

import type { StudentTabsComponentType } from '.';

const StudentTransportProfile = (props: StudentTabsComponentType) => (
  <Box display="flex" flexDirection="row" gap={2} alignItems="start" sx={{ flex: 1 }}>
    {/* Vehicle and Driver Details */}

    <Box
      flex={4} // 40% width
      onClick={() => {
        window.location.href = '/transport/member-transport';
      }}
      sx={{
        p: 3,
        height: '300px',
        borderRadius: '15px', // Rounded corners for a soft look
        position: 'relative', // Required for the overlay
        overflow: 'hidden', // Ensure content doesn't spill out of the card
        boxShadow: 5,
        marginTop: 4,
        color: 'white', // Default color for text
        transition: 'transform 0.3s ease', // Hover effect
        cursor: 'pointer', // Add pointer on hover
        '&:hover': {
          transform: 'scale(1.02)', // Slight zoom effect on hover
        },
      }}
      className="hover-card"
    >
      {' '}
      {/* Background Image */}{' '}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("https://www.shutterstock.com/image-vector/little-kids-boy-girl-ride-600nw-2281097463.jpg")', // Background image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3, // Adjust opacity for better contrast
          zIndex: 0, // Image stays behind the content box
        }}
      />
      {/* Content Box with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1, // Content stays on top of the image
          background: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background for text visibility
          padding: 3, // Padding for spacing
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Center the text vertically
        }}
      >
        <Box display="flex" flexDirection="row" gap={3} alignItems="center">
          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '17px',
                color: '#f0f0f0',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Iconify icon="akar-icons:stop" /> Stop Name
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#f0f0f0',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              {studentDetails.transport.stop.name}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '17px',
                color: '#f0f0f0',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Iconify icon="mdi:clock-time-four" /> Pickup Time
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#f0f0f0',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              {studentDetails.transport.stop.pickupTime}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '17px',
                color: '#f0f0f0',
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Iconify icon="material-symbols:wheelchair-pickup" /> Drop Time
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#f0f0f0',
                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
              }}
            >
              {studentDetails.transport.stop.dropTime}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={3} mt={3}>
          <Box display="flex" flexDirection="row" gap={3} alignItems="center">
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify icon="streamline:steps-number" /> Vehicle Number
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                {studentDetails.transport.vehicleNumber}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify icon="healthicons:truck-driver" /> Driver
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                {studentDetails.transport.driver.name}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Iconify icon="material-symbols-light:call" /> Contact
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)',
                }}
              >
                {studentDetails.transport.driver.contact}
              </Typography>
            </Box>{' '}
          </Box>
        </Box>

        {/* <Box display="flex" flexDirection="row" gap={3} mt={5} justifyContent="flex-end">
            <Button startIcon={<Iconify icon="gis:route"  />} variant="outlined" sx={{ borderWidth: 3, color: '#2196F3', borderColor: '#2196F3', '&:hover': { borderColor: '#1976D2', color: '#1976D2' } }}>
              Update Route
            </Button>
          </Box> */}
      </Box>
    </Box>

    {/* Transport Map */}
    <Box
      flex={6}
      sx={{
        mt: 4,
        mb: 6,
        height: '300px',
        width: '700px',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <TransportMap
        start={[21.233659274910956, 72.862602819098]}
        end={[21.14843573826047, 72.88572990744605]}
        waypoints={[
          [21.200659, 72.870602],
          [21.180435, 72.880729],
        ]}
      />
    </Box>
  </Box>
);
export default StudentTransportProfile;
