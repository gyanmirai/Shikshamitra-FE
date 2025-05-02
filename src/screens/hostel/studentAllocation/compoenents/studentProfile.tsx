import React from 'react';

import { Box, Card, Avatar, useTheme, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

const { assetURL } = CONFIG.site;

const StudentProfile = ({ studentId }: { studentId: string }) => {
  // Get the MUI theme object for styling
  const theme = useTheme();

  return (
    studentId && (
      <Card
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          padding: { xs: 2, sm: 2.5, md: 3 },
          background: theme.palette.background.default,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: 3,
          overflow: 'hidden',
          mt: 2,
        }}
      >
        {/* Left Section: Student Name and Avatar - Optimized for small screens */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', sm: 'center' },
            width: { xs: '100%', sm: '150px', md: '180px' },
            borderRight: { xs: 'none', sm: '1px solid rgba(0, 0, 0, 0.08)' },
            pb: { xs: 2, sm: 0 },
            pr: { xs: 0, sm: 2 },
          }}
        >
          <Avatar
            alt="Student Avatar"
            src={assetURL}
            sx={{
              width: { xs: 60, sm: 80, md: 100 },
              height: { xs: 60, sm: 80, md: 100 },
              mb: { xs: 0, sm: 2 },
              mr: { xs: 2, sm: 0 },
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              textAlign: { xs: 'left', sm: 'center' },
            }}
          >
            Hello
          </Typography>
        </Box>

        {/* Information Grid - Improved spacing and responsiveness */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: { xs: '100%', sm: 'calc(100% - 150px)', md: 'calc(100% - 180px)' },
            pl: { xs: 0, sm: 2, md: 3 },
            pt: { xs: 2, sm: 0 },
            borderTop: { xs: '1px solid rgba(0, 0, 0, 0.08)', sm: 'none' },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: { xs: 1.5, sm: 2, md: 3 },
              height: '100%',
              alignItems: 'center',
            }}
          >
            {[
              { label: 'Standard', icon: 'fa:mortar-board', value: 1 },
              { label: 'Roll Number', icon: 'mdi:account', value: 10 },
              { label: 'Gr Number', icon: 'ph:student-bold', value: 15 },
              { label: 'Class Teacher', icon: 'mdi:teach', value: 'abc' },
              { label: 'Age', icon: 'ic:baseline-cake', value: 90 },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  textAlign: 'center',
                  p: { xs: 1, sm: 1.5 },
                  maxWidth: '150px',
                  width: '100%',
                }}
              >
                <Iconify
                  width={26}
                  height={26}
                  icon={item.icon}
                  sx={{
                    color: 'primary.main',
                  }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>

                <Typography noWrap variant="h6">
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    )
  );
};

export default StudentProfile;
