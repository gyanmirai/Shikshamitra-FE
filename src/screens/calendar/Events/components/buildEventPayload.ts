import dayjs from 'dayjs';

export const isMeetingEventTypeName = (typeName?: string | null) => {
  const normalized = typeName?.trim().toLowerCase();
  return normalized === 'meeting' || normalized === 'meeting event';
};

export const serializeFileValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof File !== 'undefined' && value instanceof File) return value.name;
  if (value.url) return value.url;
  if (value.base64) return value.base64;
  if (value.name) return value.name;
  return '';
};

const toIsoStringOrUndefined = (value: any) =>
  value && dayjs(value).isValid() ? dayjs(value).toISOString() : undefined;

const toDateStringOrUndefined = (value: any) =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : undefined;

const toTimeString = (value: any, fallback: dayjs.Dayjs) =>
  value && dayjs(value).isValid() ? dayjs(value).format('HH:mm') : fallback.format('HH:mm');

export const buildEventPayload = (values: any, academicYearId: string) => {
  const isMeetingEvent = isMeetingEventTypeName(values.typeName);
  const payload: any = {
    academicYearId,
    title: values.title,
    eventTypeId: values.type,
    description: values.description,
    poster: serializeFileValue(values.attachment),
    mode: values.eventMode === 'online' ? 0 : 1,
    venue: values.eventMode === 'offline' ? values.venue : null,
    isRecurring: values.isRecurring,
    startTime: toTimeString(values.startTime, dayjs()),
    endTime: toTimeString(values.endTime, dayjs().add(1, 'hour')),
    audienceIds: values.audience,
  };

  if (values.isRecurring) {
    payload.recurrenceJson = JSON.stringify({
      repeatFrequency: values.repeatFrequency,
      customInterval: values.customInterval,
      customIntervalCount: values.customIntervalCount,
      customDays: values.customDays,
      monthlyOption: values.monthlyOption,
      onDay: values.onDay,
      onTheWeek: values.onTheWeek,
      onTheDay: values.onTheDay,
      repeatUntil: values.repeatUntil,
    });
  }

  if (isMeetingEvent) {
    payload.meetingDate = toDateStringOrUndefined(values.meetingDate);
  } else {
    payload.startDate = toIsoStringOrUndefined(values.startDate);
    payload.endDate = toIsoStringOrUndefined(values.endDate);
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  return payload;
};
