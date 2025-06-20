import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';

import {
  Box,
  Grid,
  Card,
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

import type { IHomework } from '../../type';

const HomeworkOverview = ({ homework }: { homework: IHomework }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%', mx: 'auto', boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            {/* Main Info Row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                {/* Homework Type */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2,
                  }}
                >
                  {/* Title */}
                  <Typography variant="subtitle1" component="span">
                    {homework?.title}
                  </Typography>
                  <Label
                    variant="soft"
                    color={
                      PublishUnpublishStatusTypeColors[
                        homework?.divisionMeta?.status as PublishUnpublishStatusType
                      ] as LabelColor
                    }
                  >
                    {
                      PublishUnpublishStatusType[
                        homework?.divisionMeta?.status as PublishUnpublishStatusType
                      ] as string
                    }
                  </Label>
                </Box>

                {/* Status Label */}

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
                    {homework?.description}
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
                      {homework.homeworkType}
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
                      {SubmissionType[homework?.submissionType]}
                    </Typography>
                  </Box>
                </Box>

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

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Publish Date Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar" />
                  <Typography variant="body2">
                    {dayjs(homework?.divisionMeta?.publishDate).format('DD MMM YYYY hh:mm')}
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
                      color: dayjs().isAfter(homework?.divisionMeta?.dueDate)
                        ? 'error.main'
                        : dayjs().add(1, 'day').isAfter(homework?.divisionMeta?.dueDate)
                          ? 'warning.main'
                          : 'success.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: dayjs().isAfter(homework?.divisionMeta?.dueDate)
                        ? 'error.main'
                        : dayjs().add(1, 'day').isAfter(homework?.divisionMeta?.dueDate)
                          ? 'warning.main'
                          : 'success.main',
                      fontWeight: 500,
                    }}
                  >
                    {dayjs(homework?.divisionMeta?.dueDate).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>
              {/* Due Date */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Created On
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar" />
                  <Typography variant="body2">
                    {dayjs(homework?.divisionMeta?.createdAt).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>

              {/* Schedule Date */}
              {/* {homework?.isScheduled && homework?.scheduleDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Scheduled Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:calendar-clock" color="info.main" />
                    <Typography variant="body1" fontWeight={500}>
                      {dayjs(homework?.dueDate).format('DD MMM YYYY')}
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
                          key={homework?.createdBy?.status}
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
                                  homework?.createdBy?.status === 'Active'
                                    ? 'success.main'
                                    : homework?.createdBy?.status === 'Inactive'
                                      ? 'warning.main'
                                      : homework?.createdBy?.status === 'Left'
                                        ? 'error.main'
                                        : homework?.createdBy?.status === 'Retired'
                                          ? 'grey.500'
                                          : 'grey.300',
                              }}
                            />
                          }
                        >
                          <Avatar
                            src={homework?.createdBy?.name}
                            alt={homework?.createdBy?.name}
                            sx={{ width: 36, height: 36, cursor: 'pointer' }}
                          />
                        </Badge>
                      }
                      teacher={{
                        name: homework?.createdBy?.name,
                        avatarUrl: homework?.createdBy?.avatarUrl,
                        designation: homework?.createdBy?.designation,
                        department: homework?.createdBy?.department,
                        class: homework?.createdBy?.class,
                        status: homework?.createdBy?.status,
                        division: homework?.createdBy?.division,
                        dailyStatus: homework?.createdBy?.dailyStatus,
                        email: homework?.createdBy?.email,
                        experience: homework?.createdBy?.experience,
                        qualification: homework?.createdBy?.qualification,
                        subjects: homework?.createdBy?.subjects,
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ mb: -1 }}>
                        {homework?.createdBy?.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {homework?.createdBy?.designation}
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

export default HomeworkOverview;
