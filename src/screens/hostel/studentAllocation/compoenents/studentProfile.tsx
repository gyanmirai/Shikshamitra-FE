import React from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

const { assetURL } = CONFIG.site;

const StudentProfile = ({ studentId }: { studentId: string }) =>
  studentId && (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        width: '100%',
        padding: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%)',
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        borderRadius: 3,
        overflow: 'hidden',
        mt: 2,
      }}
    >
      {/* Left Section: Student Name and Avatar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'column' },
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: '100%', sm: '180px' },
          borderRight: { xs: 'none', sm: '1px solid rgba(0, 0, 0, 0.08)' },
          pb: { xs: 2, sm: 0 },
          pr: { xs: 0, sm: 2 },
        }}
      >
        <Avatar
          alt="John Doe"
          src={`${assetURL}/assets/images/avatar/avatar-${0 + 1}.webp`}
          sx={{
            width: { xs: 80, sm: 100, md: 120 },
            height: { xs: 80, sm: 100, md: 120 },
            mb: { xs: 0, sm: 2 },
            mr: { xs: 2, sm: 0 },
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
          }}
        >
          Hello
        </Typography>
      </Box>

      {/* Information Grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', sm: 'calc(100% - 180px)' },
          pl: { xs: 0, sm: 3 },
          pt: { xs: 2, sm: 0 },
          borderTop: { xs: '1px solid rgba(0, 0, 0, 0.08)', sm: 'none' },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 3,
            height: '100%',
            alignItems: 'center',
          }}
        >
          {[
            { label: 'Standard', icon: 'fa:mortar-board', value: '10-A' },
            { label: 'Roll Number', icon: 'mdi:account', value: '20223' },
            { label: 'Gr Number', icon: 'ph:student-bold', value: '9876GH' },
            { label: 'Class Teacher', icon: 'mdi:teach', value: 'Mr. John' },
            { label: 'Age', icon: 'ic:baseline-cake', value: '15 Years' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                textAlign: 'center',
                p: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 0.5,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                }}
                fontSize={40}
              >
                <Iconify
                  icon={item.icon}
                  width={35}
                  height={35}
                  sx={{
                    mr: 1,
                    color: 'primary.main',
                  }}
                />
                {item.value}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );

export default StudentProfile;
