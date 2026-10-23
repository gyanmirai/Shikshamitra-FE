import type {
  AcademicAuditEvent,
  AcademicAuditChangedField,
} from 'src/redux/academicAPI/AuditApi/academic-audit-api';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  CalendarStatus,
  HolidayCategory,
  CALENDAR_STATUS_LABELS,
  HOLIDAY_CATEGORY_LABELS,
} from 'src/enums/academic-calendar';

import { ACADEMIC_AUDIT_SOURCE_LABELS } from '../academicAudit.constants';

dayjs.extend(utc);
dayjs.extend(timezone);

const INSTITUTION_TIME_ZONE = 'Asia/Kolkata';
const AUDIT_DATE_FORMAT = 'DD MMM YYYY';
const AUDIT_DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/;

type AuditValueContext = Pick<AcademicAuditEvent, 'subModuleCode' | 'entityType'>;
type AuditChangedField = Pick<AcademicAuditChangedField, 'field' | 'displayName'>;

const normalizeIdentifier = (value?: string | null): string =>
  (value ?? '').replace(/[\s_-]+/g, '').toLowerCase();

const getCalendarStatusLabel = (context: AuditValueContext, value: string): string | undefined => {
  const isAcademicCalendarModule =
    normalizeIdentifier(context.subModuleCode) === 'academiccalendar';
  const entityType = normalizeIdentifier(context.entityType);
  const isCalendarEntity = entityType === 'academiccalendar' || entityType === 'calendar';
  if (!isAcademicCalendarModule || !isCalendarEntity) return undefined;

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue)) return undefined;

  return CALENDAR_STATUS_LABELS[numericValue as CalendarStatus];
};

const formatAuditDate = (value: string, fieldKey: string): string | undefined => {
  const normalizedValue = value.trim().replace(/^"|"$/g, '');

  if (fieldKey.endsWith('date') && /^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
    const date = dayjs(normalizedValue.slice(0, 10));
    return date.isValid() ? date.format(AUDIT_DATE_FORMAT) : undefined;
  }

  if (ISO_DATE_TIME_PATTERN.test(normalizedValue)) {
    const dateTime = dayjs.utc(normalizedValue).tz(INSTITUTION_TIME_ZONE);
    return dateTime.isValid() ? dateTime.format(AUDIT_DATE_TIME_FORMAT) : undefined;
  }

  if (ISO_DATE_PATTERN.test(normalizedValue)) {
    const date = dayjs(normalizedValue);
    return date.isValid() ? date.format(AUDIT_DATE_FORMAT) : undefined;
  }

  return undefined;
};

const toSentenceCase = (value: string): string => {
  const words = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

  if (words.length === 0) return '-';

  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(' ');
};

export const formatActionLabel = (label?: string | null): string => {
  if (!label) return '-';
  if (/^saved\s*draft$/i.test(label.trim())) return 'Saved draft';
  const formatted = label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(?=(?:added|deleted|updated|created|published|archived|resolved)\b)/gi, '$1 ');

  return formatted
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatAcademicAuditSource = (source?: string | null): string => {
  const normalizedSource = source?.trim();
  if (!normalizedSource) return '-';

  return ACADEMIC_AUDIT_SOURCE_LABELS[normalizedSource] ?? toSentenceCase(normalizedSource);
};

export const formatAcademicAuditChangedValue = (
  context: AuditValueContext,
  field: AuditChangedField,
  value?: string | null
): string => {
  if (value === null || value === undefined || value === '') return '—';

  const fieldKey = normalizeIdentifier(field.field || field.displayName);
  if (fieldKey === 'status') {
    const statusLabel = getCalendarStatusLabel(context, value);
    if (statusLabel) return statusLabel;
  }

  if (fieldKey === 'holidaycategory') {
    const categoryLabel = HOLIDAY_CATEGORY_LABELS[Number(value) as HolidayCategory];
    if (categoryLabel) return categoryLabel;
  }

  if (value.toLowerCase() === 'true') return 'Yes';
  if (value.toLowerCase() === 'false') return 'No';

  return formatAuditDate(value, fieldKey) ?? value;
};
