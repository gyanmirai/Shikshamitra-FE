import React from 'react';

import { Box, Typography } from '@mui/material';

import TransportMap from 'src/screens/transport/routesAndSchedules/component/view-on-map-dialog';

import type { StudentTabsComponentType } from '.';

const StudentTransportProfile = (props: StudentTabsComponentType) => {
  const studentDetails = {
    name: 'Alice Johnson',
    grade: 'Grade 5',
    transport: {
      vehicleNumber: 'MH12-AB-1234',
      driver: {
        name: 'John Doe',
        contact: '+91 9876543210',
      },
      stop: {
        name: 'Main Street Stop',
        pickupTime: '7:30 AM',
        dropTime: '4:30 PM',
      },
    },
  };

  return (
    <Box display="flex" flexDirection="row" gap={2} alignItems="start" sx={{ flex: 1 }}>
      {/* Vehicle and Driver Details */}

      <Box
        flex={4} // 40% width
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
        }}
        className="hover-card"
      >
        {/* Background Image */}
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
            opacity: 0.6, // Adjust opacity for better contrast
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
            background: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background for text visibility
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
                  fontWeight: 'light',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                Stop Name
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#f0f0f0', textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {studentDetails.transport.stop.name}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'light',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                Pickup Time
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#f0f0f0', textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {studentDetails.transport.stop.pickupTime}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'light',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                Drop Time
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#f0f0f0', textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {studentDetails.transport.stop.dropTime}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={5} mt={3} alignItems="center">
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'light',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                Vehicle Number
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#f0f0f0', textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {studentDetails.transport.vehicleNumber}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'light',
                  color: '#f0f0f0',
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                Driver
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#f0f0f0', textShadow: '1px 1px 4px rgba(0, 0, 0, 0.6)' }}
              >
                {studentDetails.transport.driver.name} ({studentDetails.transport.driver.contact})
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Transport Map */}
      <Box
        flex={6}
        sx={{
          mt: 4,
          mb: 6,
          height: '400px',
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
};

export default StudentTransportProfile;
