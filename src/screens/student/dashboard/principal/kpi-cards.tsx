import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Grid, Card, Avatar, Typography } from '@mui/material';

const kpiData = [
  {
    id: 'PR_TOTAL_STUDENTS',
    title: 'Total Students',
    value: fNumber(2018),
    labels: [
      { name: `Male ${fNumber(1018)}`, color: 'success' },
      { name: `Female ${fNumber(1000)}`, color: 'warning' },
    ],
    icon: 'mdi:school-outline',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'PR_ATTENDANCE_OVERVIEW',
    title: 'Avg Attendance',
    value: '92%',
    labels: [{ name: 'School-wide', color: 'success' }],
    icon: 'mdi:calendar-check-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'PR_ENROLL_YEARLY',
    title: 'New Admissions',
    value: fNumber(450),
    labels: [{ name: 'This Year', color: 'primary' }],
    icon: 'mdi:account-school-outline',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 'PR_EXAM_PERFORMANCE',
    title: 'Exam Performance',
    value: '88%',
    labels: [{ name: 'Pass Rate', color: 'success' }],
    icon: 'mdi:trophy-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'PR_RTE_STUDENTS',
    title: 'RTE Students',
    value: fNumber(200),
    labels: [
      { name: `Male ${fNumber(120)}`, color: 'success' },
      { name: `Female ${fNumber(80)}`, color: 'warning' },
    ],
    icon: 'mdi:account-check-outline',
    color: 'secondary.main',
    bgColor: 'secondary.lighter',
  },
];

const PrincipalKPICards = () => (
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

export default PrincipalKPICards;
