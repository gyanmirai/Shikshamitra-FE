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


export function SuccessDetailTabs({ data, activeTab, isLoading }: SuccessDetailTabsProps) {
  if (activeTab === 'attendance') {
    const history = data?.attendance?.recentHistory || [];
    return (
      <Stack spacing={1}>
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
    return <AcademicInsightSections learningTasks={data?.learningTasks} showExams={false} />;
  }

  if (activeTab === 'exams') {
    return <AcademicInsightSections exams={data?.exams} showHomework={false} />;
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

  return (
    <Stack spacing={1}>
      <TimetableSnapshot timetable={data?.timetable} isLoading={isLoading} />
      <AcademicInsightSections
        learningTasks={data?.learningTasks}
        exams={data?.exams}
        alerts={data?.alerts}
      />
    </Stack>
  );
}
