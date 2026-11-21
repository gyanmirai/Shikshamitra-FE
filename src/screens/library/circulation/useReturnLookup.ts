import type { LibraryReturnLookup } from 'src/redux/library/circulation-types';

import { useState, useEffect } from 'react';
import { useLazyGetCirculationReturnQuery } from 'src/redux/library/circulation-api';

import { useSettledText } from './useSettledText';

import type { LibraryReturnTarget } from './return-target';

export function useReturnLookup(value: string, enabled = true) {
  const token = value.trim();
  const settled = useSettledText(value);
  const [version, setVersion] = useState(0);
  const [opened, setOpened] = useState<{ key: string; data: LibraryReturnLookup } | null>(null);
  const [identity, setIdentity] = useState<{ scan: string; target: LibraryReturnTarget } | null>(
    null
  );
  const [load, query] = useLazyGetCirculationReturnQuery();
  const key = `${settled}:${version}`;
  useEffect(() => {
    let active = true;
    setIdentity((previous) => (previous?.scan === token ? previous : null));
    if (enabled && token && token === settled) {
      load({ scan: settled }, false)
        .unwrap()
        .then((data) => {
          if (active) {
            setIdentity((previous) =>
              previous?.scan === token
                ? previous
                : {
                    scan: token,
                    target: { loanId: data.loan.id, copyId: data.copy.copyId },
                  }
            );
            setOpened({ key, data });
          }
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [enabled, token, settled, key, load]);
  const current = enabled && token === settled && opened?.key === key ? opened.data : undefined;
  const matches = query.originalArgs?.scan === token && token === settled;
  const latest = matches ? query.currentData : undefined;
  const sameLoan =
    current &&
    latest &&
    latest.loan.id === current.loan.id &&
    latest.loan.copyId === current.loan.copyId &&
    latest.copy.copyId === current.copy.copyId;
  const currentData =
    current && sameLoan
      ? {
          ...current,
          schoolContext: latest.schoolContext,
          copy: { ...current.copy, schoolContext: latest.schoolContext },
        }
      : current;
  return {
    ...query,
    currentData,
    target: identity?.scan === token ? identity.target : undefined,
    error: matches ? query.error : undefined,
    pending:
      enabled &&
      Boolean(token) &&
      (token !== settled || query.isFetching || (!current && !query.isError)),
    changed: Boolean(
      current &&
      matches &&
      query.currentData &&
      query.currentData.loan.revision !== current.loan.revision
    ),
    refetch: () => setVersion((previous) => previous + 1),
  };
}
