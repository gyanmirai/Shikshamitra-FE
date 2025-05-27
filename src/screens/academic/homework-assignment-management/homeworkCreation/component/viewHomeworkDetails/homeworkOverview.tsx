import type { LabelColor } from 'src/components/label';
import type { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

import dayjs from 'dayjs';

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
import { PublishUnpublishStatusTypeColors } from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UserHoverProfile from 'src/components/student-popover';

import type { IHomework } from '../../type';

const HomeworkOverview = ({ homework }: { homework: IHomework }) => (
  <Box sx={{ height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Iconify icon="mdi:information-outline" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Homework Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow label="Title" value={homework?.title} icon="mdi:bookmark-outline" />
            <DetailRow
              label="Description"
              value={homework?.description}
              icon="mdi:text-box-outline"
            />
            <DetailRow label="Subject" value={homework?.subject} icon="mdi:book-open-variant" />
            <DetailRow label="Class" value={homework?.class} icon="mdi:school-outline" />

            {/* Divisions */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Iconify icon="mdi:account-group-outline" />
                <Typography variant="subtitle1" className="text-gray-600 mb-1">
                  Divisions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', pb: 2, pl: 4.5, gap: 1 }}>
                {homework?.division && homework.division.length > 0 ? (
                  homework.division.map((div, index) => (
                    <Chip key={index} label={div} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not specified
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Chapters */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Iconify icon="mdi:book-multiple-outline" />
                <Typography variant="subtitle1" className="text-gray-600 mb-1">
                  Chapters
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', pb: 2, pl: 4.5, gap: 1 }}>
                {homework?.chapters && homework.chapters.length > 0 ? (
                  homework.chapters.map((chapter, index) => (
                    <Chip key={index} label={chapter} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No chapters specified
                  </Typography>
                )}
              </Box>
            </Box>

            <DetailRow
              label="Homework Type"
              value={homework?.homeworkType}
              icon="mdi:format-list-bulleted-type"
            />
            <DetailRow
              label="Submission Type"
              value={homework?.submissionType}
              icon="mdi:upload"
              color="error"
              sx={{ backgroundColor: '#FFEBEE' }}
            />

            {/* Status with color */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
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
                      homework?.status as PublishUnpublishStatusType
                    ] as LabelColor
                  }
                >
                  Published
                </Label>
              </Box>
            </Box>

            {homework?.isDailyTask && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Iconify icon="mdi:calendar-today" sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
                  Daily Task:
                </Typography>
                <Chip label="Yes" size="small" color="warning" variant="outlined" />
              </Box>
            )}

            {/* {homework?.dayOfSubmission && (
              <DetailRow
                label="Sub"
                value={homework.dayOfSubmission}
                icon="mdi:calendar-check"
              />
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

              {/* Due Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="mdi:calendar-alert" color="error.main" />
                  <Typography variant="body1" fontWeight={500}>
                    {dayjs(homework?.dueDate).format('DD MMM YYYY')}
                  </Typography>
                </Box>
              </Box>

              {/* End Date */}
              {homework?.endDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    End Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:calendar-end" color="warning.main" />
                    <Typography variant="body1" fontWeight={500}>
                      {dayjs(homework.endDate).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Schedule Date */}
              {homework?.isScheduled && homework?.scheduleDate && (
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
              )}

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
                          {homework?.createdBy
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'T'}
                        </Avatar>
                      }
                      user={{
                        name: homework?.createdBy || 'Teacher',
                        avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        role: 'Teacher',
                        email: 'teacher@example.com',
                        class: homework?.class,
                        division: homework?.division?.join(', '),
                        board: 'CBSE',
                        medium: 'English',
                        organization: 'Higher Secondary',
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2">{homework?.createdBy}</Typography>}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Teacher
                      </Typography>
                    }
                  />
                </ListItem>
              </Box>

              {/* Attachments Count */}
              {homework?.attachments && homework.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="mdi:paperclip" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">
                      {homework.attachments.length} attachment(s)
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

export default HomeworkOverview;
