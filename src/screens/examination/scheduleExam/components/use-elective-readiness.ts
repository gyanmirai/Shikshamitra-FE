import { useRef } from 'react';
import { useLazyGetStudentElectiveSelectionCountsQuery } from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

import { normalizeSubjectId } from './exam-subject-selection';

import type { ElectiveReadiness } from './exam-subject-selection';

type Scope = { academicMediumId?: string; classId: string; divisionIds: string[] };

export function useElectiveReadiness(scope: Scope) {
  const [loadCounts] = useLazyGetStudentElectiveSelectionCountsQuery();
  const pending = useRef(new Map<string, Promise<ElectiveReadiness>>());

  return async (groupIds: string[]): Promise<Record<string, ElectiveReadiness>> => {
    const { academicMediumId, classId, divisionIds } = scope;
    if (!academicMediumId || !classId || divisionIds.length === 0) {
      return Object.fromEntries(groupIds.map((id) => [id, {
        isReady: false, assignedCounts: {},
        message: 'Select class and division before selecting an elective group.',
      }]));
    }
    const context = JSON.stringify([academicMediumId, classId, divisionIds]);
    const key = (id: string) => `${context}:${id}`;
    const missing = [...new Set(groupIds)].filter((id) => !pending.current.has(key(id)));
    if (missing.length) {
      const request = loadCounts({ academicMediumId, classId, divisionIds, electiveGroupIds: missing }, true).unwrap();
      missing.forEach((id) => {
        const result = request.then((counts): ElectiveReadiness => ({
          isReady: true,
          assignedCounts: counts.filter((row) => normalizeSubjectId(row.electiveGroupId) === normalizeSubjectId(id))
            .reduce<Record<string, number>>((totals, row) => {
              const subjectId = normalizeSubjectId(row.subjectId);
              if (subjectId) totals[subjectId] = (totals[subjectId] ?? 0) + row.count;
              return totals;
            }, {}),
        })).catch((): ElectiveReadiness => ({
          isReady: false, assignedCounts: {},
          message: 'Unable to load elective subject assignments. Please try again.',
        }));
        pending.current.set(key(id), result);
        result.finally(() => { if (pending.current.get(key(id)) === result) pending.current.delete(key(id)); });
      });
    }
    return Object.fromEntries(await Promise.all(groupIds.map(async (id) => [id, await pending.current.get(key(id))!])));
  };
}
