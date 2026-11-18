'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useGetRefundPolicyVersionsQuery } from 'src/redux/finance/refundPolicy';
import { useGetProrationPolicyVersionsQuery } from 'src/redux/finance/prorationPolicy';
import { useGetConcessionPolicyVersionsQuery } from 'src/redux/finance/concessionPolicy';
import { useGetCollectionPolicyVersionsQuery } from 'src/redux/finance/collectionPolicy';
import { useGetFinanceEntityAuditEventsQuery } from 'src/redux/finance/audit/financeAuditApi';

import { buildPolicyVersionPage, materializePolicyVersion } from '../utils/policy-version-page';

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
  snapshotJson?: string;
  previousSnapshotJson?: string;
  snapshotBefore?: Record<string, unknown>;
  snapshotAfter?: Record<string, unknown>;
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

const PAGE_SIZE = 20;

export function useFinancePolicyVersion({ open, policyId, policyType }: UseFinancePolicyVersionProps) {
  const scopeKey = `${policyType  }:${  policyId}`;
  const [state, setState] = useState({ scopeKey, page: 0, selected: null as string | null });
  const current = state.scopeKey === scopeKey && open ? state : { scopeKey, page: 0, selected: null };
  const {page} = current;
  const isCollection = policyType === 'collection';
  const isConcession = policyType === 'concession';
  const isRefund = policyType === 'refund';
  const isProration = policyType === 'proration';
  const isVersioned = isCollection || isConcession || isRefund || isProration;
  const args = { id: policyId || '', skipCount: page * PAGE_SIZE, maxResultCount: PAGE_SIZE + 1 };
  const collection = useGetCollectionPolicyVersionsQuery(args, { skip: !open || !policyId || !isCollection });
  const concession = useGetConcessionPolicyVersionsQuery(args, { skip: !open || !policyId || !isConcession });
  const refund = useGetRefundPolicyVersionsQuery(args, { skip: !open || !policyId || !isRefund });
  const proration = useGetProrationPolicyVersionsQuery(args, { skip: !open || !policyId || !isProration });
  const audit = useGetFinanceEntityAuditEventsQuery({
    entityType: 'finance_policy', entityId: policyId || '',
    skipCount: page * PAGE_SIZE, maxResultCount: PAGE_SIZE, sorting: 'occurredAt desc',
  }, { skip: !open || !policyId || isVersioned });
  const query = isCollection ? collection : isConcession ? concession : isRefund ? refund : isProration ? proration : audit;
  const versionData = isCollection ? collection.currentData : isConcession ? concession.currentData :
    isRefund ? refund.currentData : proration.currentData;
  const lastCount = useRef({ scopeKey, totalCount: 0 });
  if (lastCount.current.scopeKey !== scopeKey) lastCount.current = { scopeKey, totalCount: 0 };
  if (query.currentData) lastCount.current.totalCount = query.currentData.totalCount;
  const totalCount = query.currentData?.totalCount ?? lastCount.current.totalCount;
  const setPage = (next: number) => setState({ scopeKey, page: next, selected: null });

  useEffect(() => {
    if (!open || state.scopeKey !== scopeKey) setState({ scopeKey, page: 0, selected: null });
  }, [open, scopeKey, state.scopeKey]);
  useEffect(() => {
    // A refreshed history can shrink. Never strand the user on an empty offset.
    if (query.currentData && !query.isFetching && !query.isError && page > 0 && page * PAGE_SIZE >= totalCount)
      setState({ scopeKey, page: Math.max(0, Math.ceil(totalCount / PAGE_SIZE) - 1), selected: null });
  }, [page, totalCount, query.currentData, query.isFetching, query.isError, scopeKey]);

  const versions = useMemo<PolicyVersion[]>(() => {
    if (!open) return [];
    if (isVersioned) return buildPolicyVersionPage(versionData?.items || [], PAGE_SIZE);
    return (audit.currentData?.items || []).filter((item) =>
      item.changedFields?.length || ['create', 'update', 'patch', 'delete'].includes(item.action?.toLowerCase() || '')
    ).map((item, index) => ({
      versionNumber: totalCount - page * PAGE_SIZE - index,
      eventId: item.id,
      actor: item.actorDisplayName || item.actorNameSnapshot || 'System',
      date: item.occurredAt, createdAt: item.occurredAt,
      action: item.action || 'changed', changeReason: item.reason,
      summary: item.summary || 'Policy updated', changedFields: item.changedFields || [],
    }));
  }, [open, isVersioned, versionData, audit.currentData, page, totalCount]);
  const selectedVersionId = versions.some((version) => version.eventId === current.selected)
    ? current.selected : versions[0]?.eventId ?? null;
  const selectedVersion = useMemo(() => {
    const version = versions.find((item) => item.eventId === selectedVersionId);
    return version ? materializePolicyVersion(version) : null;
  }, [versions, selectedVersionId]);

  return {
    versions, selectedVersion, selectedVersionId,
    setSelectedVersionId: (selected: string) => setState({ scopeKey, page, selected }),
    page, pageSize: PAGE_SIZE, totalCount, setPage,
    refetch: query.refetch,
    isLoading: query.isFetching || Boolean(open && policyId && !query.currentData && !query.isError),
    isError: query.isError,
  };
}
