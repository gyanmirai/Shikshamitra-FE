import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubmissionType } from 'src/enums/submission_type';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';
import { TeacherHoverProfile } from 'src/screens/academic/curriculum-management/subject-assignment/component/view-detail-components/subjectOverview';
import {
  Box,
  Grid,
  Card,
  Badge,
  Button,
  Avatar,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import type { IHomework } from '../../type';

const HomeworkOverview = ({ homework }: { homework: IHomework }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              height: '100%',
              mx: 'auto',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Main Info Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                      {homework?.title}
                    </Typography>

                    {/* Status Label from divisionMeta */}
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

                  {/* Description */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                    >
                      Description :
                    </Typography>

                    <Box>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: showFullDescription ? 'unset' : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {homework?.description}
                      </Typography>

                      {homework?.description && homework.description.length > 150 && (
                        <Button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          sx={{
                            color: 'primary.main',
                            p: 0,
                            '&:hover': {
                              background: 'none',
                            },
                          }}
                        >
                          {showFullDescription ? 'Show Less' : 'Show More'}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Type & Submit Via */}
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
                        sx={{ color: 'text.secondary', width: 20, height: 20, mr: 0.5 }}
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
                        sx={{ color: 'text.secondary', width: 20, height: 20, mr: 0.5 }}
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

                  {/* Document */}
                  <Box>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Iconify
                        icon={GlobalIcons.documentIcon}
                        sx={{ mr: 1, height: '22px', width: '22px' }}
                      />
                      Document
                    </Typography>

                    <Box>
                      <DocumentCard
                        file={{
                          path: './lecture_notes.pdf',
                          relativePath: './lecture_notes.pdf',
                          name: 'Homework Document 1',
                          size: '2.5 MB',
                          uploadDate: '2024-03-15',
                          type: 'pdf',
                          url: 'https://example.com/files/lecture_notes.pdf',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                {/* Timeline & Created By */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Timeline
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Created At */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mdi:calendar-plus" sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Created On
                        </Typography>
                        <Typography variant="body2">
                          {homework?.divisionMeta?.createdAt
                            ? dayjs(homework.divisionMeta.createdAt).format('DD MMM YYYY, hh:mm A')
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Publish Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mdi:calendar-clock" sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Published On
                        </Typography>
                        <Typography variant="body2">
                          {homework?.divisionMeta?.publishDate
                            ? dayjs(homework.divisionMeta.publishDate).format(
                                'DD MMM YYYY, hh:mm A'
                              )
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Due Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mdi:calendar-check" sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Due On
                        </Typography>
                        <Typography variant="body2">
                          {homework?.divisionMeta?.dueDate
                            ? dayjs(homework.divisionMeta.dueDate).format('DD MMM YYYY, hh:mm A')
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Created By */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Created By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListItem
                      sx={{
                        borderRadius: '8px',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 3,
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
                                src={homework.createdBy.fullName}
                                alt={homework.createdBy.fullName}
                                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                              />
                            </Badge>
                          }
                          teacher={{
                            name: homework?.createdBy?.fullName,
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
                            {homework?.createdBy?.fullName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {homework?.createdBy?.department}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Box>
                </Box>
              </CardContent>
            </Scrollbar>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeworkOverview;
