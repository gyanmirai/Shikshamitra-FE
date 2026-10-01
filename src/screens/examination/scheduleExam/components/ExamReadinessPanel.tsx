import { Box, Chip, Stack, Paper, Button, Divider, Typography } from '@mui/material';

import { ExamReviewAccordion } from './ExamReviewAccordion';
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
    <ExamReviewAccordion
      title="Readiness check"
      icon={
        readiness.isReady
          ? 'solar:verified-check-bold-duotone'
          : 'solar:danger-triangle-bold-duotone'
      }
      status={
        <Chip
          size="small"
          label={readiness.isReady ? 'Ready' : `${readiness.blocking.length} blocking`}
          color={readiness.isReady ? 'success' : 'warning'}
          variant="soft"
        />
      }
    >
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {issues.length > 0 ? (
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {issues.map((issue) => (
              <Box
                key={issue.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
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
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onEditStep(issue.step)}
                    sx={{ ml: 'auto', flexShrink: 0 }}
                  >
                    Fix
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            All required details are complete.
          </Typography>
        )}
      </Paper>
    </ExamReviewAccordion>
  );
};

export default ExamReadinessPanel;
