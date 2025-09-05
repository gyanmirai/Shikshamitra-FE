'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import DashboardCard from 'src/components/dasboard-card';
import { Box, Card, Grid, Typography } from '@mui/material';

const ResourceFacilitiesCardSection = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} columns={5}>
      <Grid size={1}>
        <DashboardCard
          title="Classrooms"
          mainText="50"
          mainIcon={<Iconify icon="arcticons:classroom" width={60} height={60} />}
          mainIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={1}>
        <DashboardCard
          title="Laboratories"
          mainText="50"
          mainIcon={<Iconify icon="icomoon-free:lab" width={60} height={60} />}
          mainIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={1}>
        <DashboardCard
          title="Auditoriums"
          mainText="50"
          mainIcon={<Iconify icon="guidance:auditorium" width={60} height={60} />}
          mainIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={1}>
        <DashboardCard
          title="Sports Facilities"
          mainText="50"
          mainIcon={<Iconify icon="arcticons:classroom" width={60} height={60} />}
          mainIconColor="#4CAF50"
        />
      </Grid>

      <Grid size={1}>
        <Card
          sx={{
            backgroundColor: '#c684ff',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            py: 4,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 'var(--shadows-8)',
              transform: 'scale(1.03)',
            },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Iconify
              color={theme.palette.common.white}
              icon="uis:calender"
              width={60}
              height={60}
            />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, color: theme.palette.common.white }}
            >
              Book Facility
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ResourceFacilitiesCardSection;
