import type { LibraryReservation } from 'src/redux/library/reservation-types';

import { useState, useEffect } from 'react';
import { useLazyGetLibraryReservationQuery } from 'src/redux/library/reservations-api';

export function useReservationSession(
  reservationId: string,
  academicYearId: string,
  enabled: boolean
) {
  const identity = `${reservationId}:${academicYearId}`;
  const [opened, setOpened] = useState<{ identity: string; item: LibraryReservation } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [load, query] = useLazyGetLibraryReservationQuery();
  useEffect(() => {
    let active = true;
    if (enabled && reservationId && academicYearId) {
      load({ reservationId, academicYearId }, false)
        .unwrap()
        .then((item) => {
          if (active)
            setOpened((current) => (current?.identity === identity ? current : { identity, item }));
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [academicYearId, attempt, enabled, identity, load, reservationId]);
  return {
    query,
    snapshot: opened?.identity === identity ? opened.item : undefined,
    retry: () => setAttempt((value) => value + 1),
  };
}
