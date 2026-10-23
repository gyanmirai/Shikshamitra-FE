import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import { formatLearningTaskDateTime } from 'src/utils/learning-task-date-time';
import { AssignmentStatus, ASSIGNMENT_STATUS_LABELS } from 'src/enums/assignment';
import {
  Box,
  Grid,
  Card,
  Chip,
  Badge,
  Avatar,
  Divider,
  Typography,
  CardContent,
} from '@mui/material';
import TeacherHoverProfile from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/TeacherHoverProfile';

import type { IAssignment } from '../type';

const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, LabelColor> = {
  [AssignmentStatus.Draft]: 'default',
  [AssignmentStatus.Published]: 'success',
  [AssignmentStatus.Closed]: 'warning',
};

const AssignmentOverview = ({ assignment }: { assignment: IAssignment }) => {
  const { createdAt } = assignment as any;
  const publishDate =
    assignment?.divisionMeta?.publishDate ||
    (assignment?.divisionMeta as any)?.publishAt ||
    (assignment as any).divisionSchedules?.[0]?.publishAt;
  const dueDate =
    assignment?.divisionMeta?.dueDate ||
    (assignment?.divisionMeta as any)?.dueAt ||
    (assignment as any).divisionSchedules?.[0]?.dueAt;

  const formatDate = (date: any) =>
    date ? formatLearningTaskDateTime(date, 'DD MMM YYYY') : 'N/A';
  const formatTime = (date: any) => (date ? formatLearningTaskDateTime(date, 'hh:mm A') : '');

  const timelineItems = [
    { label: 'Created', date: createdAt, color: 'text.disabled', variant: 'outlined' as const },
    {
      label: 'Publish date (IST)',
      date: publishDate,
      color: 'info.main',
      variant: 'outlined' as const,
    },
    { label: 'Due', date: dueDate, color: 'warning.main', variant: 'filled' as const },
  ];

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={1}>
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
            <CardContent sx={{ p: 2.5 }}>
              {/* Title + Status */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {assignment?.title}
                </Typography>
                <Label variant="soft" color={ASSIGNMENT_STATUS_COLORS[assignment.status]}>
                  {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                </Label>
              </Box>

              {/* Description */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 1 }}
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                    pl: 1.5,
                    py: 0.5,
                  }}
                >
                  <Scrollbar sx={{ maxHeight: 150 }}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      component="div"
                      sx={{
                        textAlign: 'justify',
                        lineHeight: 1.7,
                        '& p': { margin: 0 },
                        '& ul, & ol': { paddingLeft: 2 },
                      }}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: assignment?.description || '' }}
                    />
                  </Scrollbar>
                </Box>
              </Box>

              {/* Document */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 1 }}
                >
                  Document
                </Typography>
                {(() => {
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

              {/* Assigned Students */}
              {Boolean(assignment?.students?.length) && (
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 1 }}
                  >
                    Assigned Students
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
                          '& .MuiChip-avatar': { width: 24, height: 24, marginLeft: '4px' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', borderRadius: 2, mr: 1 }}>
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Timeline */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 2 }}
                  >
                    Timeline
                  </Typography>

                  <Box sx={{ position: 'relative', pl: 3 }}>
                    {/* Connecting line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 5,
                        top: 8,
                        bottom: 8,
                        width: 2,
                        bgcolor: 'text.disabled',
                        opacity: 0.3,
                        zIndex: 0,
                      }}
                    />

                    {timelineItems.map((item, idx) => (
                      <Box
                        key={item.label}
                        sx={{ position: 'relative', mb: idx < timelineItems.length - 1 ? 2.5 : 0 }}
                      >
                        {/* Dot */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -22,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            zIndex: 1,
                            ...(item.variant === 'outlined'
                              ? {
                                  border: '2px solid',
                                  borderColor: 'text.disabled',
                                  bgcolor: 'background.paper',
                                }
                              : {
                                  bgcolor: item.color,
                                }),
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatDate(item.date)}
                        </Typography>
                        {item.date && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatTime(item.date)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Created By */}
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 1.5 }}
                  >
                    Created By
                  </Typography>
                  {typeof assignment?.createdBy === 'string' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {(assignment.createdBy as unknown as string)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {assignment.createdBy as unknown as string}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                  border: '2px solid',
                                  borderColor: 'background.paper',
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
                              src={assignment.createdBy.avatarUrl}
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
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {assignment?.createdBy?.fullName}
                        </Typography>
                        {assignment?.createdBy?.department && (
                          <Typography variant="caption" color="text.secondary">
                            {assignment?.createdBy?.department}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
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
