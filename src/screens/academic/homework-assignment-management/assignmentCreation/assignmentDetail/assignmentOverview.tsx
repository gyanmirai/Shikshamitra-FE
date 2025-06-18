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

import { SubmissionType } from 'src/enums/submission_type';
import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';
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
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <DetailRow label="Title" value={assignment?.title} icon="mdi:bookmark-outline" />
            <DetailRow
              label="Description"
              value={assignment?.description}
              icon="mdi:text-box-outline"
            />
            <DetailRow label="Class" value={assignment?.class} icon="mdi:school-outline" />

            {/* Divisions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Iconify icon="mdi:account-group-outline" />
                <Typography variant="subtitle2">Divisions</Typography>
              </Box>
              <Box sx={{ display: 'flex', pl: 3.5, gap: 1 }}>
                {assignment?.division && assignment.division.length > 0 ? (
                  assignment.division.map((div, index) => (
                    <Chip key={index} label={div} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not specified
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Subjects */}
            <DetailRow label="Subject" value={assignment?.subjects} icon="mdi:book-open-variant" />

            <DetailRow
              label="Assignment Type"
              value={assignment?.assignmentType}
              icon="mdi:format-list-bulleted-type"
            />
            <DetailRow
              label="Submission Type"
              value={assignment.submissionType ? SubmissionType[assignment.submissionType] : ''}
              icon="mdi:upload"
              color="error"
              sx={{ backgroundColor: '#FFEBEE' }}
            />

            {/* Status with color */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Iconify icon="mdi:information" />
                <Typography variant="subtitle2">Status</Typography>
              </Box>
              <Box sx={{ display: 'flex', pb: 2, pl: 3.5, gap: 1 }}>
                <Label
                  color={
                    PublishUnpublishStatusTypeColors[
                      assignment?.status as PublishUnpublishStatusType
                    ] as LabelColor
                  }
                >
                  {PublishUnpublishStatusType[assignment?.status as PublishUnpublishStatusType]}
                </Label>
              </Box>
            </Box>

            {/* {assignment?.isScheduled && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Iconify icon="mdi:calendar-clock" />
                  <Typography variant="subtitle2">Scheduled</Typography>
                </Box>
                <Box sx={{ display: 'flex', pb: 2, pl: 3.5, gap: 1 }}>
                  <Chip label="Yes" size="small" color="info" variant="outlined" />
                </Box>
              </Box>
            )} */}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <Scrollbar sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Iconify icon="mdi:clock-outline" sx={{ mr: 1, height: '22px', width: '22px' }} />
                Timeline & Dates
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {/* Due Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Start Date Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar-alert" color="error.main" />
                  <Typography variant="body2">
                    {dayjs(assignment?.startDate).format('DD MMM YYYY hh:mm')}
                  </Typography>
                </Box>
              </Box>

              {/* End Date */}
              {assignment?.endDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    End Date Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:calendar-end" color="warning.main" />
                    <Typography variant="body2">
                      {dayjs(assignment.endDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>
              )}

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

              <Divider sx={{ my: 2 }} />

              {/* Created By */}
              <Typography
                variant="subtitle1"
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
                    primary={<Typography variant="body2">{assignment?.createdBy?.name}</Typography>}
                  />
                </ListItem>
              </Box>

              {/* Attachments Count */}
              {assignment?.attachments && assignment.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:paperclip" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">
                      {assignment.attachments.length} attachment(s)
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Scrollbar>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default AssignmentOverview;
