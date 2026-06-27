'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';

export interface PolicyVersion {
  versionNumber: number;
  eventId: string;
  actor: string;
  date: string;
  summary: string;
  changedFields: Array<{
    field: string;
    oldValue?: string | null;
    newValue?: string | null;
  }>;
}

interface UseFinancePolicyVersionProps {
  open: boolean;
  policyId?: string;
}

export function useFinancePolicyVersion({ open, policyId }: UseFinancePolicyVersionProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Query audit events for the policy.
  const { data, isLoading, isError } = useGetFinanceEntityAuditEventsQuery(
    {
      entityType: 'finance_policy',
      entityId: policyId || '',
      maxResultCount: 50,
      sorting: 'occurredAt asc', // Chronological order to build versions properly
    },
    { skip: !open || !policyId }
  );

  /**
   * Memoization Justification:
   * Re-evaluates and groups audit trail events into formatted version snapshots
   * only when query results referentially change, avoiding expensive loops on other renders.
   */
  const versions: PolicyVersion[] = useMemo(() => {
    if (!data?.items) return [];

    const result: PolicyVersion[] = [];
    let ver = 1;

    data.items.forEach((item) => {
      const hasChanges = item.changedFields && item.changedFields.length > 0;
      const isCreate = item.action?.toLowerCase() === 'create';
      const isUpdate =
        item.action?.toLowerCase() === 'update' ||
        item.action?.toLowerCase() === 'patch' ||
        item.action?.toLowerCase() === 'delete';

      if (isCreate || isUpdate || hasChanges) {
        result.push({
          versionNumber: ver,
          eventId: item.id,
          actor: item.actorDisplayName || item.actorNameSnapshot || 'System',
          date: item.occurredAtDisplay || new Date(item.occurredAt).toLocaleString('en-IN'),
          summary: item.summary || (isCreate ? 'Policy Created' : 'Policy Updated'),
          changedFields: item.changedFields || [],
        });
        ver += 1;
      }
    });

    // Reverse so the latest version is at the top of the list
    return result.reverse();
  }, [data]);

  // Set the default selected version to the latest version once loaded
  useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[0].eventId);
    }
  }, [versions, selectedVersionId]);

  // Reset selected version when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedVersionId(null);
    }
  }, [open]);

  /**
   * Memoization Justification:
   * Keeps search time to find the active version selection O(1) through references,
   * re-evaluating only when selection or versions list updates.
   */
  const selectedVersion = useMemo(
    () => versions.find((v) => v.eventId === selectedVersionId) || null,
    [versions, selectedVersionId]
  );

  return {
    versions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
    isError,
  };
}
