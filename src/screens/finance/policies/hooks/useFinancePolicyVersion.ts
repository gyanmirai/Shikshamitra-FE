'use client';

import { useMemo, useState, useEffect } from 'react';
import { useGetRefundPolicyVersionsQuery } from 'src/redux/finance/refundPolicy';
import { useGetProrationPolicyVersionsQuery } from 'src/redux/finance/prorationPolicy';
import { useGetConcessionPolicyVersionsQuery } from 'src/redux/finance/concessionPolicy';
import { useGetCollectionPolicyVersionsQuery } from 'src/redux/finance/collectionPolicy';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';

export interface PolicyVersion {
  versionNumber: number;
  eventId: string;
  actor: string;
  date: string;
  createdAt: string;
  action: string;
  status?: string;
  changeReason?: string | null;
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

export function useFinancePolicyVersion({
  open,
  policyId,
  policyType,
}: UseFinancePolicyVersionProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const isConcession = policyType === 'concession';
  const isCollection = policyType === 'collection';
  const isRefund = policyType === 'refund';
  const isProration = policyType === 'proration';

  // Query audit events for the policy.
  const {
    data: auditData,
    isLoading: isAuditLoading,
    isError: isAuditError,
  } = useGetFinanceEntityAuditEventsQuery(
    {
      entityType: 'finance_policy',
      entityId: policyId || '',
      maxResultCount: 50,
      sorting: 'occurredAt asc', // Chronological order to build versions properly
    },
    { skip: !open || !policyId || isConcession || isCollection || isRefund || isProration }
  );
  const {
    data: concessionVersionData,
    isLoading: isConcessionLoading,
    isError: isConcessionError,
  } = useGetConcessionPolicyVersionsQuery(policyId || '', {
    skip: !open || !policyId || !isConcession,
  });
  const {
    data: collectionVersionData,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useGetCollectionPolicyVersionsQuery(
    { id: policyId || '', skipCount: 0, maxResultCount: 100 },
    { skip: !open || !policyId || !isCollection }
  );
  const {
    data: refundVersionData,
    isLoading: isRefundLoading,
    isError: isRefundError,
  } = useGetRefundPolicyVersionsQuery(policyId || '', {
    skip: !open || !policyId || !isRefund,
  });
  const {
    data: prorationVersionData,
    isLoading: isProrationLoading,
    isError: isProrationError,
  } = useGetProrationPolicyVersionsQuery(policyId || '', {
    skip: !open || !policyId || !isProration,
  });

  /**
   * Memoization Justification:
   * Re-evaluates and groups audit trail events into formatted version snapshots
   * only when query results referentially change, avoiding expensive loops on other renders.
   */
  const versions: PolicyVersion[] = useMemo(() => {
    if (isConcession || isCollection || isRefund || isProration) {
      const versionData = isCollection
        ? collectionVersionData
        : isRefund
          ? refundVersionData
          : isProration
            ? prorationVersionData
            : concessionVersionData;
      const items = [...(versionData?.items || [])].sort(
        (a, b) => a.versionNumber - b.versionNumber
      );
      return items
        .map((item, index) => {
          const actorDetails = item as typeof item & {
            creatorName?: string | null;
            creatorDisplayName?: string | null;
            status?: string;
          };
          const current = parseSnapshot(item.snapshotJson);
          const previous = index ? parseSnapshot(items[index - 1].snapshotJson) : {};
          const fields = Array.from(new Set([...Object.keys(previous), ...Object.keys(current)]));
          return {
            versionNumber: item.versionNumber,
            eventId: item.id,
            actor:
              item.creatorUserName ||
              actorDetails.creatorName ||
              actorDetails.creatorDisplayName ||
              (item.creatorId ? 'Unknown user' : 'System'),
            date: item.creationTime,
            createdAt: item.creationTime,
            action: item.changeAction || 'changed',
            status: actorDetails.status,
            changeReason: item.changeReason,
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
          date: item.occurredAt,
          createdAt: item.occurredAt,
          action: item.action || 'changed',
          changeReason: item.reason,
          summary: item.summary || (isCreate ? 'Policy Created' : 'Policy Updated'),
          changedFields: item.changedFields || [],
        });
        ver += 1;
      }
    });

    // Reverse so the latest version is at the top of the list
    return result.reverse();
  }, [
    auditData,
    collectionVersionData,
    concessionVersionData,
    refundVersionData,
    prorationVersionData,
    isCollection,
    isConcession,
    isRefund,
    isProration,
  ]);

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
    isLoading: isCollection
      ? isCollectionLoading
      : isRefund
        ? isRefundLoading
        : isProration
          ? isProrationLoading
          : isConcession
            ? isConcessionLoading
            : isAuditLoading,
    isError: isCollection
      ? isCollectionError
      : isRefund
        ? isRefundError
        : isProration
          ? isProrationError
          : isConcession
            ? isConcessionError
            : isAuditError,
  };
}
