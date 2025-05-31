import type { LabelColor } from 'src/components/label';

import {
  Box,
  Grid,
  Card,
  Chip,
  Avatar,
  Divider,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UserHoverProfile from 'src/components/student-popover';

import type { IAssignment } from '../type';

const AssignmentOverview = ({ assignment }: { assignment: IAssignment | null }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Iconify icon="mdi:information-outline" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Assignment Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow label="Title" value={assignment?.title} icon="mdi:bookmark-outline" />
            <DetailRow
              label="Description"
              value={assignment?.description}
              icon="mdi:text-box-outline"
            />
            <DetailRow label="Class" value={assignment?.class} icon="mdi:school-outline" />

            {/* Divisions */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Iconify icon="mdi:account-group-outline" />
                <Typography variant="subtitle1" className="text-gray-600 mb-1">
                  Divisions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', pb: 2, pl: 4.5, gap: 1 }}>
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
              value={assignment?.submissionType}
              icon="mdi:upload"
              color="error"
              sx={{ backgroundColor: '#FFEBEE' }}
            />

            {/* Status with color */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Iconify icon="mdi:information" />
                <Typography variant="subtitle1" className="text-gray-600 mb-1">
                  Status
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', pb: 2, pl: 4.5, gap: 1 }}>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Iconify icon="mdi:calendar-clock" />
                  <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                    Scheduled:
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', pb: 2, pl: 4.5, gap: 1 }}>
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
              <Typography variant="h6" gutterBottom>
                <Iconify icon="mdi:clock-outline" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Timeline & Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar-alert" color="error.main" />
                  <Typography variant="body1" fontWeight={500}>
                    {dayjs(assignment?.dueDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Box>

              {assignment?.isScheduled && assignment?.scheduleDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Scheduled Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:calendar-clock" color="info.main" />
                    <Typography variant="body1" fontWeight={500}>
                      {dayjs(assignment?.scheduleDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>
              )}

              {assignment?.todaysDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Today&apos;s Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:calendar-today" color="success.main" />
                    <Typography variant="body1" fontWeight={500}>
                      {dayjs(assignment?.todaysDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>
              )} */}

              <Divider sx={{ my: 2 }} />

              {/* Created By */}
              <Typography variant="h6" gutterBottom>
                <Iconify icon="mdi:account" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Created By
              </Typography>

              <Box sx={{ mb: 2 }}>
                <ListItem
                  disablePadding
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: '8px',
                    p: 1,
                    boxShadow: 2,
                    my: 1,
                  }}
                >
                  <ListItemAvatar>
                    <UserHoverProfile
                      avatarComp={
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 36,
                            height: 36,
                            cursor: 'pointer',
                          }}
                        >
                          {assignment?.createdBy
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'T'}
                        </Avatar>
                      }
                      user={{
                        name: assignment?.createdBy || 'Teacher',
                        avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        role: 'Teacher',
                        email: 'teacher@example.com',
                        class: assignment?.class,
                        division: assignment?.division?.join(', '),
                        board: 'CBSE',
                        medium: 'English',
                        organization: 'Higher Secondary',
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2">{assignment?.createdBy}</Typography>}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Teacher
                      </Typography>
                    }
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
