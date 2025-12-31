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
import { TeacherHoverProfile } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/subjectOverview';
import {
  Box,
  Grid,
  Card,
  Chip,
  Badge,
  Avatar,
  Button,
  ListItem,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import type { IAssignment } from '../type';

const AssignmentOverview = ({ assignment }: { assignment: IAssignment }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{ height: '100%', mx: 'auto', boxShadow: 'var(--shadows-10)', borderRadius: 2 }}
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
                        {assignment?.description}
                      </Typography>

                      {assignment?.description && assignment.description.length > 150 && (
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
                        {assignment.assignmentTypeId}
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
                        {SubmissionType[assignment?.submissionType]}
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
                          name: 'Assignment Document 1',
                          size: '2.5 MB',
                          uploadDate: '2024-03-15',
                          type: 'pdf',
                          url: 'https://example.com/files/lecture_notes.pdf',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Assigned Students */}
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
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', borderRadius: 2 }}>
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
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
                          {assignment?.divisionMeta?.createdAt
                            ? dayjs(assignment.divisionMeta.createdAt).format(
                                'DD MMM YYYY, hh:mm A'
                              )
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
                          {assignment?.divisionMeta?.publishDate
                            ? dayjs(assignment.divisionMeta.publishDate).format(
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
                          {assignment?.divisionMeta?.dueDate
                            ? dayjs(assignment.divisionMeta.dueDate).format('DD MMM YYYY, hh:mm A')
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
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
                                src={assignment.createdBy.fullName}
                                alt={assignment.createdBy.fullName}
                                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                              />
                            </Badge>
                          }
                          teacher={{
                            name: assignment?.createdBy?.fullName,
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
                            {assignment?.createdBy?.fullName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {assignment?.createdBy?.department}
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

export default AssignmentOverview;
