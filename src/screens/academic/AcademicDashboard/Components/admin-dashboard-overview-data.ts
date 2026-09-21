import type {
  AdminAcademicDashboardTimetableData,
  AdminAcademicDashboardCurriculumData,
  AdminAcademicDashboardAssessmentData,
} from 'src/redux/academicAPI/academicDashboardApi';

import { academicPaths } from 'src/constants/academic-menu';

import type {
  AcademicActionItem,
  AcademicModuleHealthItem,
} from '../../components/command-center/types';

type OverviewData = {
  curriculum?: AdminAcademicDashboardCurriculumData;
  timetable?: AdminAcademicDashboardTimetableData;
  assessment?: AdminAcademicDashboardAssessmentData;
};

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

export const getActionQueue = ({ curriculum, timetable, assessment }: OverviewData) => {
  const insights = [
    ...(curriculum?.insights ?? []),
    ...(timetable?.insights ?? []),
    ...(assessment?.insights ?? []),
  ];

  return insights.map<AcademicActionItem>((insight, index) => ({
    id: `${insight.source}-${index}`,
    title: insight.title,
    summary: insight.summary,
    severity: insight.severity,
    source: insight.source,
    actionLabel: insight.actionLabel,
    actionHref: insight.actionHref,
  }));
};

export const getModuleHealth = ({
  curriculum,
  timetable,
  assessment,
}: OverviewData): AcademicModuleHealthItem[] => [
  ...(curriculum
    ? [
        {
          id: 'curriculum',
          module: 'Curriculum',
          status: `${curriculum.curriculumCompletion}% completion`,
          progress: curriculum.curriculumCompletion,
          tone: curriculum.curriculumCompletion >= 80 ? ('success' as const) : ('warning' as const),
          icon: 'mdi:book-open-page-variant-outline',
          href: academicPaths.curriculum.chaptersManagement,
        },
      ]
    : []),
  ...(timetable
    ? [
        {
          id: 'timetable',
          module: 'Timetable',
          status: `${timetable.activeTimetables} active | ${timetable.pendingTimetables} pending`,
          progress: timetable.timetableRate,
          tone: timetable.conflictsCount > 0 ? ('error' as const) : ('warning' as const),
          icon: 'mdi:calendar-clock-outline',
          href: academicPaths.timetable.management,
        },
      ]
    : []),
  ...(assessment
    ? [
        {
          id: 'homework',
          module: 'Homework Evaluation',
          status: `${formatCount(assessment.pendingEvaluations)} pending`,
          progress: Math.max(0, 100 - assessment.pendingEvaluations),
          tone: assessment.pendingEvaluations > 20 ? ('warning' as const) : ('success' as const),
          icon: 'mdi:clipboard-check-outline',
          href: academicPaths.homework.assessment,
        },
        {
          id: 'examination',
          module: 'Examination',
          status: `${formatCount(assessment.pendingGradeEntries)} grade entries pending`,
          progress: assessment.readinessRate,
          tone: assessment.pendingGradeEntries > 0 ? ('warning' as const) : ('success' as const),
          icon: 'mdi:file-document-edit-outline',
          href: academicPaths.examination.recordMarks,
        },
      ]
    : []),
];
