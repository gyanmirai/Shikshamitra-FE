import type { EsiEmployeeImpact } from 'src/redux/hr/statutory-scheme-api';

import { useState } from 'react';
import { usePreviewEsiImpactQuery } from 'src/redux/hr/statutory-scheme-api';

import { EsiStatutoryEmployees } from './esi-statutory-employees';
import { toApiMonth, parseEsiWorkspaceQuery } from './esi-statutory-utils';

export function EsiConfigurationEmployees({
  month,
  readiness,
  canManageEnrollment,
  canApproveOverride,
  onOpenEmployee,
}: {
  month: string;
  readiness: 'all' | 'needsAttention';
  canManageEnrollment: boolean;
  canApproveOverride: boolean;
  onOpenEmployee: (employee: EsiEmployeeImpact) => void;
}) {
  const [params, setParams] = useState(() => new URLSearchParams({ readiness }));
  const query = parseEsiWorkspaceQuery(params);
  const state = usePreviewEsiImpactQuery({ ...query, monthYear: toApiMonth(month) });
  return (
    <EsiStatutoryEmployees
      query={{ ...query, month }}
      preview={state.data}
      isLoading={state.isLoading}
      isError={state.isError}
      canManageEnrollment={canManageEnrollment}
      canApproveOverride={canApproveOverride}
      onRetry={() => state.refetch()}
      onOpenEmployee={onOpenEmployee}
      onQueryChange={(updates) =>
        setParams((previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null) next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        })
      }
    />
  );
}
