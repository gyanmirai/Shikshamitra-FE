import type { StructureLine, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import { useRef, useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetCollectionPolicyByIdQuery } from 'src/redux/finance/collectionPolicy';
import {
  useGetRefundPolicyByIdQuery,
  useGetRefundPolicyVersionsQuery,
} from 'src/redux/finance/refundPolicy';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetStructureContextQuery,
  useGetStructureCatalogueQuery,
  useGetStructureTermScheduleQuery,
} from 'src/redux/finance/feeStructureWorkspace';
import { useRefreshFinancePrerequisites } from 'src/screens/finance/hooks/useRefreshFinancePrerequisites';
import { parsePolicyVersionSnapshot } from 'src/screens/finance/policies/utils/policy-version-page';

const queryOptions = { refetchOnMountOrArgChange: false, refetchOnFocus: false };

// Traverse bounded API pages so a default on a later page is never silently missed.
// Page caches belong to the owning API; selecting a policy does not fetch its history.
export function useCatalog(query: any, params: Record<string, unknown>, enabled: boolean) {
  const completed = useRef(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Record<number, any[]>>({});
  const scope = JSON.stringify(params);
  const [pagesScope, setPagesScope] = useState(scope);
  useEffect(() => {
    completed.current = false;
    setPagesScope(scope);
    setPage(1);
    setPages({});
  }, [scope]);
  const result = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: query,
    params: { ...params, page, pageSize: 100, skipCount: (page - 1) * 100, maxResultCount: 100 },
    // Each traversal must refresh every page, including an explicit retry that
    // returns to page 1. RTK still shares in-flight requests between editors.
    options: { ...queryOptions, refetchOnMountOrArgChange: true, skip: !enabled },
    popupConfig: { error: false },
  });
  useEffect(() => {
    if (result.isFetching && completed.current && page > 1) {
      completed.current = false;
      setPages({});
      setPage(1);
    }
  }, [result.isFetching, page]);
  const data = result.currentData;
  useEffect(() => {
    if (!data || !enabled || result.isFetching) return;
    if (page * 100 >= data.totalCount) completed.current = true;
    setPages((old) => (old[page] === data.items ? old : { ...old, [page]: data.items }));
    if (data.items.length && page * 100 < data.totalCount) setPage((old) => old + 1);
  }, [data, enabled, page, result.isFetching]);
  const items = useMemo(
    () =>
      pagesScope === scope
        ? Array.from(
            new Map(
              Object.values(pages)
                .flat()
                .map((item) => [item.id, item])
            ).values()
          )
        : [],
    [pages, pagesScope, scope]
  );
  const incomplete =
    !!data &&
    !result.isFetching &&
    (data.items.length === 0 || page * 100 >= data.totalCount) &&
    items.length < data.totalCount;
  return {
    items,
    ready:
      enabled && !result.isError && !!data && !result.isFetching && items.length >= data.totalCount,
    loading:
      enabled &&
      !result.isError &&
      !incomplete &&
      (!data || result.isFetching || items.length < data.totalCount),
    error: enabled && (result.isError || incomplete),
    retry: () => {
      completed.current = false;
      if (page === 1) result.refetch();
      else {
        setPages({});
        setPage(1);
      }
    },
  };
}

export default function useFeeStructureLookups(
  scope: { feeStructureMetadataId: string; standardId: string },
  policiesEnabled: boolean,
  scheduleLine?: StructureLine,
  published = false,
  active = true,
  selectedPolicyIds?: {
    collection?: string | null;
    refund?: string | null;
    refundVersion?: string | null;
  }
) {
  const context = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStructureContextQuery,
    params: scope,
    options: queryOptions,
  });
  const data = context.currentData;
  const academicYearId = data?.academicYearId ?? '';
  const permissions = data?.permissions ?? {};
  const activatedScope = useRef<string | undefined>(undefined);
  const scopeKey = JSON.stringify({ ...scope, academicYearId });
  if (active) activatedScope.current = scopeKey;
  const enabled = !!academicYearId && (active || activatedScope.current === scopeKey);
  const catalogue = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStructureCatalogueQuery,
    params: { ...scope, academicYearId },
    options: { ...queryOptions, skip: !enabled },
    popupConfig: { error: false },
  });
  const heads = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetActiveFeeHeadsQuery,
    params: academicYearId,
    options: { ...queryOptions, skip: !academicYearId || !permissions.headsRead },
  });
  const termDetail = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStructureTermScheduleQuery,
    params: {
      ...scope,
      paymentTermId: scheduleLine?.paymentTermId ?? '',
      versionId: scheduleLine?.paymentTermVersionId ?? '',
    },
    options: {
      ...queryOptions,
      skip:
        !active ||
        !scheduleLine?.paymentTermId ||
        !scheduleLine?.paymentTermVersionId ||
        !permissions.termsRead,
    },
  });
  const selectedPolicyId = (family: 'collection' | 'refund') =>
    selectedPolicyIds?.[family] ??
    catalogue.currentData?.policies.find(
      (policy: any) => policy.family === family && policy.isDefault
    )?.id ??
    '';
  const collectionDetail = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectionPolicyByIdQuery,
    params: selectedPolicyId('collection'),
    options: {
      ...queryOptions,
      skip: !active || published || !permissions.collectionRead || !selectedPolicyId('collection'),
    },
    popupConfig: { error: false },
  });
  const refundDetail = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundPolicyByIdQuery,
    params: selectedPolicyId('refund'),
    options: {
      ...queryOptions,
      skip: !active || published || !permissions.refundRead || !selectedPolicyId('refund'),
    },
    popupConfig: { error: false },
  });
  const refundVersionId = selectedPolicyIds?.refundVersion;
  const needsSavedRefundScope =
    !!refundVersionId &&
    !!selectedPolicyIds?.refund &&
    !!refundDetail.currentData &&
    refundDetail.currentData.currentVersionId !== refundVersionId;
  const savedRefund = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundPolicyVersionsQuery,
    params: { id: selectedPolicyIds?.refund ?? '', versionId: refundVersionId, maxResultCount: 1 },
    options: {
      ...queryOptions,
      skip: !active || published || !permissions.refundRead || !needsSavedRefundScope,
    },
    popupConfig: { error: false },
  });
  const savedRefundCoverage = useMemo(() => {
    const version = savedRefund.currentData?.items.find(
      (item: { id: string }) => item.id === refundVersionId
    );
    if (!version) return undefined;
    const snapshot = parsePolicyVersionSnapshot(version.snapshotJson);
    const scopeValue = snapshot.FeeHeadScope ?? snapshot.feeHeadScope;
    const feeHeadScope =
      scopeValue === 'AllFeeHeads' || scopeValue === 0
        ? 'AllFeeHeads'
        : scopeValue === 'SelectedFeeHeads' || scopeValue === 1
          ? 'SelectedFeeHeads'
          : undefined;
    const ids = snapshot.ApplicableFeeHeadIds ?? snapshot.applicableFeeHeadIds;
    if (!feeHeadScope || !Array.isArray(ids)) return undefined;
    return {
      id: version.policyId,
      currentVersionId: version.id,
      feeHeadScope,
      applicableFeeHeadIds: ids,
    };
  }, [savedRefund.currentData, refundVersionId]);
  const catalogState = (required: boolean) => ({
    items: [] as any[],
    ready:
      !required ||
      (enabled && !!catalogue.currentData && !catalogue.isFetching && !catalogue.isError),
    loading:
      required && enabled && !catalogue.isError && (!catalogue.currentData || catalogue.isFetching),
    error: required && enabled && !!catalogue.isError,
    retry: () => {
      if (!catalogue.isUninitialized) catalogue.refetch?.();
    },
  });
  const terms = catalogState(!!permissions.termsRead);
  const policyState = (family: 'collection' | 'refund', detail: any) => {
    const state = catalogState(policiesEnabled && !!permissions[`${family}Read`]);
    return {
      ...state,
      items: detail.currentData ? [detail.currentData] : [],
      loading: !!detail.isFetching || state.loading,
      error: !!detail.isError || state.error,
      retry: () => {
        state.retry();
        if (!detail.isUninitialized) detail.refetch?.();
      },
    };
  };
  const collection = policyState('collection', collectionDetail);
  const refundState = policyState('refund', refundDetail);
  const refund = {
    ...refundState,
    items: savedRefundCoverage ? [...refundState.items, savedRefundCoverage] : refundState.items,
    loading: refundState.loading || !!savedRefund.isFetching,
    error: refundState.error || !!savedRefund.isError,
    retry: () => {
      refundState.retry();
      if (!savedRefund.isUninitialized) savedRefund.refetch?.();
    },
  };
  const refreshPrerequisites = () => {
    if (!active) return;
    context.refetch?.();
    if (academicYearId && permissions.headsRead && !heads.isUninitialized) heads.refetch?.();
    if (!catalogue.isUninitialized) catalogue.refetch?.();
    if (!collectionDetail.isUninitialized) collectionDetail.refetch?.();
    if (!refundDetail.isUninitialized) refundDetail.refetch?.();
  };
  useRefreshFinancePrerequisites(refreshPrerequisites, active);
  const settings: StructureSettings | undefined = useMemo(
    () =>
      data
        ? {
            ...data,
            heads: (heads.currentData ?? []).map((head: any) => ({
              ...head,
              categoryName: head.feeCategoryName,
            })),
            policies: catalogue.currentData?.policies ?? [],
            terms: catalogue.currentData?.terms ?? [],
          }
        : undefined,
    [data, heads.currentData, catalogue.currentData]
  );
  const detail = termDetail.currentData;
  const scheduleTerm = detail
    ? { ...detail, name: published ? scheduleLine?.paymentTermName || detail.name : detail.name }
    : undefined;
  return {
    settings,
    refreshPrerequisites,
    context,
    heads,
    terms,
    catalogs: { collection, refund, proration: catalogState(policiesEnabled && !!permissions.prorationRead) },
    scheduleTerm,
    termDetail,
  };
}
