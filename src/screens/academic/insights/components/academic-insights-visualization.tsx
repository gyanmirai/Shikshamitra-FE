'use client';

import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box } from '@mui/material';

import { hasVisualizationData } from './visualization-data';
import { AcademicSeriesChart } from './academic-series-chart';
import { AcademicCountProfile } from './academic-count-profile';
import { AcademicEventTimeline } from './academic-event-timeline';
import { AcademicMappingWaffle } from './academic-mapping-waffle';
import { AcademicPeriodHeatmap } from './academic-period-heatmap';
import { AcademicWeeklyTimetable } from './academic-weekly-timetable';
import { AcademicSettingsOverview } from './academic-settings-overview';
import { AcademicReadonlyCatalogue } from './academic-readonly-catalogue';
import { AcademicInsightEmptyState } from './academic-insight-empty-state';
import { AcademicProgressComparison } from './academic-progress-comparison';
import { AcademicStudentVisualization } from './academic-student-visualization';

import type { AcademicInsightsLink } from '../academic-insights-catalog';

export function AcademicInsightsVisualization({ section, links = [] }: {
  section: AcademicInsightsSection; links?: AcademicInsightsLink[];
}) {
  if (section.status !== 'ready' || !hasVisualizationData(section)) {
    return <AcademicInsightEmptyState section={section} />;
  }

  let visual;
  switch (section.key) {
    case 'student360':
      visual = <AcademicStudentVisualization section={section} />;
      break;
    case 'classrooms':
      visual = <AcademicMappingWaffle section={section} />;
      break;
    case 'calendar':
    case 'audits':
      visual = <AcademicEventTimeline section={section} />;
      break;
    case 'curriculum':
      visual = <AcademicProgressComparison section={section} />;
      break;
    case 'timetable':
      visual = section.metrics.some((metric) => metric.key === 'timetables')
        ? <AcademicWeeklyTimetable section={section} />
        : <AcademicPeriodHeatmap section={section} />;
      break;
    case 'exams':
    case 'reports':
      visual = <AcademicCountProfile section={section} />;
      break;
    case 'notifications':
      visual = <AcademicReadonlyCatalogue section={section} />;
      break;
    case 'settings':
      visual = <AcademicSettingsOverview section={section} links={links} />;
      break;
    default:
      visual = <AcademicSeriesChart section={section} />;
  }
  return <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{visual}</Box>;
}
