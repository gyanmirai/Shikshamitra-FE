export type DashboardPresentationRole =
  | 'leadership' | 'principal' | 'admissions' | 'teacher' | 'finance' | 'hr'
  | 'financeHr' | 'student' | 'parent';

export type DashboardFocusKind = 'collections' | 'attendance' | 'pipeline' | 'timetable' | 'payroll' | 'results';
export type DashboardFocusStatus = 'ready' | 'empty' | 'unavailable' | 'error';
export type DashboardFocusUnit = 'INR' | 'percent' | 'count';
export type DashboardStudentOption = { id: string; label: string };
export type DashboardFocusPoint = { key: string; label: string; value: number | null };
export type DashboardFocusSeries = { id: string; label: string; points: DashboardFocusPoint[] };
export type DashboardFocusItem = {
  id: string; title: string; subtitle?: string; date?: string; time?: string;
  endTime?: string; status?: string; drilldownUrl?: string; widgetId?: string;
};
export type DashboardFocusMetric = {
  key: string; label: string; value: number | null; unit?: DashboardFocusUnit; description?: string;
};
export type DashboardFocus = {
  kind: DashboardFocusKind; widgetId: string; title: string; description: string;
  status: DashboardFocusStatus; unit?: DashboardFocusUnit; series: DashboardFocusSeries[];
  items: DashboardFocusItem[]; metrics: DashboardFocusMetric[]; message?: string;
  asOfUtc?: string; periodLabel?: string; accessMode: 'staff' | 'personal';
  requiredPermissions: string[];
};
