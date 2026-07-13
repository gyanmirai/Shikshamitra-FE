import { Iconify } from 'src/components/iconify';
import { Box, Card, Chip, Stack, Button, Typography } from '@mui/material';

import { getReadinessSummary, buildExamPlanningIssues } from './scheduleExamPlanningUtils';

import type { IExamFormValues } from '../type';

type ExamReadinessPanelProps = {
  values: IExamFormValues;
  onEditStep?: (step: number) => void;
};

const ExamReadinessPanel = ({ values, onEditStep }: ExamReadinessPanelProps) => {
  const issues = buildExamPlanningIssues(values);
  const readiness = getReadinessSummary(issues);

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: readiness.isReady ? 'success.light' : 'warning.light',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: readiness.isReady ? 'success.lighter' : 'warning.lighter',
          color: readiness.isReady ? 'success.darker' : 'warning.darker',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify
            icon={
              readiness.isReady
                ? 'solar:verified-check-bold-duotone'
                : 'solar:danger-triangle-bold-duotone'
            }
            width={24}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              {readiness.isReady
                ? 'Exam ready for save'
                : `${readiness.blocking.length} blocking issue${readiness.blocking.length > 1 ? 's' : ''} before publish`}
            </Typography>
            <Typography variant="body2">
              {readiness.warnings.length
                ? `${readiness.warnings.length} warning${readiness.warnings.length > 1 ? 's' : ''} can be reviewed.`
                : 'No warnings found.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {issues.length > 0 && (
        <Stack spacing={1} sx={{ p: 2 }}>
          {issues.map((issue) => (
            <Box
              key={issue.id}
              sx={{
                p: 1.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Chip
                size="small"
                label={issue.severity === 'blocking' ? 'Blocker' : 'Warning'}
                color={issue.severity === 'blocking' ? 'error' : 'warning'}
                variant="soft"
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  {issue.title}
                </Typography>
                {issue.description && (
                  <Typography variant="caption" color="text.secondary">
                    {issue.description}
                  </Typography>
                )}
              </Box>
              {onEditStep && (
                <Button size="small" variant="text" onClick={() => onEditStep(issue.step)}>
                  Fix
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
};

export default ExamReadinessPanel;
