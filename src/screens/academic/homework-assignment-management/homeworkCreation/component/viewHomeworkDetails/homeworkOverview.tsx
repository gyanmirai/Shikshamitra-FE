import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubmissionType } from 'src/enums/submission_type';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import { Box, Grid, Card, Badge, Avatar, Divider, Typography, CardContent } from '@mui/material';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';
import TeacherHoverProfile from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/TeacherHoverProfile';

import type { IHomework } from '../../type';

const HomeworkOverview = ({ homework }: { homework: IHomework }) => {
  const { createdAt } = homework as any;
  const publishDate =
    homework?.divisionMeta?.publishDate ||
    (homework?.divisionMeta as any)?.publishAt ||
    (homework as any).divisionSchedules?.[0]?.publishAt;
  const dueDate =
    homework?.divisionMeta?.dueDate ||
    (homework?.divisionMeta as any)?.dueAt ||
    (homework as any).divisionSchedules?.[0]?.dueAt;

  const formatDate = (date: any) => (date ? dayjs(date).format('DD MMM YYYY') : 'N/A');
  const formatTime = (date: any) => (date ? dayjs(date).format('hh:mm A') : '');

  const timelineItems = [
    { label: 'Created', date: createdAt, color: 'text.disabled', variant: 'outlined' as const },
    { label: 'Published', date: publishDate, color: 'success.main', variant: 'filled' as const },
    { label: 'Due', date: dueDate, color: 'warning.main', variant: 'filled' as const },
  ];

  return (
    <Box sx={{ height: '100%', m: 1 }}>
      <Grid container spacing={1}>
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
                  {homework?.title}
                </Typography>
                <Label
                  variant="soft"
                  color={
                    PublishUnpublishStatusTypeColors[
                      homework?.status as PublishUnpublishStatusType
                    ] as LabelColor
                  }
                >
                  {
                    PublishUnpublishStatusType[
                      homework?.status as PublishUnpublishStatusType
                    ] as string
                  }
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
                      dangerouslySetInnerHTML={{ __html: homework?.description || '' }}
                    />
                  </Scrollbar>
                </Box>
              </Box>

              {/* Type & Submit Via chips */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 6,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Iconify
                    icon="mdi:notebook-edit"
                    sx={{ color: 'text.secondary', width: 16, height: 16 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(homework as any).homeworkTypeName || homework.homeworkType || 'N/A'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 6,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Iconify
                    icon={GlobalIcons.submit}
                    sx={{ color: 'text.secondary', width: 16, height: 16 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {SubmissionType[homework?.submissionType]}
                  </Typography>
                </Box>
              </Box>

              {/* Document */}
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', letterSpacing: 1.5, display: 'block', mb: 1 }}
                >
                  Document
                </Typography>
                {(() => {
                  const singleAttachment = (homework as any).attachment;
                  const attachmentsArray = (homework as any).attachments;

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
                        left: 7,
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
                  {typeof homework?.createdBy === 'string' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {(homework.createdBy as unknown as string)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {homework.createdBy as unknown as string}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                                  border: '2px solid',
                                  borderColor: 'background.paper',
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
                              src={homework.createdBy.avatarUrl}
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
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {homework?.createdBy?.fullName}
                        </Typography>
                        {homework?.createdBy?.department && (
                          <Typography variant="caption" color="text.secondary">
                            {homework?.createdBy?.department}
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

export default HomeworkOverview;
