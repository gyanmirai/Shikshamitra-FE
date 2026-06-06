import { it, expect, describe } from 'vitest';

import {
  getDashboardSnapshotEmptyStateCopy,
  shouldShowDashboardSnapshotSkeleton,
} from './hr-dashboard-preview-state';

describe('HR dashboard preview state', () => {
  it('uses skeleton only for initial loading or active no-payload refresh', () => {
    expect(
      shouldShowDashboardSnapshotSkeleton({
        status: undefined,
        isFetching: true,
        hasPreview: false,
      })
    ).toBe(true);

    expect(
      shouldShowDashboardSnapshotSkeleton({
        status: 'Refreshing',
        isFetching: false,
        hasPreview: true,
      })
    ).toBe(true);

    expect(
      shouldShowDashboardSnapshotSkeleton({
        status: 'Failed',
        isFetching: false,
        hasPreview: true,
      })
    ).toBe(false);

    expect(
      shouldShowDashboardSnapshotSkeleton({
        status: 'Empty',
        isFetching: false,
        hasPreview: true,
      })
    ).toBe(false);
  });

  it('returns explicit failed and automatic empty copy', () => {
    expect(getDashboardSnapshotEmptyStateCopy({ status: 'Failed' })).toMatchObject({
      title: 'Dashboard snapshot is not available',
      tone: 'error',
    });

    expect(getDashboardSnapshotEmptyStateCopy({ status: 'Empty' })).toMatchObject({
      title: 'Preparing first HR dashboard snapshot',
      tone: 'info',
    });
  });
});
