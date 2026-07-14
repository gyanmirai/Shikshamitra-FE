'use client';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Tooltip, Typography } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: string;
  color: string;
  tooltip?: string;
  onClick?: () => void;
  active?: boolean;
}

function SummaryCard({ title, value, subValue, icon, color, tooltip, onClick, active }: SummaryCardProps) {
  const theme = useTheme();
  return (
    <Tooltip title={tooltip ?? ''} arrow placement="top">
      <Card
        onClick={onClick}
        sx={{
          p: 1.5,
          flex: 1,
          minWidth: 130,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          cursor: onClick ? 'pointer' : 'default',
          border: `1px solid ${active ? color : theme.vars.palette.divider}`,
          boxShadow: active ? `0 0 0 1px ${color} inset` : 'var(--shadows-2)',
          transition: 'box-shadow 0.2s, transform 0.15s',
          '&:hover': onClick
            ? { boxShadow: 'var(--shadows-8)', transform: 'translateY(-1px)' }
            : undefined,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} sx={{ color, width: 20, height: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {title}
          </Typography>
          {subValue && (
            <Typography variant="caption" display="block" color="text.disabled" noWrap>
              {subValue}
            </Typography>
          )}
        </Box>
      </Card>
    </Tooltip>
  );
}

interface AssignmentProgressSummaryProps {
  total: number;
  assigned: number;
  unassigned: number;
  issues: number;
  preferenceMatchPct: number | null;
  activeFilter: 'all' | 'assigned' | 'unassigned' | 'preferenceMismatch';
  onFilterAssigned: () => void;
  onFilterUnassigned: () => void;
  onFilterPreferenceMismatch: () => void;
  onOpenIssues: () => void;
}

export default function AssignmentProgressSummary({
  total,
  assigned,
  unassigned,
  issues,
  preferenceMatchPct,
  activeFilter,
  onFilterAssigned,
  onFilterUnassigned,
  onFilterPreferenceMismatch,
  onOpenIssues,
}: AssignmentProgressSummaryProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 1.25, mb: 1.5, flexWrap: 'wrap' }}>
      <SummaryCard
        title="Total Students"
        value={total}
        icon="solar:users-group-rounded-bold-duotone"
        color={theme.vars.palette.primary.main}
      />
      <SummaryCard
        title="Assigned"
        value={assigned}
        icon="solar:check-circle-bold-duotone"
        color={theme.vars.palette.success.main}
        tooltip="Click to show only assigned students"
        onClick={onFilterAssigned}
        active={activeFilter === 'assigned'}
      />
      <SummaryCard
        title="Unassigned"
        value={unassigned}
        icon="solar:close-circle-bold-duotone"
        color={unassigned > 0 ? theme.vars.palette.error.main : theme.vars.palette.text.secondary}
        tooltip="Click to show only unassigned students"
        onClick={onFilterUnassigned}
        active={activeFilter === 'unassigned'}
      />
      <SummaryCard
        title="Issues"
        value={issues}
        icon="solar:danger-triangle-bold-duotone"
        color={issues > 0 ? theme.vars.palette.warning.main : theme.vars.palette.text.secondary}
        tooltip="Click to open validation issues"
        onClick={onOpenIssues}
      />
      <SummaryCard
        title="Preference Match"
        value={preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`}
        subValue={preferenceMatchPct === null ? 'No preferences submitted' : undefined}
        icon="solar:star-bold-duotone"
        color={theme.vars.palette.info.main}
        tooltip="Click to show preference mismatches"
        onClick={onFilterPreferenceMismatch}
        active={activeFilter === 'preferenceMismatch'}
      />
      <SummaryCard
        title="Capacity Used"
        value={`${assigned}/${total}`}
        icon="solar:pie-chart-2-bold-duotone"
        color={theme.vars.palette.secondary.main}
      />
    </Box>
  );
}
