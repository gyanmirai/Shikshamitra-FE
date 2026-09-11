import type { AdmissionSeatStage } from 'src/redux/student/admissions/admission-seat-types';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRenewAdmissionSeatMutation, useConfirmAdmissionSeatMutation,
  useReleaseAdmissionSeatMutation, useReserveAdmissionSeatMutation,
  useWaitlistAdmissionSeatMutation, useUpdateAdmissionSeatCapacityMutation } from 'src/redux/student/admissions/admission-seat-api';

import type { SeatAction, SeatActionValue } from './seat-action-dialog';

export function useApplicationSeat(applicationId: string, stageId: string, state: AdmissionSeatStage,
  canAdvance: boolean, onComplete: (concurrencyStamp?: string) => void) {
  const [action, setAction] = useState<SeatAction>(null);
  const idempotencyKey = useRef('');
  const [reserve, reserveState] = useReserveAdmissionSeatMutation();
  const [confirm, confirmState] = useConfirmAdmissionSeatMutation();
  const [renew, renewState] = useRenewAdmissionSeatMutation();
  const [release, releaseState] = useReleaseAdmissionSeatMutation();
  const [waitlist, waitlistState] = useWaitlistAdmissionSeatMutation();
  const [capacity, capacityState] = useUpdateAdmissionSeatCapacityMutation();
  const busy = [reserveState, confirmState, renewState, releaseState, waitlistState, capacityState]
    .some((item) => item.isLoading);
  const open = (next: Exclude<SeatAction, null>) => { idempotencyKey.current = crypto.randomUUID(); setAction(next); };
  const close = () => { if (!busy) { setAction(null); idempotencyKey.current = ''; } };
  const submit = async (value: SeatActionValue) => {
    try {
      const base = { applicationId, stageId, concurrencyStamp: state.concurrencyStamp,
        reservationConcurrencyStamp: state.reservationConcurrencyStamp ?? undefined,
        idempotencyKey: idempotencyKey.current };
      const expiresAt = value.expiresAt ? new Date(value.expiresAt).toISOString() : undefined;
      let result: AdmissionSeatStage;
      if (action === 'reserve') result = await reserve({ ...base, expiresAt,
        joinWaitlistWhenFull: value.joinWaitlist, overrideCapacity: value.overrideCapacity,
        reason: value.reason || undefined }).unwrap();
      else if (action === 'confirm') result = await confirm({ ...base, reason: value.reason || undefined }).unwrap();
      else if (action === 'renew' && expiresAt) result = await renew({ ...base, expiresAt, reason: value.reason || undefined }).unwrap();
      else if (action === 'release') result = await release({ ...base, reason: value.reason || undefined }).unwrap();
      else if (action === 'waitlist') result = await waitlist({ ...base, reason: value.reason || undefined }).unwrap();
      else if (action === 'capacity') result = await capacity({ applicationId, stageId,
        capacity: value.capacity, allowBelowOccupied: value.allowBelowOccupied, reason: value.reason,
        idempotencyKey: idempotencyKey.current, concurrencyStamp: state.concurrencyStamp,
        poolConcurrencyStamp: state.poolConcurrencyStamp ?? undefined }).unwrap();
      else return;
      shikshaMitraToast.success({ message: 'Seat allocation updated' });
      close();
      if (result.canComplete && result.status === 'confirmed' && result.policy?.autoAdvanceOnConfirmation && canAdvance)
        onComplete(result.concurrencyStamp);
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail || 'Unable to update the seat allocation' });
    }
  };
  return { action, busy, open, close, submit };
}
