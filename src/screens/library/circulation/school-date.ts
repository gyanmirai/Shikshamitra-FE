import type { Dayjs } from 'dayjs';

export const schoolDate = (value: Dayjs | null | undefined) =>
  value?.isValid() ? value.format('YYYY-MM-DD') : null;

export const confirmedDate = (value: string | null, provenance: number) =>
  Boolean(value && (provenance === 1 || provenance === 2));
