import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';

import type { ReviewDateFilterMode } from '../components/review-queue/FilterToolbar';

export type ReviewWorkspaceCriteria = {
  selectedClass: string; selectedSubject: string; selectedReviewer: string;
  dateFilterMode: ReviewDateFilterMode; filterDate: string | null;
  rangeStart: string | null; rangeEnd: string | null;
};

export const initialReviewWorkspaceCriteria = (): ReviewWorkspaceCriteria => {
  const start = dayjs().startOf('day').subtract((dayjs().day() + 6) % 7, 'day');
  return { selectedClass: '', selectedSubject: '', selectedReviewer: '', dateFilterMode: 'all',
    filterDate: dayjs().format('YYYY-MM-DD'), rangeStart: start.format('YYYY-MM-DD'), rangeEnd: start.add(6, 'day').format('YYYY-MM-DD') };
};

export type ReviewWorkspaceControls = {
  criteria: ReviewWorkspaceCriteria;
  change: (patch: Partial<ReviewWorkspaceCriteria>) => void;
};

export function useReviewQueueFilters(server?: ReviewWorkspaceControls) {
  const [local, setLocal] = useState(initialReviewWorkspaceCriteria);
  const criteria = server?.criteria ?? local;
  const change = (patch: Partial<ReviewWorkspaceCriteria>) => server ? server.change(patch) : setLocal(previous => ({ ...previous, ...patch }));
  const date = (value: string | null) => value ? dayjs(value) : null;
  return { ...criteria, filterDate: date(criteria.filterDate), rangeStart: date(criteria.rangeStart), rangeEnd: date(criteria.rangeEnd),
    setSelectedClass: (selectedClass: string) => change({ selectedClass }),
    setSelectedSubject: (selectedSubject: string) => change({ selectedSubject }),
    setSelectedReviewer: (selectedReviewer: string) => change({ selectedReviewer }),
    setDateFilterMode: (dateFilterMode: ReviewDateFilterMode) => change({ dateFilterMode }),
    setFilterDate: (value: Dayjs | null) => change({ filterDate: value?.format('YYYY-MM-DD') ?? null }),
    setRangeStart: (value: Dayjs | null) => change({ rangeStart: value?.format('YYYY-MM-DD') ?? null }),
    setRangeEnd: (value: Dayjs | null) => change({ rangeEnd: value?.format('YYYY-MM-DD') ?? null }),
    reset: () => change(initialReviewWorkspaceCriteria()) };
}
