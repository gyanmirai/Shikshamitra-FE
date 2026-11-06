import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import { isAttendanceDate } from 'src/redux/student/attendance-management/types';

type DraftDate = { source: string; value: Dayjs | null };
const parseDate = (value: string) => dayjs(isAttendanceDate(value) ? value : 'invalid');

export function useAttendanceReportRange(
  from: string,
  to: string,
  update: (values: Record<string, string | undefined>) => void
) {
  const [fromDraft, setFromDraft] = useState<DraftDate>(() => ({
    source: from,
    value: parseDate(from),
  }));
  const [toDraft, setToDraft] = useState<DraftDate>(() => ({ source: to, value: parseDate(to) }));
  if (fromDraft.source !== from) setFromDraft({ source: from, value: parseDate(from) });
  if (toDraft.source !== to) setToDraft({ source: to, value: parseDate(to) });
  const fromValue = fromDraft.source === from ? fromDraft.value : parseDate(from);
  const toValue = toDraft.source === to ? toDraft.value : parseDate(to);
  return {
    fromValue,
    toValue,
    startDate: fromValue?.isValid() ? fromValue.format('YYYY-MM-DD') : '',
    endDate: toValue?.isValid() ? toValue.format('YYYY-MM-DD') : '',
    changeFrom: (value: Dayjs | null) => {
      setFromDraft({ source: from, value });
      if (value?.isValid()) update({ from: value.format('YYYY-MM-DD'), page: undefined });
    },
    changeTo: (value: Dayjs | null) => {
      setToDraft({ source: to, value });
      if (value?.isValid()) update({ to: value.format('YYYY-MM-DD'), page: undefined });
    },
  };
}
