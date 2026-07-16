'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Typography, LinearProgress } from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';

import type {
  Academic360Alert,
  Academic360ExamResult,
  Academic360LearningTasks,
  Academic360SubjectPerformance,
} from '../types';

type AcademicInsightSectionsProps = {
  learningTasks?: Academic360LearningTasks;
  exams?: Academic360ExamResult[];
  subjectPerformance?: Academic360SubjectPerformance[];
  alerts?: Academic360Alert[];
};

function SectionHeader({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => `${theme.palette.primary.main}14`,
          color: 'primary.main',
        }}
      >
        <Iconify icon={icon} width={19} />
      </Box>
      <Typography variant="subtitle1" sx={{ flex: 1 }}>{title}</Typography>
      {badge && <Chip size="small" variant="soft" label={badge} />}
    </Stack>
  );
}

export function AcademicInsightSections({
  learningTasks,
  exams = [],
  subjectPerformance = [],
  alerts = [],
}: AcademicInsightSectionsProps) {
  const submittedRatio =
    learningTasks?.totalAssigned && learningTasks.totalAssigned > 0
      ? Math.round(((learningTasks.submitted || 0) / learningTasks.totalAssigned) * 100)
      : 0;

  return (
    <Stack spacing={1}>
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <SectionHeader
            icon="mdi:clipboard-text-outline"
            title="Homework & Assignment"
            badge={`${learningTasks?.totalAssigned || 0} assigned`}
          />
          {learningTasks?.totalAssigned ? (
            <LinearProgress
              variant="determinate"
              value={submittedRatio}
              color={submittedRatio >= 80 ? 'success' : submittedRatio >= 50 ? 'warning' : 'error'}
              sx={{ height: 6, borderRadius: 1 }}
            />
          ) : null}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip size="small" color="success" variant="soft" label={`${learningTasks?.submitted || 0} submitted`} />
            <Chip size="small" color="warning" variant="soft" label={`${learningTasks?.pending || 0} pending`} />
            <Chip size="small" color="error" variant="soft" label={`${learningTasks?.late || 0} late`} />
            <Chip size="small" color="info" variant="soft" label={`${learningTasks?.pendingEvaluation || 0} evaluation`} />
          </Stack>
          {(learningTasks?.recentTasks || []).length > 0 ? (
            <Stack spacing={1}>
              {(learningTasks?.recentTasks || []).slice(0, 4).map((task) => (
                <Stack key={task.id} direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="body2" noWrap>{task.type}: {task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{task.subjectName} · {task.status}</Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:clipboard-check-outline"
              title="No homework assigned yet"
              description="Homework and assignments given to this student will be tracked here, along with submission status."
              compact
            />
          )}
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <SectionHeader icon="mdi:trophy-outline" title="Exams & Results" badge={`${exams.length} exams`} />
          {exams.length > 0 ? (
            <Stack spacing={1}>
              {exams.slice(0, 4).map((exam) => (
                <Stack key={exam.examId} direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography variant="body2" noWrap>{exam.examName}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {exam.percentage || 0}% {exam.grade ? `· ${exam.grade}` : ''}
                    </Typography>
                    <Chip size="small" variant="soft" label={exam.resultStatus || '-'} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:trophy-outline"
              color="warning"
              title="No exam results found yet"
              description="Results will appear here as soon as this student's exams are evaluated and published."
              compact
            />
          )}
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <SectionHeader icon="mdi:chart-line" title="Subject Performance" />
          {subjectPerformance.length > 0 ? (
            <Stack spacing={1}>
              {subjectPerformance.slice(0, 5).map((subject) => (
                <Box key={subject.subjectId || subject.subjectName}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{subject.subjectName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subject.averagePercentage || 0}% avg · {subject.examCount || 0} exams
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={subject.averagePercentage || 0}
                    sx={{ mt: 0.5, height: 5, borderRadius: 1 }}
                    color={
                      (subject.averagePercentage || 0) >= 75
                        ? 'success'
                        : (subject.averagePercentage || 0) >= 50
                          ? 'warning'
                          : 'error'
                    }
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:chart-line"
              color="info"
              title="No subject data yet"
              description="Subject-wise performance will appear here after marks are recorded across exams."
              compact
            />
          )}
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <SectionHeader icon="mdi:bell-alert-outline" title="Academic Alerts" />
          {alerts.length > 0 ? (
            <Stack spacing={1}>
              {alerts.map((alert) => (
                <Chip
                  key={`${alert.source}-${alert.title}`}
                  size="small"
                  color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                  variant="soft"
                  label={`${alert.title}: ${alert.message}`}
                  sx={{ justifyContent: 'flex-start', height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }}
                />
              ))}
            </Stack>
          ) : (
            <Academic360EmptyState
              icon="mdi:bell-check-outline"
              color="success"
              title="No academic alerts"
              description="This student has no active academic alerts. Anything worth flagging will show up here automatically."
              compact
            />
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
