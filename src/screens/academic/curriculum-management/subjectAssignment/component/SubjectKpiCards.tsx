'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

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
  open: boolean;
  onClose: () => void;
  onFilterMissingTeacher?: () => void;
  onFilterDraft?: () => void;
  onFilterPublished?: () => void;
}

export default function SubjectKpiCards({
  kpi,
  isLoading = false,
  open,
  onClose,
  onFilterMissingTeacher,
  onFilterDraft,
  onFilterPublished,
}: SubjectKpiCardsProps) {
  const total = kpi?.totalSubjects ?? 0;
  const teacherCoverage =
    total > 0 ? Math.round(((kpi?.subjectsWithTeacher ?? 0) / total) * 100) : 0;
  const publishedCoverage =
    total > 0 ? Math.round(((kpi?.publishedSubjects ?? 0) / total) * 100) : 0;

  const metrics: AcademicInsightMetric[] = [
    {
      id: 'total',
      label: 'Total subjects',
      value: total,
      helper: `${kpi?.coreSubjects ?? 0} core · ${kpi?.electiveSubjects ?? 0} elective`,
      icon: 'solar:book-bookmark-outline',
    },
    {
      id: 'teacher-mapping',
      label: 'Teacher mapping',
      value: `${kpi?.subjectsWithTeacher ?? 0}/${total}`,
      helper: `${kpi?.subjectsMissingTeacher ?? 0} still need a teacher`,
      icon: 'solar:user-check-outline',
      onClick: onFilterMissingTeacher,
    },
    {
      id: 'published',
      label: 'Published',
      value: kpi?.publishedSubjects ?? 0,
      helper: `${publishedCoverage}% of subjects`,
      icon: 'solar:check-circle-outline',
      onClick: onFilterPublished,
    },
    {
      id: 'draft',
      label: 'Draft',
      value: kpi?.draftSubjects ?? 0,
      helper: 'Awaiting publication',
      icon: 'solar:document-text-outline',
      onClick: onFilterDraft,
    },
    {
      id: 'health',
      label: 'Setup health',
      value: `${kpi?.overallHealthScore ?? 0}%`,
      helper: 'Overall configuration readiness',
      icon: 'solar:pulse-outline',
    },
  ];

  const attentionCount = (kpi?.subjectsMissingTeacher ?? 0) + (kpi?.draftSubjects ?? 0);

  return (
    <AcademicInsights
      title="Subject allocation insights"
      description="A focused view of subject readiness, ownership and publishing progress for the selected class."
      metrics={metrics}
      isLoading={isLoading}
      open={open}
      onClose={onClose}
      hideTrigger
      chart={{
        title: 'Setup readiness',
        description: 'Coverage across the three steps required for a healthy subject setup.',
        categories: ['Teacher mapping', 'Published', 'Overall health'],
        values: [teacherCoverage, publishedCoverage, kpi?.overallHealthScore ?? 0],
        seriesName: 'Readiness',
        valueSuffix: '%',
        max: 100,
      }}
      focus={{
        title:
          attentionCount > 0 ? `${attentionCount} setup items need attention` : 'Setup is ready',
        description:
          attentionCount > 0
            ? 'Complete missing teacher mappings and publish remaining drafts to improve setup health.'
            : 'Every subject is mapped and published. Review periodically when staffing or curriculum changes.',
      }}
    />
  );
}
