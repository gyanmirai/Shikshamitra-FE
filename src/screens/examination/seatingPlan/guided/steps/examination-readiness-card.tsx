import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CustomTooltip from 'src/components/custom-tooltip';

import type { GuidedStepProps } from '../types';

const PLANNING_GUIDANCE_CODES = ['NO_SEATING_PLANS', 'UNPLANNED_SUBJECTS'];

export function ExaminationReadinessCard({
  workflow,
  onReset,
}: {
  workflow: GuidedStepProps['workflow'];
  onReset?: () => void;
}) {
  const { readiness } = workflow;
  const coverage = readiness.totalSubjectCount
    ? Math.round((readiness.plannedSubjectCount / readiness.totalSubjectCount) * 100)
    : 0;
  const ready = readiness.isPublished || readiness.isReadyToPublish;
  const helpText = [
    'The bar shows subject planning progress. The examination is ready only when all subjects have a plan, every plan is ready, and all required seat assignments are saved. Reset draft seating removes all draft plans and their assignments.',
    ...readiness.blockers
      .filter((issue) => PLANNING_GUIDANCE_CODES.includes(issue.code))
      .map((issue) => issue.message),
  ].join(' ');

  return (
    <Card component="section" variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography component="h2" variant="subtitle2">
              Examination readiness
            </Typography>
            <CustomTooltip title={helpText} arrow placement="right">
              <IconButton
                aria-label="Examination readiness information"
                size="small"
                color="info"
                sx={{ p: 0.25 }}
              >
                <Iconify icon="lucide:info" width={16} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Chip
            size="small"
            variant="soft"
            color={ready ? 'success' : 'default'}
            label={readiness.isPublished ? 'Published' : ready ? 'Ready' : 'Draft'}
          />
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            variant="outlined"
            label={`Subjects ${readiness.plannedSubjectCount}/${readiness.totalSubjectCount}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Plans ready ${readiness.readyPlanCount}/${readiness.totalPlanCount}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Saved assignments ${readiness.allocatedStudentSeats}/${readiness.totalStudentSeats}`}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={coverage}
          color={ready ? 'success' : 'primary'}
          aria-label={`${coverage}% of subjects planned`}
        />
        {readiness.blockers
          .filter((issue) => !PLANNING_GUIDANCE_CODES.includes(issue.code))
          .map((issue) => (
            <Alert key={`${issue.code}-${issue.seatingPlanId ?? ''}`} severity="warning">
              {issue.message}
            </Alert>
          ))}
        {onReset && readiness.canResetDraft && (
          <Button
            color="error"
            size="small"
            variant="text"
            disabled={!workflow.permissions.canDelete || workflow.isBusy}
            onClick={onReset}
            sx={{ alignSelf: 'flex-start' }}
          >
            Reset draft seating
          </Button>
        )}
      </Stack>
    </Card>
  );
}
