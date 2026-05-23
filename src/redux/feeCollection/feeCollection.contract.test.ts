import { it, expect, describe } from 'vitest';

import {
  feeCollectionApi,
  FEE_COLLECTION_V2_BASE_URL,
  buildFeeCollectionCollectFormUrl,
  buildFeeCollectionStudentFeeDetailsUrl,
} from './feeCollection';

describe('feeCollectionApi contracts', () => {
  it('exposes fee collection endpoints', () => {
    expect(feeCollectionApi.endpoints.getFeeCollectionList).toBeTruthy();
    expect(feeCollectionApi.endpoints.getCollectForm).toBeTruthy();
    expect(feeCollectionApi.endpoints.getStudentFeeDetails).toBeTruthy();
    expect(feeCollectionApi.endpoints.collectFee).toBeTruthy();
  });

  it('builds collect form URL and avoids literal undefined', () => {
    expect(buildFeeCollectionCollectFormUrl({ studentId: 'student-1' })).toBe(
      `${FEE_COLLECTION_V2_BASE_URL}/student-1/collect-form`
    );

    expect(() => buildFeeCollectionCollectFormUrl(undefined)).toThrow('Student id is required');
  });

  it('builds fee details URL and avoids literal undefined', () => {
    expect(buildFeeCollectionStudentFeeDetailsUrl('student-2')).toBe(
      `${FEE_COLLECTION_V2_BASE_URL}/student-2/fee-details`
    );

    expect(() => buildFeeCollectionStudentFeeDetailsUrl({ studentId: '' })).toThrow(
      'Student id is required'
    );
  });
});
