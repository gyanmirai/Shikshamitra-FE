import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Tag, Phone, Person, School } from '@mui/icons-material';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { AdjustmentRequest } from '../types/adjustment.types';

/**
 * Student information card matching the ConcessionAdmin StudentInformationAccordion style.
 * Used in both the Apply Adjustment screen and the Adjustment Preview screen.
 */
const AdjustmentStudentCard: React.FC<{ adjustment: AdjustmentRequest }> = ({ adjustment }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderRadius: 2,
      mt: 2,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: 4 },
    }}
  >
    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
      <Iconify
        icon="solar:users-group-rounded-bold-duotone"
        width={18}
        sx={{ color: 'primary.main' }}
      />
      <Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Student Information
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Details of the selected student
        </Typography>
      </Box>
    </Stack>

    <Divider sx={{ mb: 2 }} />

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Person sx={{ fontSize: 20, color: 'info.main' }} />}
          label="Student Name"
          value={`${adjustment.studentName ?? 'N/A'}${adjustment.studentGrNo ? ` (${adjustment.studentGrNo})` : ''}`}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Tag sx={{ fontSize: 20, color: 'warning.main' }} />}
          label="Roll No."
          value={adjustment.rollNumber ?? 'N/A'}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<School sx={{ fontSize: 20, color: 'primary.dark' }} />}
          label="Class / Div"
          value={
            adjustment.className
              ? `${adjustment.className}${adjustment.divisionName ? ` (${adjustment.divisionName})` : ''}`
              : 'N/A'
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <InfoItem
          icon={<Phone sx={{ fontSize: 20, color: 'info.dark' }} />}
          label="Contact No."
          value={adjustment.contactNo ?? 'N/A'}
        />
      </Grid>
    </Grid>
  </Paper>
);

export default AdjustmentStudentCard;
