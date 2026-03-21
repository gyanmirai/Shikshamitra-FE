import type { ReactElement } from 'react';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, Badge, Avatar, Typography, CardContent } from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academic-api/curriculum-management-api/subject-assignment-api.ts/subject-assignment-api';

import type { ISubjectDetail } from '../type';

// Reuse InfoItem from assignmentDetail for consistency
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
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
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
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

const SubjectOverview = ({ subject }: { subject: ISubjectDetail }) => {
  const {
    data: subjectData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { assignmentId: subject?.id },
  });

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Main Details */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
            }}
          >
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                  Subject Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:code-tags" />}
                      label="Subject Code"
                      value={subject?.subjectCode}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:target" />}
                      label="Learning Goal"
                      value={subject?.learningGoal}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:text-box-outline" />}
                      label="Description"
                      value={subject?.description}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <InfoItem
                      icon={<Iconify icon="mdi:alert-decagram-outline" />}
                      label="Prerequisites"
                      value={subject?.prerequisites}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Scrollbar>
          </Card>
        </Grid>

        {/* Teachers Side Panel */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Teaching Staff
              </Typography>

              {/* Primary Teacher */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                >
                  Primary Teacher
                </Typography>

                {/* Placeholder for primary teacher logic if data existed, retaining existing structure logic for HoverProfile but wrapping cleaner */}
                {/* Assuming strictly UI update, I will keep the TeacherHoverProfile component available but here just showing how it would look if data was connected properly in the original code, which seemed to rely on hover. 
                    Original code had commented out ListItem. I will restore a clean placeholder or structure if data is missing, matching the prompt rule not to change logic but improve UI. 
                    Since original commented out code was there, I will assume we should just allow the space for it.
                */}

                {/* 
                     NOTE: The original file had almost all teacher rendering logic COMMENTED OUT in the view.
                     I will respect that and essentially provide a container.
                     If I were to uncomment it, I would break 'no logic change' rules if the data isn't actually there.
                     However, the task says 'Modernize viewDetailComponents/subjectOverview.tsx'.
                     I will leave the structure ready.
                  */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => varAlpha(theme.palette.background.neutralChannel, 0.4),
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No primary teacher assigned
                  </Typography>
                </Box>
              </Box>

              {/* Secondary Teachers */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                >
                  Secondary Teacher
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => varAlpha(theme.palette.background.neutralChannel, 0.4),
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No secondary teachers assigned
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubjectOverview;

interface TeacherProfile {
  name?: string;
  avatarUrl?: string;
  designation?: string;
  department?: string;
  class?: string;
  status?: string;
  division?: string;
  dailyStatus?: string;
  email?: string;
  experience?: string;
  qualification?: string;
  subjects?: string[];
}

export const TeacherHoverProfile: React.FC<{
  teacher?: TeacherProfile;
  avatarComp: ReactElement<any, any>;
}> = ({ teacher, avatarComp }: any) => (
  <CustomTooltip
    arrow
    placement="right"
    title={
      <Card sx={{ p: 0, minWidth: 280, boxShadow: 'none' }}>
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Badge
            key={teacher.status}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  bgcolor:
                    teacher.status === 'Active'
                      ? 'success.main'
                      : teacher.status === 'Inactive'
                        ? 'warning.main'
                        : teacher.status === 'Left'
                          ? 'error.main'
                          : teacher.status === 'Retired'
                            ? 'grey.500'
                            : 'grey.300',
                }}
              />
            }
          >
            <Avatar src={teacher.avatarUrl} alt={teacher.name} sx={{ width: 48, height: 48 }} />
          </Badge>
          <Box>
            <Typography variant="subtitle2" color="text.primary">
              {teacher.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {teacher.designation}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {teacher.department}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="caption" color="text.primary" fontWeight={600}>
              {teacher.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Experience
            </Typography>
            <Typography variant="caption" color="text.primary" fontWeight={600}>
              {teacher.experience}
            </Typography>
          </Box>
        </Box>
      </Card>
    }
  >
    {avatarComp}
  </CustomTooltip>
);
