'use client';

import { useMemo } from 'react';
import { Grid, Skeleton } from '@mui/material';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

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
  const healthColor = useMemo<'primary' | 'success' | 'warning' | 'error' | 'info'>(() => {
    if (!kpi) return 'success';
    const score = kpi.overallHealthScore;
    return score >= 90
      ? 'success'
      : score >= 70
        ? 'info'
        : score >= 40
          ? 'warning'
          : 'error';
  }, [kpi]);

  const cards = useMemo<ITimetableSummaryCard[]>(() => {
    if (!kpi) return [];
    return [
      {
        label: 'Total Subjects',
        value: kpi.totalSubjects,
        icon: 'solar:book-bookmark-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Teacher Mapping',
        value: `${kpi.subjectsWithTeacher}/${kpi.totalSubjects}`,
        icon: 'solar:user-bold-duotone',
        color: kpi.subjectsMissingTeacher > 0 ? 'warning' : 'success',
        onClick: onFilterMissingTeacher,
      },
      {
        label: 'Published',
        value: kpi.publishedSubjects,
        icon: 'solar:check-circle-bold-duotone',
        color: 'success',
        onClick: onFilterPublished,
      },
      {
        label: 'Draft',
        value: kpi.draftSubjects,
        icon: 'solar:document-bold-duotone',
        color: 'info',
        onClick: onFilterDraft,
      },
      {
        label: 'Setup Health',
        value: `${kpi.overallHealthScore}%`,
        icon: 'solar:graph-bold-duotone',
        color: healthColor,
      },
    ];
  }, [kpi, healthColor, onFilterMissingTeacher, onFilterDraft, onFilterPublished]);

  if (isLoading) {
    return (
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Skeleton variant="rounded" height={68} sx={{ borderRadius: 1.5 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!kpi) return null;

  return <TimetableSettingsSummaryCards cards={cards} />;
}
