'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Tooltip, Skeleton, Typography } from '@mui/material';

export interface SubjectKpiData {
  totalSubjects: number;
  coreSubjects: number;
  electiveSubjects: number;
  optionalSubjects: number;
  subjectsWithTeacher: number;
  subjectsMissingTeacher: number;
  publishedSubjects: number;
  draftSubjects: number;
  overallHealthScore: number;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: string;
  color: string;
  tooltip?: string;
  onClick?: () => void;
}

function KpiCard({ title, value, subValue, icon, color, tooltip, onClick }: KpiCardProps) {
  const theme = useTheme();
  return (
    <Tooltip title={tooltip ?? ''} arrow placement="top">
      <Card
        onClick={onClick}
        sx={{
          p: 2,
          flex: 1,
          minWidth: 130,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: onClick ? 'pointer' : 'default',
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: 'var(--shadows-2)',
          transition: 'box-shadow 0.2s, transform 0.15s',
          '&:hover': onClick
            ? { boxShadow: 'var(--shadows-8)', transform: 'translateY(-1px)' }
            : undefined,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} sx={{ color, width: 22, height: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
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

function HealthBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  const label =
    score >= 90
      ? 'Ready'
      : score >= 70
        ? 'Almost Ready'
        : score >= 40
          ? 'Needs Setup'
          : 'Incomplete';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h6" fontWeight={700} lineHeight={1.2} sx={{ color }}>
        {score}%
      </Typography>
      <Typography variant="caption" sx={{ color }}>
        {label}
      </Typography>
    </Box>
  );
}

interface SubjectKpiCardsProps {
  kpi?: SubjectKpiData;
  isLoading?: boolean;
  onFilterMissingTeacher?: () => void;
  onFilterDraft?: () => void;
  onFilterPublished?: () => void;
}

export default function SubjectKpiCards({
  kpi,
  isLoading,
  onFilterMissingTeacher,
  onFilterDraft,
  onFilterPublished,
}: SubjectKpiCardsProps) {
  const theme = useTheme();

  const cards = useMemo<KpiCardProps[]>(() => {
    if (!kpi) return [];
    return [
      {
        title: 'Total Subjects',
        value: kpi.totalSubjects,
        subValue: `${kpi.coreSubjects} core · ${kpi.electiveSubjects} elective`,
        icon: 'solar:book-bold-duotone',
        color: theme.vars.palette.primary.main,
        tooltip: 'Total subjects allocated for this class',
      },
      {
        title: 'Teacher Mapping',
        value: `${kpi.subjectsWithTeacher}/${kpi.totalSubjects}`,
        subValue:
          kpi.subjectsMissingTeacher > 0 ? `${kpi.subjectsMissingTeacher} missing` : 'All assigned',
        icon: 'solar:user-bold-duotone',
        color:
          kpi.subjectsMissingTeacher > 0
            ? theme.vars.palette.warning.main
            : theme.vars.palette.success.main,
        tooltip: 'Click to filter subjects missing a primary teacher',
        onClick: onFilterMissingTeacher,
      },
      {
        title: 'Published',
        value: kpi.publishedSubjects,
        subValue: `${kpi.draftSubjects} draft`,
        icon: 'solar:check-circle-bold-duotone',
        color: theme.vars.palette.success.main,
        tooltip: 'Click to show published subjects',
        onClick: onFilterPublished,
      },
      {
        title: 'Draft',
        value: kpi.draftSubjects,
        subValue: 'Click to review',
        icon: 'solar:document-bold-duotone',
        color: theme.vars.palette.text.secondary,
        tooltip: 'Click to show draft subjects',
        onClick: onFilterDraft,
      },
    ];
  }, [kpi, theme, onFilterMissingTeacher, onFilterDraft, onFilterPublished]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={160} height={76} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (!kpi) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}

      {/* Health score card */}
      <Card
        sx={{
          p: 2,
          flex: 1,
          minWidth: 130,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: 'var(--shadows-2)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#6366f120',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify
            icon="solar:graph-bold-duotone"
            sx={{ color: '#6366f1', width: 22, height: 22 }}
          />
        </Box>
        <Box>
          <HealthBadge score={kpi.overallHealthScore} />
          <Typography variant="caption" color="text.secondary" noWrap>
            Setup Health
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
