import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';
import TeacherHoverProfile from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/TeacherHoverProfile';
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

import { InfoItem } from './assignmentDetail';

import type { IAssignment } from '../type';

const AssignmentOverview = ({ assignment }: { assignment: IAssignment }) => {
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
              ml: 1,
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
                        component="div"
                        sx={{
                          textAlign: 'justify',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: showFullDescription ? 'unset' : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '& p': { margin: 0 },
                          '& ul, & ol': { paddingLeft: 2 },
                        }}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: assignment?.description || '' }}
                      />

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
                      {(() => {
                        // API returns either attachment (string) or attachments (array)
                        const singleAttachment = (assignment as any).attachment;
                        const attachmentsArray = (assignment as any).attachments;

                        if (Array.isArray(attachmentsArray) && attachmentsArray.length > 0) {
                          return attachmentsArray.map((att: any, idx: number) => (
                            <DocumentCard
                              key={att.id || idx}
                              file={{
                                path: att.filePath || att.url || '',
                                relativePath: att.filePath || att.url || '',
                                name: att.fileName || att.name || `Document ${idx + 1}`,
                                size: att.fileSize
                                  ? `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                  : '',
                                uploadDate: att.createdAt || '',
                                type: att.fileType || att.type || 'file',
                                url: att.filePath || att.url || '',
                              }}
                            />
                          ));
                        }
                        if (singleAttachment && typeof singleAttachment === 'string') {
                          const fileName = singleAttachment.split('/').pop() || 'Attachment';
                          return (
                            <DocumentCard
                              file={{
                                path: singleAttachment,
                                relativePath: singleAttachment,
                                name: fileName,
                                size: '',
                                uploadDate: '',
                                type: fileName.split('.').pop() || 'file',
                                url: singleAttachment,
                              }}
                            />
                          );
                        }
                        return (
                          <Typography variant="body2" color="text.secondary">
                            No documents attached.
                          </Typography>
                        );
                      })()}
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
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', borderRadius: 2, mr: 1 }}>
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Timeline
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Created At */}
                    <InfoItem
                      icon={<Iconify icon="mdi:calendar-plus" />}
                      label="Created On"
                      value={
                        (assignment as any).createdAt
                          ? dayjs((assignment as any).createdAt).format('DD MMM YYYY, hh:mm A')
                          : 'N/A'
                      }
                    />

                    {/* Publish Date */}
                    <InfoItem
                      icon={<Iconify icon="mdi:calendar-clock" />}
                      label="Publish Date"
                      value={
                        assignment?.divisionMeta?.publishDate ||
                        (assignment?.divisionMeta as any)?.publishAt ||
                        (assignment as any).divisionSchedules?.[0]?.publishAt
                          ? dayjs(
                              assignment?.divisionMeta?.publishDate ||
                                (assignment?.divisionMeta as any)?.publishAt ||
                                (assignment as any).divisionSchedules?.[0]?.publishAt
                            ).format('DD MMM YYYY, hh:mm A')
                          : 'N/A'
                      }
                    />

                    {/* Due Date */}
                    <InfoItem
                      icon={<Iconify icon="mdi:calendar-clock" />}
                      label="Due Date"
                      value={
                        assignment?.divisionMeta?.dueDate ||
                        (assignment?.divisionMeta as any)?.dueAt ||
                        (assignment as any).divisionSchedules?.[0]?.dueAt
                          ? dayjs(
                              assignment?.divisionMeta?.dueDate ||
                                (assignment?.divisionMeta as any)?.dueAt ||
                                (assignment as any).divisionSchedules?.[0]?.dueAt
                            ).format('DD MMM YYYY, hh:mm A')
                          : 'N/A'
                      }
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Created By
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {typeof assignment?.createdBy === 'string' ? (
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
                          <Avatar sx={{ width: 36, height: 36 }}>
                            {(assignment.createdBy as unknown as string)?.[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {assignment.createdBy as unknown as string}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ) : (
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
                    )}
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
