import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

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
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: readiness.isReady ? 'success.light' : 'warning.light',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" width={20} />}
        sx={{
          p: 2,
          bgcolor: (theme) =>
            alpha(
              readiness.isReady ? theme.palette.success.main : theme.palette.warning.main,
              theme.palette.mode === 'dark' ? 0.14 : 0.08
            ),
          color: (theme) =>
            theme.palette.mode === 'dark'
              ? readiness.isReady
                ? 'success.light'
                : 'warning.light'
              : readiness.isReady
                ? 'success.darker'
                : 'warning.darker',
          '& .MuiAccordionSummary-content': {
            my: 0,
            alignItems: 'center',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
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
      </AccordionSummary>

      <AccordionDetails sx={{ p: issues.length > 0 ? 2 : 1.5 }}>
        {issues.length > 0 ? (
          <Stack spacing={1}>
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
                  <Button
                    size="small"
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStep(issue.step);
                    }}
                  >
                    Fix
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            All exam details and requirements are validated. Ready for save.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ExamReadinessPanel;
