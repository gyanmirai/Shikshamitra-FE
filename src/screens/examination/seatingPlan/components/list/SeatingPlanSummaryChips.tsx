import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';

import { SEATING_PLAN_SUMMARIES } from './seating-plan-summary-config';

import type { SeatingPlanListRow } from '../../types';

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  activeFilter?: string | null;
  onFilterClick?: (key: string) => void;
}

export default function SeatingPlanSummaryChips({
  rows,
  isLoading,
  activeFilter,
  onFilterClick,
}: Props) {
  return (
    <Stack
      direction="row"
      spacing={1}
      aria-label="Filter seating plans by status"
      sx={{
        display: { xs: 'flex', sm: 'none' },
        mb: 1.5,
        overflowX: 'auto',
        pb: 0.5,
        scrollbarWidth: 'thin',
      }}
    >
      {SEATING_PLAN_SUMMARIES.map((summary) => (
        <Button
          key={summary.key}
          size="small"
          variant={activeFilter === summary.key ? 'contained' : 'outlined'}
          aria-pressed={activeFilter === summary.key}
          disabled={isLoading}
          onClick={() => onFilterClick?.(summary.key)}
          sx={{ minHeight: 44, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {isLoading ? <Skeleton width={80} /> : `${summary.label} · ${summary.count(rows)}`}
        </Button>
      ))}
    </Stack>
  );
}
