import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Typography } from '@mui/material';

import AssignmentOverview from './assignmentOverview';

import type { IAssignment } from '../type';

// Reusable Info Item Component matching BasicChargeAccordianCard pattern
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

export const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 20 } })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const ViewAssignmentDetails = ({ assignment }: { assignment: IAssignment | null }) => {
  if (!assignment) {
    return (
      <Box
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Iconify
            icon="solar:clipboard-list-bold-duotone"
            sx={{ width: 64, height: 64, color: 'text.disabled' }}
          />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            No Assignment details available
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, height: '100%' }}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            mx: 'auto',
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            ml: 1,
            mb: 2,
            mr: 1,
            mt: 0.5,
          }}
        >
          {/* Body */}
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="mdi:book-open-page-variant" />}
                  label="Subject"
                  value={assignment.subjectName}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="mdi:google-classroom" />}
                  label="Class"
                  value={assignment.className}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon="mdi:notebook-edit" />}
                  label="Type"
                  value={assignment.assignmentsType}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <InfoItem
                  icon={<Iconify icon={GlobalIcons.submit} />}
                  label="Submit Via"
                  value={assignment.submissionType}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Detailed Overview */}
        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          <AssignmentOverview assignment={assignment} />
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default ViewAssignmentDetails;
