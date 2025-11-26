import React from 'react';
import GroupIcon from '@mui/icons-material/Group';
import BlockIcon from '@mui/icons-material/Block';
import { Box, Card, Grid, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const stats = [
  {
    title: 'Total Staff',
    value: '118',
    icon: <GroupIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    color: 'primary.lighter',
  },
  {
    title: 'Present Today',
    value: '102',
    icon: <AccessTimeIcon sx={{ fontSize: 32, color: 'success.main' }} />,
    color: 'success.lighter',
  },
  {
    title: 'On Leave',
    value: '08',
    icon: <BeachAccessIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
    color: 'warning.lighter',
  },
  {
    title: 'Late Entry',
    value: '05',
    icon: <BlockIcon sx={{ fontSize: 32, color: 'error.main' }} />,
    color: 'error.lighter',
  },
  {
    title: 'Payroll Due',
    value: '₹1,25,000',
    icon: <MonetizationOnIcon sx={{ fontSize: 32, color: 'info.main' }} />,
    color: 'info.lighter',
  },
];

const HRStatsCards = () => (
  <Grid container spacing={2} mb={3}>
    {stats.map((stat, index) => (
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
        <Card
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            bgcolor: 'background.paper',
            boxShadow: 'var(--shadows-1)',
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              {stat.title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {stat.value}
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: '50%', bgcolor: stat.color, display: 'flex' }}>
            {stat.icon}
          </Box>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default HRStatsCards;
