import dayjs from 'dayjs';
import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { Box, Chip, Paper, Avatar, Typography, CircularProgress } from '@mui/material';
import { useGetChapterProgressLogsQuery } from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';

import type { ICourseDetail } from '../type';

interface ViewChapterLogsProps {
  onClose: (e: any, isSubmit: false) => void;
  selectedChapter: ICourseDetail | null;
  divisionId?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getChipColor(
  progress?: number
): 'default' | 'success' | 'info' | 'primary' | 'warning' | 'error' {
  if (progress === undefined || progress === null) return 'default';
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'primary';
  if (progress >= 25) return 'warning';
  return 'error';
}

const ViewChapterLogs = ({ onClose, selectedChapter, divisionId }: ViewChapterLogsProps) => {
  const chapterId = (selectedChapter as any)?.id || (selectedChapter as any)?.chapterId;

  const { data, isLoading, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChapterProgressLogsQuery,
    params: {
      chapterId: chapterId ?? '',
      divisionId,
    },
    options: {
      skip: !chapterId,
    },
  });

  const logs =
    data?.data?.items ??
    data?.data?.records ??
    data?.data ??
    data?.items ??
    data?.records ??
    (Array.isArray(data) ? data : []);

  if (isLoading || isFetching) {
    return (
      <Box
        sx={{ height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Box
        sx={{
          height: '550px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <Iconify icon="eva:clock-outline" width={48} sx={{ opacity: 0.4 }} />
        <Typography variant="body2">No progress logs found for this chapter.</Typography>
      </Box>
    );
  }

  return (
    <Scrollbar sx={{ height: '550px', px: 1, py: 2 }}>
      <Timeline
        position="right"
        sx={{
          p: 0,
          m: 0,
          [`& .MuiTimelineItem-root:before`]: { display: 'none' },
        }}
      >
        {logs.map((item: any, index: number) => {
          const rawTime = item.changedAt || item.time || item.createdAt || item.date || '';
          const parsed = dayjs(rawTime);
          const isValid = parsed.isValid();
          const dateStr = isValid ? parsed.format('DD MMM YYYY') : rawTime;
          const timeStr = isValid ? parsed.format('hh:mm A') : '';
          const teacherName =
            item.changedByName ||
            item.teacher ||
            item.teacherName ||
            item.changedBy ||
            item.updatedBy ||
            item.modifiedBy ||
            item.createdBy ||
            '';
          const initials = teacherName ? getInitials(teacherName) : '';
          const chipColor = getChipColor(item.progress);
          const dotColor = item.color ?? (item.progress >= 100 ? 'success' : 'primary');
          const isLast = index === logs.length - 1;

          return (
            <TimelineItem key={item.key ?? index}>
              {/* Left: date + time */}
              <TimelineOppositeContent
                sx={{ flex: '0 0 110px', textAlign: 'right', pr: 2, pt: 1.5 }}
              >
                <Typography variant="caption" fontWeight={700} display="block" color="text.primary">
                  {dateStr}
                </Typography>
                {timeStr && (
                  <Typography variant="caption" color="text.secondary">
                    {timeStr}
                  </Typography>
                )}
              </TimelineOppositeContent>

              {/* Dot + connector */}
              <TimelineSeparator>
                <TimelineDot
                  color={dotColor as any}
                  sx={{ my: 1.5, boxShadow: 'none', width: 14, height: 14 }}
                />
                {!isLast && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
              </TimelineSeparator>

              {/* Right: card */}
              <TimelineContent sx={{ pb: 3, pl: 2, pr: 0, pt: 0.5 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                >
                  {/* Progress chip */}
                  {item.progress !== undefined && item.progress !== null && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={item.progress >= 100 ? 'Completed' : `${item.progress}% Completed`}
                        color={chipColor}
                        size="small"
                        variant="soft"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </Box>
                  )}

                  {/* Description */}
                  {item.des && (
                    <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                      {item.des}
                    </Typography>
                  )}

                  {/* Footer: changed-by left, timestamp right */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    {teacherName && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: 'success.main',
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {teacherName}
                        </Typography>
                      </Box>
                    )}
                    {(dateStr || timeStr) && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary',
                        }}
                      >
                        <Iconify icon="solar:calendar-date-bold-duotone" width={16} />
                        <Typography variant="caption" fontWeight={500}>
                          {[dateStr, timeStr].filter(Boolean).join(' • ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Scrollbar>
  );
};

export default ViewChapterLogs;
