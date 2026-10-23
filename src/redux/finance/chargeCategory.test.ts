import { it, expect, describe } from 'vitest';

import {
  buildChargeCategoryListRequest,
  buildChargeCategoryUsageRequest,
  buildChargeCategoryStatusRequest,
} from './chargeCategory';

describe('charge-category API contract', () => {
  it('reads fresh dependency usage before requesting deletion', () => {
    expect(buildChargeCategoryUsageRequest('category-id')).toEqual({
      url: '/charge-categories/category-id/usage',
      method: 'GET',
    });
  });
  it('requests active categories only for charge authoring', () => {
    expect(
      buildChargeCategoryListRequest({
        academicYearId: 'year-id',
        page: 1,
        pageSize: 100,
        isActive: true,
      })
    ).toEqual({
      url: '/charge-categories',
      method: 'GET',
      params: {
        academicYearId: 'year-id',
        page: 1,
        pageSize: 100,
        isActive: true,
      },
    });
  });

  it('uses the idempotent status route for activation and deactivation', () => {
    expect(
      buildChargeCategoryStatusRequest({
        id: 'category-id',
        body: { isActive: false, reason: 'No longer offered' },
      })
    ).toEqual({
      url: '/charge-categories/category-id/status',
      method: 'PUT',
      body: { isActive: false, reason: 'No longer offered' },
    });
  });
});
