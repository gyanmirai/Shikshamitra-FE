import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Divider, Typography } from '@mui/material';
import { Email, School, Numbers, LocalPhone, CalendarToday } from '@mui/icons-material';
import { ChargesPaymentStatus, ChargesPaymentStatusColors } from 'src/enums/fee-charges-status';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

const ChargeInformationAccordion = ({ charge }: any) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: (theme) =>
        theme.customShadows?.card ||
        '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
      border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
        borderBottom: (theme) => `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: (theme) => `0 4px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
            border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
          }}
        >
          <Iconify icon="solar:user-id-bold-duotone" width={24} color="primary.main" />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {charge?.student?.studentName || 'Student Name'}&apos;s Information
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            View academic and personal details
          </Typography>
        </Box>
      </Box>

      <Label
        variant="filled"
        color={ChargesPaymentStatusColors[charge?.status as ChargesPaymentStatus] as LabelColor}
        sx={{ textTransform: 'uppercase', py: 0.5, px: 1 }}
      >
        {ChargesPaymentStatus[charge?.status as ChargesPaymentStatus]}
      </Label>
    </Box>

    {/* Body */}
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
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
  </Card>
);

export default ChargeInformationAccordion;
