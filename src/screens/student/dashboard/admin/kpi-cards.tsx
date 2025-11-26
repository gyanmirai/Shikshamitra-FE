import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Grid, Card, Avatar, Typography } from '@mui/material';

const kpiData = [
  {
    id: 'ENQ_TOTAL',
    title: 'Total Inquiries',
    value: '2,220',
    labels: [
      { name: `Male ${fNumber(1200)}`, color: 'success' },
      { name: `Female ${fNumber(1020)}`, color: 'warning' },
    ],
    icon: 'mdi:clipboard-text-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'REG_TOTAL',
    title: 'Total Registration',
    value: '2,078',
    labels: [
      { name: `Male ${fNumber(1129)}`, color: 'success' },
      { name: `Female ${fNumber(949)}`, color: 'warning' },
    ],
    icon: 'mdi:account-plus-outline',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 'ADM_TOTAL',
    title: 'Total Admission',
    value: '2,045',
    labels: [
      { name: `Male ${fNumber(1020)}`, color: 'success' },
      { name: `Female ${fNumber(1025)}`, color: 'warning' },
    ],
    icon: 'mdi:file-document-edit-outline',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
  {
    id: 'STU_TOTAL',
    title: 'Total Students',
    value: '2,018',
    labels: [
      { name: `Male ${fNumber(1018)}`, color: 'success' },
      { name: `Female ${fNumber(1018)}`, color: 'warning' },
    ],
    icon: 'mdi:school-outline',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'STU_LEFT',
    title: 'Students Left',
    value: '150',
    labels: [
      { name: `Transferred ${fNumber(100)}`, color: 'warning' },
      { name: `Dropped Out ${fNumber(50)}`, color: 'error' },
    ],
    icon: 'mdi:account-minus-outline',
    color: 'error.main',
    bgColor: 'error.lighter',
  },
  {
    id: 'RTE_STUDENTS',
    title: 'RTE Students',
    value: '200',
    labels: [
      { name: `Male ${fNumber(180)}`, color: 'success' },
      { name: `Female ${fNumber(20)}`, color: 'error' },
    ],
    icon: 'mdi:account-check-outline',
    color: 'info.dark',
    bgColor: 'info.light',
  },
];

const AdminKPICards = () => (
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

export default AdminKPICards;
