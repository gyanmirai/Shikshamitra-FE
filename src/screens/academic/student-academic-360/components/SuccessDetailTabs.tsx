'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Table, TableRow, TableBody, TableCell, TableHead, Typography, LinearProgress } from '@mui/material';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineOppositeContent,
} from '@mui/lab';

import { TimetableSnapshot } from './TimetableSnapshot';
import { AttendanceSnapshot } from './AttendanceSnapshot';
import { Academic360EmptyState } from './Academic360EmptyState';
import { AcademicInsightSections } from './AcademicInsightSections';

import type { Academic360Response } from '../types';

type SuccessDetailTabsProps = {
  data?: Academic360Response;
  activeTab: string;
  isLoading: boolean;
};

const timelineDotColor = (type?: string) => {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('alert') || normalized.includes('concern')) return 'error';
  if (normalized.includes('exam') || normalized.includes('result')) return 'warning';
  if (normalized.includes('achievement') || normalized.includes('award')) return 'success';
  if (normalized.includes('attendance')) return 'info';
  return 'primary';
};

const interventionStatusColor = (status?: string) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('resolved')) return 'success';
  if (normalized.includes('progress') || normalized.includes('active')) return 'info';
  if (normalized.includes('overdue') || normalized.includes('risk')) return 'error';
  return 'default';
};

export function SuccessDetailTabs({ data, activeTab, isLoading }: SuccessDetailTabsProps) {
  if (activeTab === 'attendance') {
    const history = data?.attendance?.recentHistory || [];
    return (
      <Stack spacing={2}>
        <AttendanceSnapshot attendance={data?.attendance} isLoading={isLoading} />
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Recent Attendance History</Typography>
          {history.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.slice(0, 12).map((row) => (
                    <TableRow key={`${row.attendanceDayId}-${row.date}`} hover>
                      <TableCell>{String(row.date || '-')}</TableCell>
                      <TableCell><Chip size="small" variant="soft" label={String(row.status || '-')} /></TableCell>
                      <TableCell>{String(row.remarks || '-')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Academic360EmptyState
              icon="mdi:table-off"
              color="info"
              title="No attendance history to show"
              description="Day-by-day attendance records for the selected period will be listed here once they're available."
              compact
            />
          )}
        </Card>
      </Stack>
    );
  }

  if (activeTab === 'learning') {
    return <AcademicInsightSections learningTasks={data?.learningTasks} subjectPerformance={data?.subjectPerformance} />;
  }

  if (activeTab === 'exams') {
    return <AcademicInsightSections exams={data?.exams} subjectPerformance={data?.subjectPerformance} />;
  }

  if (activeTab === 'timeline') {
    const events = data?.timeline || [];
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Academic Timeline</Typography>
        {events.length > 0 ? (
          <Timeline
            sx={{
              m: 0,
              p: 0,
              [`& .MuiTimelineItem-root:before`]: { flex: 0, padding: 0 },
            }}
          >
            {events.map((event, index) => (
              <TimelineItem key={`${event.type}-${event.title}-${event.date}`}>
                <TimelineOppositeContent sx={{ flex: 0.2, minWidth: 90, py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{event.date}</Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={timelineDotColor(event.type)} variant="outlined" />
                  {index < events.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" variant="soft" color={timelineDotColor(event.type)} label={event.type || 'Event'} />
                    <Typography variant="subtitle2">{event.title}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Academic360EmptyState
            icon="mdi:timeline-clock-outline"
            color="info"
            title="No timeline events yet"
            description="Key academic moments for this student — exams, alerts, achievements — will be plotted here as they happen."
          />
        )}
      </Card>
    );
  }

  if (activeTab === 'interventions') {
    const interventions = data?.interventions || [];
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Interventions & Support Plans</Typography>
        {interventions.length > 0 ? (
          <Stack spacing={1.5}>
            {interventions.map((item) => (
              <Box key={item.id || item.concern} sx={{ p: 1.75, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} flexWrap="wrap">
                  <Box>
                    <Typography variant="subtitle2">{item.concern}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.goal}</Typography>
                  </Box>
                  <Chip size="small" variant="soft" color={interventionStatusColor(item.status)} label={item.status || 'Not Started'} />
                </Stack>
                {typeof item.progress === 'number' && (
                  <Box sx={{ mt: 1.25 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Progress</Typography>
                      <Typography variant="caption" color="text.secondary">{item.progress}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.progress} sx={{ mt: 0.5, height: 6, borderRadius: 1 }} />
                  </Box>
                )}
                {(item.owner || item.reviewDate) && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1.25 }} flexWrap="wrap">
                    {item.owner && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify icon="mdi:account-outline" width={14} sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{item.owner}</Typography>
                      </Stack>
                    )}
                    {item.reviewDate && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify icon="mdi:calendar-clock-outline" width={14} sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">Next review: {item.reviewDate}</Typography>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Academic360EmptyState
            icon="mdi:hand-heart-outline"
            color="success"
            title="No active intervention plan"
            description="Create an intervention when repeated evidence — like falling attendance or exam scores — shows the student needs structured academic support."
          />
        )}
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      <TimetableSnapshot timetable={data?.timetable} isLoading={isLoading} />
      <AcademicInsightSections
        learningTasks={data?.learningTasks}
        exams={data?.exams}
        subjectPerformance={data?.subjectPerformance}
        alerts={data?.alerts}
      />
    </Stack>
  );
}
