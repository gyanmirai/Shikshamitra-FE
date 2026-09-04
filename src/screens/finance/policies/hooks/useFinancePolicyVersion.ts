'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGetConcessionPolicyVersionsQuery } from 'src/redux/finance/concessionPolicy';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';

export interface PolicyVersion {
  versionNumber: number;
  eventId: string;
  actor: string;
  date: string;
  summary: string;
  changedFields: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
}

interface UseFinancePolicyVersionProps {
  open: boolean;
  policyId?: string;
  policyType?: string;
}

const parseSnapshot = (snapshotJson?: string): Record<string, unknown> => {
  try {
    const snapshot = JSON.parse(snapshotJson || '{}');
    return snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? snapshot : {};
  } catch {
    return {};
  }
};

export function useFinancePolicyVersion({ open, policyId, policyType }: UseFinancePolicyVersionProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const isConcession = policyType === 'concession';

  // Query audit events for the policy.
  const { data: auditData, isLoading: isAuditLoading, isError: isAuditError } =
    useGetFinanceEntityAuditEventsQuery(
      {
        entityType: 'finance_policy',
        entityId: policyId || '',
        maxResultCount: 50,
        sorting: 'occurredAt asc', // Chronological order to build versions properly
      },
      { skip: !open || !policyId || isConcession }
    );
  const {
    data: concessionVersionData,
    isLoading: isConcessionLoading,
    isError: isConcessionError,
  } = useGetConcessionPolicyVersionsQuery(policyId || '', {
    skip: !open || !policyId || !isConcession,
  });

  /**
   * Memoization Justification:
   * Re-evaluates and groups audit trail events into formatted version snapshots
   * only when query results referentially change, avoiding expensive loops on other renders.
   */
  const versions: PolicyVersion[] = useMemo(() => {
    if (isConcession) {
      const items = [...(concessionVersionData?.items || [])].sort(
        (a, b) => a.versionNumber - b.versionNumber
      );
      return items
        .map((item, index) => {
          const current = parseSnapshot(item.snapshotJson);
          const previous = index
            ? parseSnapshot(items[index - 1].snapshotJson)
            : {};
          const fields = Array.from(new Set([...Object.keys(previous), ...Object.keys(current)]));
          return {
            versionNumber: item.versionNumber,
            eventId: item.id,
            actor:
              item.creatorUserName ||
              item.creatorName ||
              item.creatorDisplayName ||
              (item.creatorId ? 'Unknown user' : 'System'),
            date: new Date(item.creationTime).toLocaleString('en-IN'),
            summary: item.changeReason || item.changeAction || 'Policy updated',
            changedFields: fields
              .filter((field) => JSON.stringify(previous[field]) !== JSON.stringify(current[field]))
              .map((field) => ({
                field,
                oldValue: index ? (previous[field] ?? null) : null,
                newValue: current[field] ?? null,
              })),
          };
        })
        .reverse();
    }

    if (!auditData?.items) return [];

    const result: PolicyVersion[] = [];
    let ver = 1;

    auditData.items.forEach((item) => {
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
  }, [auditData, concessionVersionData, isConcession]);

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
    isLoading: isConcession ? isConcessionLoading : isAuditLoading,
    isError: isConcession ? isConcessionError : isAuditError,
  };
}
