import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { attendanceApi } from './attendanceApi';
import {
  leaveApi,
  buildLeavePolicyQueryParams,
  buildLeaveRequestQueryParams,
  buildLeaveYearEndSettlementQueryParams,
  buildLeaveYearEndSettlementPreviewBody,
} from './leaveApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('leaveApi contracts', () => {
  it('refreshes the open attendance day after leave approval and cancellation', async () => {
    let isApprovedLeave = false;
    mswServer.use(
      http.get('*/api/auth/session', () => HttpResponse.json(null)),
      http.get('*/api/hr/attendance/take-attendance/day', () =>
        HttpResponse.json({ items: [{ employeeId: 'employee-1', isApprovedLeave }] })
      ),
      http.patch('*/api/leave-management/leave-1/approve', () => {
        isApprovedLeave = true;
        return HttpResponse.json({ id: 'leave-1', status: 'APPROVED' });
      }),
      http.delete('*/api/leave-management/leave-1', () => {
        isApprovedLeave = false;
        return HttpResponse.json({ id: 'leave-1' });
      })
    );
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    });
    const dayQuery = attendanceApi.endpoints.getDayAttendance;
    const args = { attendanceDate: '2026-06-04' };
    const subscription = store.dispatch(dayQuery.initiate(args));
    const currentRow = () => dayQuery.select(args)(store.getState()).data?.items[0];

    try {
      await subscription.unwrap();
      expect(currentRow()?.isApprovedLeave).toBe(false);
      await store
        .dispatch(leaveApi.endpoints.approveLeaveRequest.initiate({ id: 'leave-1', body: {} }))
        .unwrap();
      await waitFor(() => expect(currentRow()?.isApprovedLeave).toBe(true));

      await store.dispatch(leaveApi.endpoints.cancelLeaveRequest.initiate('leave-1')).unwrap();
      await waitFor(() => expect(currentRow()?.isApprovedLeave).toBe(false));
    } finally {
      subscription.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  });

  it('sends numeric Pending status zero instead of silently fetching every status', () => {
    expect(buildLeaveRequestQueryParams({ status: 0, paidType: 'Unpaid', page: 1 })).toMatchObject({
      status: 0,
      paidType: 'Unpaid',
      page: 1,
    });
    expect(buildLeaveRequestQueryParams({ status: '' })).not.toHaveProperty('status');
  });
  it('preserves active-only defaults unless the policy workspace requests an archive view', () => {
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
      })
    ).toEqual({
      academicYearId: 'academic-year-1',
      page: 1,
      pageSize: 10,
    });
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
        archivedOnly: false,
      })
    ).toMatchObject({ archivedOnly: false });
    expect(
      buildLeavePolicyQueryParams({
        academicYearId: 'academic-year-1',
        archivedOnly: true,
      })
    ).toMatchObject({ archivedOnly: true });
  });

  it('uses paid type filters and omits legacy leave type filters', () => {
    expect(
      buildLeaveRequestQueryParams({
        academicYearId: 'academic-year-1',
        page: 2,
        pageSize: 50,
        status: 'APPROVED',
        leavePolicyId: 'policy-1',
        paidType: 'Unpaid',
        employeeId: 'employee-1',
      })
    ).toEqual({
      academicYearId: 'academic-year-1',
      page: 2,
      pageSize: 50,
      status: 'APPROVED',
      leavePolicyId: 'policy-1',
      paidType: 'Unpaid',
      employeeId: 'employee-1',
    });
  });

  it('uses academic year only for year-end settlement routes', () => {
    expect(buildLeaveYearEndSettlementQueryParams({ academicYearId: 'academic-year-1' })).toEqual({
      academicYearId: 'academic-year-1',
    });
    expect(buildLeaveYearEndSettlementPreviewBody({ academicYearId: 'academic-year-1' })).toEqual({
      academicYearId: 'academic-year-1',
    });
  });
});
