import { useMemo } from 'react';

import type { SubjectUsageData, SubjectDependencyMetric } from '../subjectUsage.types';

const normalizeItemName = (item: unknown): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item !== 'object') return String(item);

  const record = item as Record<string, unknown>;
  const label = [
    record.standard,
    record.className,
    record.standardName,
    record.class,
    record.name,
    record.groupName,
    record.electiveGroupName,
    record.title,
  ].find((value) => typeof value === 'string' && value.trim());
  const codeValue = record.code || record.subjectCode;
  const code = typeof codeValue === 'string' && codeValue.trim() ? ` (${codeValue})` : '';

  if (label) return `${label}${code}`;
  return code.replace(/[()]/g, '').trim();
};

const normalizeLabels = (items: unknown[]): string[] =>
  items.map(normalizeItemName).filter((label) => Boolean(label.trim()));

export function useSubjectUsageViewModel(usageData?: SubjectUsageData | null) {
  const usage = usageData?.usage;

  /**
   * Memoization Justification:
   * - Dependency arrays can contain many allocation records that require normalization.
   * - The stable labels avoid repeating that work when only dialog presentation state changes.
   */
  const allocationLabels = useMemo(
    () =>
      normalizeLabels(
        usage?.subjectAllocations || usageData?.subjectAllocations || usage?.classes || []
      ),
    [usage?.subjectAllocations, usage?.classes, usageData?.subjectAllocations]
  );

  /**
   * Memoization Justification:
   * - Elective-group records require the same normalization and may be numerous.
   * - The stable labels prevent recomputation during expand and collapse interactions.
   */
  const electiveGroupLabels = useMemo(
    () => normalizeLabels(usage?.electiveGroups || usageData?.electiveGroups || []),
    [usage?.electiveGroups, usageData?.electiveGroups]
  );

  const counts = {
    allocations: allocationLabels.length,
    electives: electiveGroupLabels.length,
    chapters: usage?.chaptersCount ?? 0,
    timetablePeriods: usage?.timetablePeriodsCount ?? 0,
    examinations: usage?.examSchedulesCount ?? 0,
    lessonPlans: usage?.lessonPlansCount ?? 0,
    homework: usage?.homeworkCount ?? 0,
    teachers: usage?.teacherMappingsCount ?? 0,
  };

  const metrics: SubjectDependencyMetric[] = [
    { label: 'Class allocations', value: counts.allocations },
    { label: 'Elective groups', value: counts.electives },
    { label: 'Syllabus chapters', value: counts.chapters },
    { label: 'Timetable periods', value: counts.timetablePeriods },
    { label: 'Examinations', value: counts.examinations },
    { label: 'Lesson plans', value: counts.lessonPlans },
    { label: 'Homework records', value: counts.homework },
    { label: 'Assigned teachers', value: counts.teachers },
  ];
  const dependentModuleCount = metrics.filter((metric) => metric.value > 0).length;

  return {
    counts,
    metrics,
    allocationLabels,
    electiveGroupLabels,
    dependentModuleCount,
    isInUse: !usageData?.canDelete && dependentModuleCount > 0,
  };
}
