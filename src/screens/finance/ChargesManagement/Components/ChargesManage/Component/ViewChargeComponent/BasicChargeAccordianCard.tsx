import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Email, School, Numbers, LocalPhone, CalendarToday } from '@mui/icons-material'; // adjust import per your theme utils
import type { LabelColor } from 'src/components/label';

import { Iconify } from 'src/components/iconify';
import { ChargesPaymentStatus, ChargesPaymentStatusColors } from 'src/enums/fee-charges-status';

const ChargeInformationAccordion = ({ charge }: any) => (
  <Paper
    sx={{
      borderRadius: 2,
      p: 2,
    }}
    elevation={6}
  >
    {/* Header */}
    <Box display="flex" alignItems="center" mb={2} gap={1}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '6px',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="solar:user-outline" width={20} color="primary.main" />
      </Box>

      <Typography variant="h6" color="primary.main">
        {charge?.studentName}&apos;s Information
      </Typography>

      <Box sx={{ ml: 'auto' }}>
        <Label
          color={ChargesPaymentStatusColors[charge?.status as ChargesPaymentStatus] as LabelColor}
        >
          {ChargesPaymentStatus[charge?.status as ChargesPaymentStatus]}
        </Label>
      </Box>
    </Box>

    {/* Body */}
    <Box sx={{ borderRadius: 2, mb: 1 }}>
      <Grid container spacing={2}>
        {/* GR Number */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Numbers sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                GR No.
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.grNo || 'GR2025-69145'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Roll Number */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Numbers sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Roll No.
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.rollNo || 'R2025-145'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Applied On */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <CalendarToday sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Applied On
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.appliedOn || '20-12-2025'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Due Date */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <CalendarToday sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.dueDate || '20 Aug 2025'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <School sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Class / Division
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {`${charge?.class || '10'}-${charge?.division || 'A'}`}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <LocalPhone sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Contact
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.contact || '+91 98765 43210'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Email sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {charge?.email || 'aarya.mehta@example.com'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

export default ChargeInformationAccordion;
