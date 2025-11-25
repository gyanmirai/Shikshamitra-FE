import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Grid, Card, Avatar, Typography } from '@mui/material';

const kpiData = [
  {
    id: 'TC_CLASS_STRENGTH',
    title: 'Class Strength',
    value: fNumber(45),
    labels: [
      { name: `Male ${fNumber(23)}`, color: 'success' },
      { name: `Female ${fNumber(22)}`, color: 'warning' },
    ],
    icon: 'mdi:google-classroom',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'TC_PRESENT',
    title: 'Present Today',
    value: fNumber(42),
    labels: [
      { name: '93% Attendance', color: 'success' },
      { name: `Absent ${fNumber(3)}`, color: 'error' },
    ],
    icon: 'mdi:account-check-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'TC_HOMEWORK_PENDING',
    title: 'Assignment Pending',
    value: fNumber(12),
    labels: [
      { name: `Submitted ${fNumber(33)}`, color: 'success' },
      { name: 'Due Today', color: 'warning' },
    ],
    icon: 'mdi:book-open-page-variant-outline',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
];

const TeacherKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <Card
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 2,
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}
            >
              {kpi.title}
            </Typography>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {kpi.value}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {kpi.labels.map((label, index) => (
                <Label key={index} color={label.color as any}>
                  {label.name}
                </Label>
              ))}
            </Box>
          </Box>

          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: kpi.bgColor,
              color: kpi.color,
            }}
          >
            <Iconify icon={kpi.icon} width={32} />
          </Avatar>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default TeacherKPICards;
