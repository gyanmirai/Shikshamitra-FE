'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubjectType } from 'src/enums/subject-type';
import { Box, Grid, Paper, Stack, Avatar, Skeleton, Typography } from '@mui/material';

import TeacherHoverProfile from './TeacherHoverProfile';
import {
  getUnifiedTeachers,
  toTeacherOption,
} from '../subjectAssignmentForm/teacherOptions';

import type { ISubjectDetail } from '../type';

export const SubjectOverviewSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: '100%', pr: 0.5 }}>
        <Grid container spacing={2}>
          {/* Left Column Skeleton */}
          <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
            <Stack spacing={2}>
              {/* Subject Info Skeleton */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                  border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
                }}
              >
                <Skeleton variant="text" width={140} height={24} sx={{ mb: 1.5 }} />
                <Grid container spacing={2}>
                  {[...Array(4)].map((_, i) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={i}>
                      <Skeleton variant="text" width={60} height={14} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width={80} height={20} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Learning Goal Skeleton */}
              {[...Array(3)].map((_, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                    border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={120} height={20} />
                  </Stack>
                  <Skeleton variant="text" width="95%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={18} />
                </Paper>
              ))}
            </Stack>
          </Grid>

          {/* Right Column Skeleton */}
          <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
              }}
            >
              <Skeleton variant="text" width={110} height={24} sx={{ mb: 2 }} />

              {/* Primary Teacher Skeleton */}
              <Box sx={{ mb: 2.5 }}>
                <Skeleton
                  variant="rounded"
                  width={90}
                  height={20}
                  sx={{ mb: 1.25, borderRadius: 1 }}
                />
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={18} />
                    <Skeleton variant="text" width="40%" height={14} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </Box>

              {/* Secondary Teachers Skeleton */}
              <Box>
                <Skeleton
                  variant="rounded"
                  width={110}
                  height={20}
                  sx={{ mb: 1.25, borderRadius: 1 }}
                />
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="35%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};

interface SectionBlockProps {
  icon: string;
  title: string;
  content?: string;
  emptyText: string;
}

const SectionBlock: React.FC<SectionBlockProps> = ({ icon, title, content, emptyText }) => {
  const theme = useTheme();
  const hasContent =
    content && content.trim().length > 0 && content !== '<p></p>' && content !== 'N/A';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
        border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={icon} width={18} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
      </Stack>

      {hasContent ? (
        <Typography
          variant="body2"
          component="div"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.7,
            wordBreak: 'break-word',
            '& p, & ul, & ol': { margin: 0, lineHeight: 1.7 },
            '& p:not(:last-child)': { marginBottom: 1 },
            '& ul, & ol': { paddingLeft: 2.5 },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontStyle: 'italic', fontSize: '0.8125rem' }}
        >
          {emptyText}
        </Typography>
      )}
    </Paper>
  );
};

interface SubjectOverviewProps {
  subject: ISubjectDetail | null;
  isLoading?: boolean;
}

const SubjectOverview: React.FC<SubjectOverviewProps> = ({ subject, isLoading }) => {
  const theme = useTheme();
  const teacherDetails = getUnifiedTeachers(subject ?? {});
  const teachers = teacherDetails.map(toTeacherOption);

  if (isLoading) {
    return <SubjectOverviewSkeleton />;
  }

  return (
    <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: '100%', pr: 0.5 }}>
        <Grid container spacing={2}>
          {/* ── LEFT COLUMN: Subject Information & Learning Details ── */}
          <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
            <Stack spacing={2}>
              {/* Compact Information Bar */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                  border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                >
                  Subject Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.25 }}
                    >
                      Subject Code
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'text.primary' }}
                    >
                      {subject?.subjectCode || '—'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.25 }}
                    >
                      Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {subject?.subjectNo !== undefined && SubjectType[subject.subjectNo]
                        ? SubjectType[subject.subjectNo]
                        : 'Standard'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.25 }}
                    >
                      Subject Name
                    </Typography>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, color: 'text.primary' }}
                    >
                      {subject?.subjectName || subject?.subject?.name || '—'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.25 }}
                    >
                      Medium
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {subject?.subject?.educationMediumId ? 'Configured' : 'General'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Learning Goals */}
              <SectionBlock
                icon="mdi:target"
                title="Learning Goal"
                content={subject?.learningGoals}
                emptyText="List concepts or skills students are expected to achieve in this subject."
              />

              {/* Description */}
              <SectionBlock
                icon="mdi:text-box-outline"
                title="Description"
                content={subject?.description}
                emptyText="No description provided for this subject allocation."
              />

              {/* Prerequisites */}
              <SectionBlock
                icon="mdi:alert-decagram-outline"
                title="Prerequisites"
                content={subject?.prerequisites}
                emptyText="No prerequisites required for this subject."
              />
            </Stack>
          </Grid>

          {/* ── RIGHT COLUMN: Teaching Staff ── */}
          <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
              >
                Teaching Staff
              </Typography>

              {teachers.length > 0 ? (
                <Stack spacing={1}>
                  {teachers.map((teacher) => (
                    <TeacherHoverProfile
                      key={teacher.id}
                      teacher={{
                        name: teacher.name,
                        status: 'Active',
                        designation: 'Subject Teacher',
                        department: 'Academics',
                        email: teacherDetails.find((item) => item.id === teacher.id)?.email,
                        experience: teacherDetails.find((item) => item.id === teacher.id)?.experience,
                      }}
                      avatarComp={
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: varAlpha(theme.palette.info.mainChannel, 0.05),
                            border: `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.12)}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: varAlpha(theme.palette.info.mainChannel, 0.09),
                              borderColor: theme.palette.info.main,
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: 'info.main',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}
                          >
                            {teacher.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ fontWeight: 600, color: 'text.primary' }}
                            >
                              {teacher.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {teacher.employeeCode || 'Teacher code unavailable'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No teachers assigned
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default SubjectOverview;
