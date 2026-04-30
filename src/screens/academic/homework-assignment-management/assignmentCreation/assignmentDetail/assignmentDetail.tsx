import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubmissionType } from 'src/enums/submission_type';
import { Box, Card, Grid, Divider, Skeleton, Typography } from '@mui/material';

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

const ViewAssignmentDetails = ({
  assignment,
  isLoading,
}: {
  assignment: IAssignment | null;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 1, height: '100%' }}>
        <Scrollbar sx={{ height: '100%' }}>
          {/* Top Info Card Skeleton */}
          <Card
            sx={{
              mx: 'auto',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              ml: 1,
              mb: 2,
              mr: 1,
              mt: 0.5,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid size={{ xs: 12, md: 3 }} key={item}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Skeleton
                        variant="rounded"
                        width={40}
                        height={40}
                        sx={{ borderRadius: 1.5 }}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Skeleton variant="text" width="40%" sx={{ fontSize: '0.875rem' }} />
                        <Skeleton variant="text" width="70%" sx={{ fontSize: '1rem' }} />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>

          {/* Overview Skeleton */}
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              {/* Left Column Skeleton */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card
                  sx={{
                    height: '100%',
                    mx: 'auto',
                    boxShadow: 'var(--shadows-10)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 2,
                        alignItems: 'center',
                      }}
                    >
                      <Skeleton variant="text" width="30%" height={32} />
                      <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 4 }} />
                    </Box>
                    <Skeleton variant="text" width="15%" sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={70} sx={{ mb: 3, borderRadius: 1 }} />
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                      <Skeleton
                        variant="rounded"
                        width={110}
                        height={36}
                        sx={{ borderRadius: 1 }}
                      />
                      <Skeleton
                        variant="rounded"
                        width={130}
                        height={36}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    <Skeleton variant="text" width="20%" sx={{ mb: 1.5 }} />
                    <Skeleton variant="rounded" height={60} sx={{ borderRadius: 1 }} />
                  </Box>
                </Card>
              </Grid>

              {/* Right Column Skeleton */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    mx: 'auto',
                    boxShadow: 'var(--shadows-10)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                    {[1, 2, 3].map((item) => (
                      <Box
                        key={item}
                        sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}
                      >
                        <Skeleton variant="circular" width={24} height={24} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Skeleton variant="text" width="50%" />
                          <Skeleton variant="text" width="70%" />
                        </Box>
                      </Box>
                    ))}
                    <Skeleton variant="text" width="40%" height={32} sx={{ mt: 4, mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Scrollbar>
      </Box>
    );
  }
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
            mx: 1,
            mb: 2,
            mt: 0.5,
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            {[
              {
                label: 'Subject',
                value: (assignment as any).subjectName || assignment.subjectName || 'N/A',
              },
              {
                label: 'Class',
                value:
                  [
                    (assignment as any).standardName || assignment.className,
                    assignment.divisionMeta?.divisionName ||
                      (assignment as any).divisionSchedules?.[0]?.divisionName ||
                      assignment.divisionMeta?.divisionId,
                  ]
                    .filter(Boolean)
                    .join(' - ') || 'N/A',
              },
              {
                label: 'Type',
                value:
                  (assignment as any).assignmentTypeName || assignment.assignmentsType || 'N/A',
              },
              {
                label: 'Submit Via',
                value:
                  SubmissionType[assignment.submissionType as number] ||
                  assignment.submissionType ||
                  'N/A',
              },
            ].map((item, idx, arr) => (
              <React.Fragment key={item.label}>
                <Box sx={{ flex: 1, px: 3, py: 2 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      letterSpacing: 1.5,
                      fontSize: '0.65rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {item.value}
                  </Typography>
                </Box>
                {idx < arr.length - 1 && <Divider orientation="vertical" flexItem />}
              </React.Fragment>
            ))}
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
