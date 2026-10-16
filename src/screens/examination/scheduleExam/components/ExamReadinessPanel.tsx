import { Box, Chip, Stack, Button, Divider, Typography } from '@mui/material';

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
          sx={(theme) => ({
            color: readiness.isReady ? 'success.darker' : 'warning.darker',
            ...theme.applyStyles('dark', {
              color: readiness.isReady ? 'success.light' : 'warning.light',
            }),
          })}
        />
      }
    >
      {issues.length > 0 ? (
        <Stack spacing={2} divider={<Divider flexItem />}>
          {issues.map((issue) => (
            <Box
              key={issue.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'auto minmax(0, 1fr) auto' },
                alignItems: 'start',
                columnGap: 1.5,
                rowGap: 1,
              }}
            >
              <Chip
                size="small"
                label={issue.severity === 'blocking' ? 'Blocker' : 'Warning'}
                color={issue.severity === 'blocking' ? 'error' : 'warning'}
                variant="soft"
                sx={(theme) => ({
                  justifySelf: 'start',
                  color: issue.severity === 'blocking' ? 'error.darker' : 'warning.darker',
                  ...theme.applyStyles('dark', {
                    color: issue.severity === 'blocking' ? 'error.light' : 'warning.light',
                  }),
                })}
              />
              <Box sx={{ minWidth: 0, gridColumn: { xs: 1, sm: 2 }, overflowWrap: 'anywhere' }}>
                <Typography variant="body2" fontWeight={700}>
                  {issue.title}
                </Typography>
                {issue.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {issue.description}
                  </Typography>
                )}
              </Box>
              {onEditStep && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onEditStep(issue.step)}
                  aria-label={`Fix: ${issue.title}`}
                  sx={{ gridColumn: { xs: 2, sm: 3 }, gridRow: 1 }}
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
    </ExamReviewAccordion>
  );
};

export default ExamReadinessPanel;
