import { describe, expect, it } from 'vitest';

import { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import { mapAdjustmentApplicationItem } from './mapAdjustmentApplication';
import { formatAdjustmentStatusLabel } from '../constants/adjustmentOptions';
import type { FeeAdjustmentApplicationItemDto } from '../types/adjustmentApi.types';

describe('adjustment server status identities', () => {
  it.each([
    [0, 'Pending'],
    [1, 'Rejected'],
    [2, 'Partially applied'],
    [3, 'Approved'],
    [4, 'Cancelled'],
  ])('retains wire status %i and renders %s', (status, label) => {
    const row = mapAdjustmentApplicationItem({
      id: 'request',
      status,
      statusName: label,
      requestedByUserId: 'maker',
    } as FeeAdjustmentApplicationItemDto);
    expect(row.status).toBe(status);
    expect(formatAdjustmentStatusLabel(row.status)).toBe(label);
    expect(row.requestedByUserId).toBe('maker');
  });

  it('uses the same identities for detail and list decisions', () => {
    expect(AdjustmentStatusEnum.Rejected).toBe(1);
    expect(AdjustmentStatusEnum.PartiallyApplied).toBe(2);
    expect(AdjustmentStatusEnum.Approved).toBe(3);
  });
});
