import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';

import {
  Box,
  Grid,
  Card,
  Chip,
  Badge,
  Avatar,
  Divider,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { SubmissionType } from 'src/enums/submission_type';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';
import { TeacherHoverProfile } from 'src/screens/academic/curriculum-management/subject/component/viewDetailComponents/subjectOverview';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import type { IAssignment } from '../type';

const AssignmentOverview = ({ assignment }: { assignment: IAssignment }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%', mx: 'auto', boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            {/* Main Info Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                {/* assignment Type */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2,
                  }}
                >
                  {/* Homework Type */}
                  <Typography variant="subtitle1" component="span">
                    {assignment?.title}
                  </Typography>

                  {/* Status Label from divisionMeta */}
                  <Label
                    variant="soft"
                    color={
                      PublishUnpublishStatusTypeColors[
                        assignment?.divisionMeta?.status as PublishUnpublishStatusType
                      ] as LabelColor
                    }
                  >
                    {
                      PublishUnpublishStatusType[
                        assignment?.divisionMeta?.status as PublishUnpublishStatusType
                      ] as string
                    }
                  </Label>
                </Box>
                {/* Description */}

                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                  >
                    Description :
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      lineHeight: 1.6,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {assignment?.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: 'background.neutral',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.75,
                    }}
                  >
                    <Iconify
                      icon="mdi:notebook-edit"
                      sx={{
                        color: 'text.secondary',
                        width: 20,
                        height: 20,
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: 600, color: 'text.secondary' }}
                    >
                      Type :
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {assignment.assignmentType}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: 'background.neutral',
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.75,
                    }}
                  >
                    <Iconify
                      icon={GlobalIcons.submit}
                      sx={{
                        color: 'text.secondary',
                        width: 20,
                        height: 20,
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: 600, color: 'text.secondary' }}
                    >
                      Submit Via :
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {SubmissionType[assignment?.submissionType]}
                    </Typography>
                  </Box>
                </Box>

                {Boolean(assignment?.students?.length) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                    >
                      Assigned Students:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {assignment?.students?.map((student, index) => (
                        <Chip
                          key={index}
                          avatar={<Avatar alt={student} />}
                          label={student}
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            '& .MuiChip-avatar': {
                              width: 24,
                              height: 24,
                              marginLeft: '4px',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Class */}

                {/* Subject */}

                {/* Status Label from divisionMeta */}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
          <Scrollbar sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Iconify icon="mdi:clock-outline" sx={{ mr: 1, height: '22px', width: '22px' }} />
                Timeline
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {/* Due Date */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Publish Date Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar" />
                  <Typography variant="body2">
                    {dayjs(assignment?.divisionMeta?.publishDate).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Due Date Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="mdi:calendar"
                    sx={{
                      color: dayjs().isAfter(assignment?.divisionMeta?.dueDate)
                        ? 'error.main'
                        : dayjs().add(1, 'day').isAfter(assignment?.divisionMeta?.dueDate)
                          ? 'warning.main'
                          : 'success.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: dayjs().isAfter(assignment?.divisionMeta?.dueDate)
                        ? 'error.main'
                        : dayjs().add(1, 'day').isAfter(assignment?.divisionMeta?.dueDate)
                          ? 'warning.main'
                          : 'success.main',
                      fontWeight: 500,
                    }}
                  >
                    {dayjs(assignment?.divisionMeta?.dueDate).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Created On
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar" />
                  <Typography variant="body2">
                    {dayjs(assignment?.divisionMeta?.createdAt).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>

              {/* Schedule Date */}
              {/* {assignment?.isScheduled && assignment?.scheduleDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Scheduled Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar-clock" color="info.main" />
                  <Typography variant="body1" fontWeight={500}>
                    {dayjs(assignment?.dueDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Box>
            )} */}

              <Divider sx={{ my: 1 }} />

              {/* Created By */}
              <Typography
                variant="body1"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Iconify icon="mdi:account" sx={{ mr: 1, height: '22px', width: '22px' }} />
                Created By
              </Typography>

              <Box sx={{ mb: 2 }}>
                <ListItem
                  sx={{
                    borderRadius: '8px',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                    // mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <TeacherHoverProfile
                      avatarComp={
                        <Badge
                          key={assignment?.createdBy?.status}
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
                                  assignment?.createdBy?.status === 'Active'
                                    ? 'success.main'
                                    : assignment?.createdBy?.status === 'Inactive'
                                      ? 'warning.main'
                                      : assignment?.createdBy?.status === 'Left'
                                        ? 'error.main'
                                        : assignment?.createdBy?.status === 'Retired'
                                          ? 'grey.500'
                                          : 'grey.300',
                              }}
                            />
                          }
                        >
                          <Avatar
                            src={assignment?.createdBy?.name}
                            alt={assignment?.createdBy?.name}
                            sx={{ width: 36, height: 36, cursor: 'pointer' }}
                          />
                        </Badge>
                      }
                      teacher={{
                        name: assignment?.createdBy?.name,
                        avatarUrl: assignment?.createdBy?.avatarUrl,
                        designation: assignment?.createdBy?.designation,
                        department: assignment?.createdBy?.department,
                        class: assignment?.createdBy?.class,
                        status: assignment?.createdBy?.status,
                        division: assignment?.createdBy?.division,
                        dailyStatus: assignment?.createdBy?.dailyStatus,
                        email: assignment?.createdBy?.email,
                        experience: assignment?.createdBy?.experience,
                        qualification: assignment?.createdBy?.qualification,
                        subjects: assignment?.createdBy?.subjects,
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ mb: -1 }}>
                        {assignment?.createdBy?.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {assignment?.createdBy?.designation}
                      </Typography>
                    }
                  />
                </ListItem>
              </Box>

              {/* Attachments Count */}
            </CardContent>
          </Scrollbar>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default AssignmentOverview;
