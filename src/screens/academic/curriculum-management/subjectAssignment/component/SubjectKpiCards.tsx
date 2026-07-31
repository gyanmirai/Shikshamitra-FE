'use client';

import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Skeleton, Typography } from '@mui/material';

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
  return (
    <CustomTooltip title={tooltip ?? ''} arrow placement="top">
      <Card
        onClick={onClick}
        sx={{
          p: 1.75,
          flex: 1,
          minWidth: 160,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(145, 158, 171, 0.08)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 104,
          '&:hover': {
            transform: onClick ? 'translateY(-2px)' : 'none',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 6px 16px rgba(0,0,0,0.5)'
                : '0 6px 16px rgba(145, 158, 171, 0.16)',
            borderColor: color,
          },
        }}
      >
        {/* Top Row: Title + Value on Left, Icon Avatar on Right */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                lineHeight: 1.2,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                mt: 0.5,
                color: 'text.primary',
                fontSize: '1.4rem',
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1,
              borderRadius: 1.25,
              bgcolor: alpha(color, 0.12),
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={22} height={22} />
          </Box>
        </Box>

        {/* Bottom Row: Subtitle microcopy with status dot */}
        {subValue && (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subValue}
            </Typography>
          </Stack>
        )}
      </Card>
    </CustomTooltip>
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

  const healthColor = useMemo(() => {
    if (!kpi) return '#22c55e';
    const score = kpi.overallHealthScore;
    return score >= 90 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
  }, [kpi]);

  const healthLabel = useMemo(() => {
    if (!kpi) return 'Ready';
    const score = kpi.overallHealthScore;
    return score >= 90
      ? 'Ready'
      : score >= 70
        ? 'Almost Ready'
        : score >= 40
          ? 'Needs Setup'
          : 'Incomplete';
  }, [kpi]);

  const cards = useMemo<KpiCardProps[]>(() => {
    if (!kpi) return [];
    return [
      {
        title: 'Total Subjects',
        value: kpi.totalSubjects,
        subValue: `${kpi.coreSubjects} core · ${kpi.electiveSubjects} elective`,
        icon: 'solar:book-bookmark-bold-duotone',
        color: theme.palette.primary.main,
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
            ? theme.palette.warning.main
            : theme.palette.success.main,
        tooltip: 'Click to filter subjects missing a primary teacher',
        onClick: onFilterMissingTeacher,
      },
      {
        title: 'Published',
        value: kpi.publishedSubjects,
        subValue: `${kpi.draftSubjects} draft`,
        icon: 'solar:check-circle-bold-duotone',
        color: theme.palette.success.main,
        tooltip: 'Click to show published subjects',
        onClick: onFilterPublished,
      },
      {
        title: 'Draft',
        value: kpi.draftSubjects,
        subValue: 'Click to review',
        icon: 'solar:document-bold-duotone',
        color: theme.palette.text.secondary,
        tooltip: 'Click to show draft subjects',
        onClick: onFilterDraft,
      },
    ];
  }, [kpi, theme, onFilterMissingTeacher, onFilterDraft, onFilterPublished]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={160} height={104} sx={{ borderRadius: 1.5 }} />
        ))}
      </Box>
    );
  }

  if (!kpi) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        mb: 2,
        gridTemplateColumns: {
          xs: '1fr 1fr',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(5, 1fr)',
        },
      }}
    >
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}

      {/* Setup Health Score Card */}
      <CustomTooltip title="Overall configuration readiness health score" arrow placement="top">
        <Card
          sx={{
            p: 1.75,
            flex: 1,
            minWidth: 160,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? alpha(t.palette.background.paper, 0.8)
                : 'background.paper',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(145, 158, 171, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 104,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: healthColor,
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 6px 16px rgba(0,0,0,0.5)'
                  : '0 6px 16px rgba(145, 158, 171, 0.16)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  lineHeight: 1.2,
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Setup Health
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mt: 0.5,
                  color: healthColor,
                  fontSize: '1.4rem',
                }}
              >
                {kpi.overallHealthScore}%
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1,
                borderRadius: 1.25,
                bgcolor: alpha(healthColor, 0.12),
                color: healthColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:graph-bold-duotone" width={22} height={22} />
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: healthColor,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: healthColor,
                fontSize: '0.7rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {healthLabel}
            </Typography>
          </Stack>
        </Card>
      </CustomTooltip>
    </Box>
  );
}
