import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useApplicationSeat } from './seat/use-application-seat';
import { useApplicationOffer } from './offer/use-application-offer';

const mocks = vi.hoisted(() => ({
  permissions: [] as Array<{ name: string; isGranted: boolean }>,
  mutate: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth: mocks }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('src/redux/student/admissions/admission-offer-api', () => {
  const mutation = () => [mocks.mutate, { isLoading: false }];
  return {
    useExtendAdmissionOfferMutation: mutation,
    useRespondAdmissionOfferMutation: mutation,
    useReissueAdmissionOfferMutation: mutation,
    useWithdrawAdmissionOfferMutation: mutation,
    useIssueAdmissionStageOfferMutation: mutation,
  };
});
vi.mock('src/redux/student/admissions/admission-seat-api', () => {
  const mutation = () => [mocks.mutate, { isLoading: false }];
  return {
    useRenewAdmissionSeatMutation: mutation,
    useConfirmAdmissionSeatMutation: mutation,
    useReleaseAdmissionSeatMutation: mutation,
    useReserveAdmissionSeatMutation: mutation,
    useWaitlistAdmissionSeatMutation: mutation,
    useUpdateAdmissionSeatCapacityMutation: mutation,
  };
});

beforeEach(() => {
  mocks.permissions = [];
  mocks.mutate.mockReset().mockReturnValue({ unwrap: async () => ({ canComplete: false }) });
});

describe('Offer and seat action authorization', () => {
  it.each(['Offers', 'Seats'] as const)(
    'rechecks %s Add/Update for lifecycle actions and denies Delete-only access',
    async (feature) => {
      const offerValue = {
        expiresAt: '',
        reason: 'Reviewed',
        confirmTerms: true,
        confirmConditions: true,
      };
      const seatValue = {
        expiresAt: '',
        reason: 'Reviewed',
        joinWaitlist: false,
        overrideCapacity: false,
        capacity: 10,
        allowBelowOccupied: false,
      };
      const state = { concurrencyStamp: 'stamp' } as Parameters<typeof useApplicationSeat>[2];
      const useActions = () => {
        const offer = useApplicationOffer('application', 'stage', 'stamp', false, vi.fn());
        const seat = useApplicationSeat('application', 'stage', state, false, vi.fn());
        return feature === 'Offers'
          ? {
              openWrite: () => offer.open('issue'),
              openLifecycle: () => offer.open('withdraw'),
              submit: () => offer.submit(offerValue),
            }
          : {
              openWrite: () => seat.open('capacity'),
              openLifecycle: () => seat.open('release'),
              submit: () => seat.submit(seatValue),
            };
      };
      const hook = renderHook(useActions);
      act(() => hook.result.current.openWrite());
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(mocks.mutate).not.toHaveBeenCalled();
      mocks.permissions = [{ name: `Students.Admissions.${feature}.Add`, isGranted: true }];
      hook.rerender();
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(mocks.mutate).toHaveBeenCalledOnce();
      mocks.mutate.mockClear();
      act(() => hook.result.current.openLifecycle());
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(mocks.mutate).toHaveBeenCalledOnce();
      mocks.mutate.mockClear();
      mocks.permissions = [{ name: `Students.Admissions.${feature}.Delete`, isGranted: true }];
      hook.rerender();
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(mocks.mutate).not.toHaveBeenCalled();
      mocks.mutate.mockClear();
      act(() => hook.result.current.openWrite());
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(mocks.mutate).not.toHaveBeenCalled();
    }
  );
});
