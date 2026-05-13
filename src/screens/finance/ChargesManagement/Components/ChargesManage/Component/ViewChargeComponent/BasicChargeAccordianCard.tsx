import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { Email, School, Numbers, LocalPhone, CalendarToday } from '@mui/icons-material';
import { ChargesPaymentStatus, ChargesPaymentStatusColors } from 'src/enums/fee-charges-status';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

const ChargeInformationAccordion = ({ charge }: any) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderRadius: 2,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: 4 },
    }}
  >
    {/* Header */}
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Iconify icon="solar:user-id-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>
          {charge?.student?.studentName || 'Student Name'}&apos;s Information
        </Typography>
      </Stack>

      <Label
        variant="soft"
        color={
          (ChargesPaymentStatusColors[charge?.status as ChargesPaymentStatus] as LabelColor) ||
          'default'
        }
        sx={{ textTransform: 'uppercase', py: 0.5, px: 1 }}
      >
        {ChargesPaymentStatus[charge?.status as ChargesPaymentStatus] || 'N/A'}
      </Label>
    </Stack>
    <Divider sx={{ mb: 2 }} />

    {/* Body */}
    <Box>
      <Grid container spacing={1}>
        {/* GR Number */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem icon={<Numbers />} label="GR No." value={charge?.student?.grNumber || 'N/A'} />
        </Grid>

        {/* Roll Number */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Numbers />}
            label="Roll No."
            value={charge?.student?.rollNumber || 'N/A'}
          />
        </Grid>

        {/* Applied On */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<CalendarToday />}
            label="Applied On"
            value={charge?.appliedOn ? new Date(charge.appliedOn).toLocaleDateString() : 'N/A'}
          />
        </Grid>

        {/* Due Date */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<CalendarToday />}
            label="Due Date"
            value={charge?.dueDate ? new Date(charge.dueDate).toLocaleDateString() : 'N/A'}
          />
        </Grid>

        {/* Separator for better visual grouping on larger screens */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<School />}
            label="Class / Division"
            value={`${charge?.student?.standardName || 'N/A'}-${charge?.student?.divisionName || 'N/A'}`}
          />
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<LocalPhone />}
            label="Contact"
            value={charge?.student?.contactNumber || 'N/A'}
          />
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            icon={<Email />}
            label="Email Address"
            value={charge?.student?.emailAddress || 'N/A'}
          />
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

export default ChargeInformationAccordion;
