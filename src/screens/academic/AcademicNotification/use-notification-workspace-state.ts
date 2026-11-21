import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';

export const notificationCategories = [
  { value: 'all', label: 'All categories', families: [] },
  { value: 'curriculum', label: 'Curriculum', families: ['Subject', 'Syllabus', 'Elective', 'LessonPlan', 'Progress', 'ClassTeacher', 'Diary'] },
  { value: 'timetable', label: 'Timetable', families: ['Timetable', 'Room', 'Substitution'] },
  { value: 'learning', label: 'Homework and assignment', families: ['Homework', 'Assignment', 'Evaluation'] },
  { value: 'examinations', label: 'Examinations', families: ['Exam', 'ExamDuty', 'Seating', 'Marks', 'Result'] },
  { value: 'calendar', label: 'Calendar', families: ['Calendar'] },
  { value: 'operations', label: 'Student follow-up and reports', families: ['Student360', 'Report', 'Summary', 'Settings'] },
];

const legacyCategories: Record<string, string> = {
  curriculumManagement: 'curriculum',
  timetable: 'timetable',
  homeworkAssignment: 'learning',
  examination: 'examinations',
};

type WorkspaceFilterUpdates = Partial<Record<'category' | 'status' | 'scope' | 'search' | 'view' | 'templateEvent' | 'templateScope', string>>;

export const notificationRuleStatuses = [
  { value: 'all', label: 'All statuses' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'unconfigured', label: 'Unconfigured' },
];

export function useNotificationWorkspaceState() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const categoryValue = params.get('category') ?? legacyCategories[params.get('tab') ?? ''];
  const category = notificationCategories.find((entry) => entry.value === categoryValue) ?? notificationCategories[0];
  const status = notificationRuleStatuses.find((entry) => entry.value === params.get('status'))?.value ?? 'all';
  const search = params.get('search') ?? '';
  const requestedView = params.get('view');
  const view = requestedView === 'templates' || requestedView === 'history' ? requestedView : 'rules';

  function filtersHref(updates: WorkspaceFilterUpdates) {
    const next = new URLSearchParams(params.toString());
    if ('category' in updates) next.delete('tab');
    Object.entries(updates).forEach(([key, value]) => {
      if (value && !((key === 'category' || key === 'status') && value === 'all')) next.set(key, value);
      else next.delete(key);
    });
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function setFilters(updates: WorkspaceFilterUpdates) {
    const proceed = () => router.push(filtersHref(updates), { scroll: false });
    if (!guardAcademicContextChange(proceed)) proceed();
  }

  return {
    category, status, search, scopeKey: params.get('scope'), setFilters, filtersHref, view,
    templateEvent: params.get('templateEvent'), templateScope: params.get('templateScope'),
  };
}
