import { AcademicDesignChart } from './academic-design-chart';
import { AcademicDesignCounts } from './academic-design-counts';
import { AcademicDesignMapping } from './academic-design-mapping';
import { AcademicDesignRecords } from './academic-design-records';
import { getDesignChartData } from './academic-design-chart-data';
import { AcademicDesignSettings } from './academic-design-settings';
import { AcademicDesignSyllabus } from './academic-design-syllabus';
import { AcademicDesignTimetable } from './academic-design-timetable';
import { hasVisualizationData } from '../insights/components/visualization-data';
import { AcademicPeriodHeatmap } from '../insights/components/academic-period-heatmap';
import { AcademicInsightEmptyState } from '../insights/components/academic-insight-empty-state';
import { AcademicStudentVisualization } from '../insights/components/academic-student-visualization';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

export function AcademicDesignVisualization({ entry }: { entry: AcademicInsightsDisplayArea }) {
  const { section } = entry;
  if (section.status !== 'ready' || !hasVisualizationData(section)) return <AcademicInsightEmptyState section={section} />;
  switch (section.key) {
    case 'classrooms': return <AcademicDesignMapping section={section} />;
    case 'curriculum': return <AcademicDesignSyllabus section={section} />;
    case 'timetable': return section.metrics.some((metric) => metric.key === 'timetables')
      ? <AcademicDesignTimetable section={section} /> : <AcademicPeriodHeatmap section={section} />;
    case 'student360': return getDesignChartData(section).scatter
      ? <AcademicDesignChart section={section} /> : <AcademicStudentVisualization section={section} />;
    case 'lesson':
    case 'exams':
    case 'reports': return <AcademicDesignCounts section={section} />;
    case 'calendar':
    case 'audits':
    case 'notifications': return <AcademicDesignRecords section={section} />;
    case 'settings': return <AcademicDesignSettings entry={entry} />;
    default: return <AcademicDesignChart section={section} />;
  }
}
