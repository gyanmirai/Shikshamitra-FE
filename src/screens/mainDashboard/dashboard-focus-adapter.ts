import { toSafeDashboardHref } from './dashboard-navigation';
import { isRecord, readDate, readEnum, readList, readText, readNumber } from './dashboard-focus-validation';

import type { DashboardFocus, DashboardFocusItem, DashboardFocusMetric, DashboardFocusSeries, DashboardStudentOption, DashboardPresentationRole } from './dashboard-focus-types';

const units = ['INR', 'percent', 'count'] as const;
const roles: readonly DashboardPresentationRole[] = ['leadership', 'principal', 'admissions', 'teacher', 'finance', 'hr', 'financeHr', 'student', 'parent'];
export const parseDashboardPresentationRole = (value: unknown) => readEnum(value, roles);

function parseMetric(value: unknown): DashboardFocusMetric | undefined {
  if (!isRecord(value)) return undefined;
  const key = readText(value.key, 200);
  const label = readText(value.label);
  const amount = readNumber(value.value);
  return key && label && amount !== undefined
    ? { key, label, value: amount, unit: readEnum(value.unit, units), description: readText(value.description) } : undefined;
}

function parseItem(value: unknown): DashboardFocusItem | undefined {
  if (!isRecord(value)) return undefined;
  const id = readText(value.id, 200);
  const title = readText(value.title);
  return id && title ? { id, title, subtitle: readText(value.subtitle), date: readDate(value.date),
    time: readText(value.time, 100), endTime: readText(value.endTime, 100), status: readText(value.status, 100),
    drilldownUrl: toSafeDashboardHref(value.drilldownUrl), widgetId: readText(value.widgetId, 200) } : undefined;
}

function parseSeries(value: unknown): DashboardFocusSeries | undefined {
  if (!isRecord(value)) return undefined;
  const id = readText(value.id, 200);
  const label = readText(value.label);
  const points = readList(value.points, 400, (point) => {
    if (!isRecord(point)) return undefined;
    const key = readText(point.key, 200);
    const pointLabel = readText(point.label);
    const amount = readNumber(point.value);
    return key && pointLabel && amount !== undefined ? { key, label: pointLabel, value: amount } : undefined;
  });
  if (points && new Set(points.map((point) => point.key)).size !== points.length) return undefined;
  return id && label && points ? { id, label, points } : undefined;
}

export function parseDashboardFocus(value: unknown): DashboardFocus | undefined {
  if (!isRecord(value)) return undefined;
  const kind = readEnum(value.kind, ['collections', 'attendance', 'pipeline', 'timetable', 'payroll', 'results'] as const);
  const status = readEnum(value.status, ['ready', 'empty', 'unavailable', 'error'] as const);
  const accessMode = readEnum(value.accessMode, ['staff', 'personal'] as const);
  const widgetId = readText(value.widgetId, 200);
  const title = readText(value.title);
  const description = readText(value.description) ?? '';
  const requiredPermissions = readList(value.requiredPermissions ?? [], 50, (permission) => readText(permission, 250));
  if (!kind || !status || !accessMode || !widgetId || !title || !requiredPermissions) return undefined;
  const unavailable = status === 'error' || status === 'unavailable';
  const series = unavailable ? [] : readList(value.series ?? [], 12, parseSeries);
  const items = unavailable ? [] : readList(value.items ?? [], 100, parseItem);
  const metrics = unavailable ? [] : readList(value.metrics ?? [], 32, parseMetric);
  if (!series || !items || !metrics) return undefined;
  return { kind, widgetId, title, description, status, accessMode, requiredPermissions,
    unit: readEnum(value.unit, units), series, items, metrics, message: readText(value.message),
    asOfUtc: readDate(value.asOfUtc), periodLabel: readText(value.periodLabel, 200) };
}

export function parseDashboardPersonalContext(value: unknown): { students: DashboardStudentOption[]; selectedStudentId?: string } {
  if (!isRecord(value) || !Array.isArray(value.students) || value.students.length > 100) return { students: [] };
  const students: DashboardStudentOption[] = [];
  value.students.forEach((item) => {
    if (!isRecord(item)) return;
    const id = readText(item.id, 200);
    const label = readText(item.label);
    if (id && label && !students.some((student) => student.id === id)) students.push({ id, label });
  });
  const selectedStudentId = readText(value.selectedStudentId, 200);
  return { students, selectedStudentId: students.some((student) => student.id === selectedStudentId) ? selectedStudentId : undefined };
}
