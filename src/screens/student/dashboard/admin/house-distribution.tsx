import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { fNumber, fPercent } from 'src/utils/format-number';
import { Box, Card, Grid, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const houseData = [
  { label: 'Red House', value: 145, color: '#FF4560', icon: 'mdi:flag-triangle' },
  { label: 'Green House', value: 142, color: '#00E396', icon: 'mdi:flag-triangle' },
  { label: 'Blue House', value: 138, color: '#008FFB', icon: 'mdi:flag-triangle' },
  { label: 'Yellow House', value: 135, color: '#FEB019', icon: 'mdi:flag-triangle' },
];

export default function HouseDistribution() {
  const totalStudents = houseData.reduce((a, b) => a + b.value, 0);

  // Sort houses by value to find the rank
  const sortedHouses = [...houseData].sort((a, b) => b.value - a.value);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{ mt: -1, ml: -1 }}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box component="span">House Distribution</Box>
            <CustomTooltip
              title="Distribution of students across different school houses."
              arrow
              placement="top"
            >
              <Iconify
                icon="eva:info-outline"
                width={18}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              />
            </CustomTooltip>
          </Stack>
        }
      />

      <Stack spacing={4} sx={{ p: 3, flexGrow: 1, justifyContent: 'center' }}>
        {/* Stacked Horizontal Bar Chart */}
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Total Students
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {fNumber(totalStudents)}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: '100%',
              height: 12,
              borderRadius: 1.5,
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            {houseData.map((house) => (
              <CustomTooltip key={house.label} title={`${house.label}: ${house.value}`} arrow>
                <Box
                  sx={{
                    width: `${(house.value / totalStudents) * 100}%`,
                    height: '100%',
                    bgcolor: house.color,
                    transition: 'all 0.3s',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
              </CustomTooltip>
            ))}
          </Box>
        </Box>

        {/* Grid of Houses */}
        <Grid container spacing={2}>
          {sortedHouses.map((house, index) => (
            <Grid size={{ xs: 6 }} key={house.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(house.color, 0.08),
                  border: `1px solid ${alpha(house.color, 0.2)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: alpha(house.color, 0.12),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px 0 ${alpha(house.color, 0.2)}`,
                  },
                }}
              >
                {/* Background Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: -16,
                    opacity: 0.1,
                    transform: 'rotate(15deg)',
                  }}
                >
                  <Iconify icon={house.icon} width={80} color={house.color} />
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ zIndex: 1, position: 'relative' }}
                >
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: house.color }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: 'text.primary', flexGrow: 1 }}
                    noWrap
                  >
                    {house.label}
                  </Typography>
                  {index === 0 && (
                    <CustomTooltip title="Current Top House" arrow>
                      <Iconify
                        icon="mdi:crown"
                        width={18}
                        sx={{ color: 'warning.main', ml: 'auto' }}
                      />
                    </CustomTooltip>
                  )}
                </Stack>

                <Stack
                  direction="row"
                  alignItems="baseline"
                  spacing={1}
                  sx={{ zIndex: 1, position: 'relative' }}
                >
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {house.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    ({fPercent((house.value / totalStudents) * 100)})
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Card>
  );
}
