import { academicInsightsSectionKeys } from './academicInsightsTypes';

import type { AcademicInsightsResponse } from './academicInsightsTypes';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string';
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const optionalNumber = (value: unknown) => value == null || finite(value);
const optionalText = (value: unknown) => value == null || text(value);
const arrayOf = (value: unknown, check: (item: unknown) => boolean) =>
  Array.isArray(value) && value.every(check);
const point = (value: unknown) => record(value) && text(value.key) && text(value.label) &&
  finite(value.value) && optionalNumber(value.x) && optionalNumber(value.y) && optionalText(value.status);
const metric = (value: unknown) => record(value) && text(value.key) && text(value.label) &&
  (value.value === null || finite(value.value)) && optionalText(value.unit);
const item = (value: unknown) => record(value) && text(value.id) && text(value.label) &&
  optionalText(value.detail) && optionalText(value.date) && optionalText(value.status) && optionalNumber(value.value);
const series = (value: unknown) => record(value) && text(value.name) && arrayOf(value.points, point);
const keys = new Set<string>(academicInsightsSectionKeys);
const states = new Set(['ready', 'empty', 'unavailable', 'error']);
const section = (value: unknown) => record(value) && text(value.key) && keys.has(value.key) &&
  text(value.status) && states.has(value.status) && text(value.summary) &&
  arrayOf(value.metrics, metric) && arrayOf(value.series, series) && arrayOf(value.items, item);

export function parseAcademicInsightsResponse(value: unknown): AcademicInsightsResponse | null {
  if (!record(value) || !text(value.role) || !text(value.scopeLabel) || !text(value.generatedAt) ||
      !Number.isFinite(Date.parse(value.generatedAt)) || !arrayOf(value.sections, section)) return null;
  const sections = value.sections as RecordValue[];
  if (new Set(sections.map((entry) => entry.key)).size !== sections.length) return null;
  if (value.students != null && !arrayOf(value.students,
    (entry) => record(entry) && text(entry.id) && Boolean(entry.id) && text(entry.label))) return null;
  return value as AcademicInsightsResponse;
}
