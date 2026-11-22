import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { workflowCreatedRange } from './workflow-date-range';

it('includes both boundaries and the final microseconds of the selected local day', () => {
  const range = workflowCreatedRange('2026-11-17', '2026-11-17')!;
  const firstMoment = dayjs('2026-11-17').startOf('day');
  const nextMidnight = firstMoment.add(1, 'day').startOf('day');

  expect(range.createdFrom).toBe(firstMoment.toISOString());
  expect(range.createdTo).toBe(
    nextMidnight.subtract(1, 'millisecond').toISOString().replace('.999Z', '.9999999Z')
  );

  // Compare canonical UTC timestamps at .NET precision, which JavaScript Date alone cannot retain.
  const padIso = (date: string) => date.replace(/\.(\d{3})Z$/, (_, ms: string) => `.${ms}0000Z`);
  const records = [
    {
      name: 'Previous day',
      creationTime: padIso(firstMoment.subtract(1, 'millisecond').toISOString()),
    },
    { name: 'Start', creationTime: padIso(firstMoment.toISOString()) },
    { name: 'Last microsecond', creationTime: range.createdTo!.replace('9999999Z', '9999990Z') },
    { name: 'Next day', creationTime: padIso(nextMidnight.toISOString()) },
  ];
  expect(
    records
      .filter(
        ({ creationTime }) =>
          creationTime >= padIso(range.createdFrom!) && creationTime <= range.createdTo!
      )
      .map(({ name }) => name)
  ).toEqual(['Start', 'Last microsecond']);
});

it('accepts either date by itself and clears both boundaries together', () => {
  expect(workflowCreatedRange('2026-11-17', '')).toEqual({
    createdFrom: dayjs('2026-11-17').startOf('day').toISOString(),
    createdTo: undefined,
  });
  expect(workflowCreatedRange('', '2026-11-17')).toEqual({
    createdFrom: undefined,
    createdTo: dayjs('2026-11-18')
      .startOf('day')
      .subtract(1, 'millisecond')
      .toISOString()
      .replace('.999Z', '.9999999Z'),
  });
  expect(workflowCreatedRange('', '')).toEqual({
    createdFrom: undefined,
    createdTo: undefined,
  });
});

it('combines independent start and end days into a multi-day range', () => {
  expect(workflowCreatedRange('2026-11-17', '2026-11-28')).toEqual({
    createdFrom: workflowCreatedRange('2026-11-17', '')?.createdFrom,
    createdTo: workflowCreatedRange('', '2026-11-28')?.createdTo,
  });
});

it('uses both local midnights even when the day spans a daylight-saving change', () => {
  const start = new Date(2026, 2, 8);
  const followingMidnight = new Date(2026, 2, 9);
  const lastMillisecond = new Date(followingMidnight.getTime() - 1);
  expect(workflowCreatedRange('2026-03-08', '2026-03-08')).toEqual({
    createdFrom: start.toISOString(),
    createdTo: lastMillisecond.toISOString().replace('.999Z', '.9999999Z'),
  });
});

it('rejects reversed ranges and malformed or overflowing civil dates', () => {
  expect(workflowCreatedRange('2026-11-28', '2026-11-17')).toBeUndefined();
  expect(workflowCreatedRange('not-a-date', '')).toBeUndefined();
  expect(workflowCreatedRange('2026-02-30', '')).toBeUndefined();
  expect(workflowCreatedRange('', '2026-11-17T12:00:00Z')).toBeUndefined();
});
