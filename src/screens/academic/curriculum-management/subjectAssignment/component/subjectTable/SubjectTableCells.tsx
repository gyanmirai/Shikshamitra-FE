import CustomTooltip from 'src/components/custom-tooltip';
import { Box, ButtonBase, Typography, LinearProgress } from '@mui/material';

import { getPrimaryTeacherNames } from '../../utils/primaryTeacherNames';

import type { ISubjectFormValues } from '../type';

function healthColor(score: number) {
  if (score >= 90) return 'success.main';
  if (score >= 70) return 'info.main';
  if (score >= 40) return 'warning.main';
  return 'error.main';
}

function getSetupHealthIssues(row: ISubjectFormValues): string[] {
  const issues: string[] = [];
  if (!getPrimaryTeacherNames(row).length) issues.push('Assign at least one teacher');
  if ((row.chaptersCount ?? 0) === 0) issues.push('Add at least 3 syllabus chapters');
  else if ((row.chaptersCount ?? 0) < 3) issues.push('Add more syllabus chapters (3 recommended)');
  if ((row.weeklyPeriods ?? 0) <= 0) issues.push('Set periods per week');
  return issues;
}

export function SetupHealthCell({ score, row }: { score?: number; row: ISubjectFormValues }) {
  const value = Math.max(0, Math.min(100, score ?? 0));
  const color = healthColor(value);
  const missingItems = getSetupHealthIssues(row);
  const tooltipTitle =
    value >= 100 ? (
      'Setup complete'
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography variant="caption" fontWeight={700}>
          Missing setup:
        </Typography>
        {missingItems.length ? (
          missingItems.map((item) => (
            <Typography key={item} variant="caption">
              • {item}
            </Typography>
          ))
        ) : (
          <Typography variant="caption">Complete the remaining setup fields</Typography>
        )}
      </Box>
    );

  return (
    <CustomTooltip title={tooltipTitle} arrow placement="top">
      <Box sx={{ minWidth: 80 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color }}>
          {value}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={value}
          color={value >= 90 ? 'success' : value >= 70 ? 'info' : value >= 40 ? 'warning' : 'error'}
          sx={{ height: 5, mt: 0.3, borderRadius: 3 }}
        />
      </Box>
    </CustomTooltip>
  );
}

export function PeriodsPerWeekButton({
  row,
  onClick,
}: {
  row: ISubjectFormValues;
  onClick: (row: ISubjectFormValues) => void;
}) {
  const label = row.electiveGroupName || row.subjects?.map((item) => item.subjectName).join(', ');

  return (
    <CustomTooltip title="View weekly lecture breakdown" arrow>
      <ButtonBase
        aria-label={`View weekly lecture breakdown for ${label || 'this subject'}`}
        onClick={() => onClick(row)}
        sx={{
          minWidth: 44,
          minHeight: 44,
          borderRadius: 1,
          color: 'primary.main',
          fontWeight: 700,
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          '&:hover': { bgcolor: 'action.hover' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        {row.weeklyPeriods ?? 0}
      </ButtonBase>
    </CustomTooltip>
  );
}
