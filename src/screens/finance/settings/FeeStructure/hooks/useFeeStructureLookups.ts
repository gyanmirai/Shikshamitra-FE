import type {
  PolicyFamily,
  StructureLine,
  StructureSettings,
} from 'src/redux/finance/feeStructureWorkspace';

import { useRef, useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRefundPoliciesQuery } from 'src/redux/finance/refundPolicy';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { useGetStructureContextQuery } from 'src/redux/finance/feeStructureWorkspace';
import { useGetPaymentTermsQuery, useGetPaymentTermByIdQuery } from 'src/redux/finance/paymentTerm';

import { selectablePaymentTerms } from '../feeStructureModel';

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
    setPages((old) => ({ ...old, [page]: data.items }));
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
  published = false
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
  const policyParams = { academicYearId, status: 'Active' };
  const collection = useCatalog(
    useGetCollectionPoliciesQuery,
    policyParams,
    !!academicYearId && policiesEnabled && !!permissions.collectionRead
  );
  const refund = useCatalog(
    useGetRefundPoliciesQuery,
    policyParams,
    !!academicYearId && policiesEnabled && !!permissions.refundRead
  );
  const terms = useCatalog(
    useGetPaymentTermsQuery,
    { academicYearId, boardId: data?.boardId ?? '', status: 'Active' },
    !!academicYearId && !!permissions.termsRead
  );
  const heads = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetActiveFeeHeadsQuery,
    params: academicYearId,
    options: { ...queryOptions, skip: !academicYearId || !permissions.headsRead },
  });
  const termDetail = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentTermByIdQuery,
    params: scheduleLine?.paymentTermId ?? '',
    options: { ...queryOptions, skip: !scheduleLine?.paymentTermId || !permissions.termsRead },
  });
  const settings: StructureSettings | undefined = useMemo(
    () =>
      data
        ? {
            ...data,
            heads: (heads.currentData ?? []).map((head: any) => ({
              ...head,
              categoryName: head.feeCategoryName,
            })),
            policies: (
              [
                ['collection', collection.items],
                ['refund', refund.items],
              ] as [PolicyFamily, any[]][]
            ).flatMap(([family, items]) =>
              items
                .filter((item) => item.isAttachable && item.currentVersionId)
                .map((item) => ({
                  family,
                  id: item.id,
                  name: item.policyName,
                  versionId: item.currentVersionId,
                  versionNumber: item.currentVersionNumber,
                  isCurrent: true,
                  isDefault: item.isDefault,
                }))
            ),
            terms: selectablePaymentTerms(terms.items, data.academicYearId, data.boardId),
          }
        : undefined,
    [data, heads.currentData, collection.items, refund.items, terms.items]
  );
  const detail = termDetail.currentData;
  const version = detail?.versions.find(
    (item: any) => item.id === scheduleLine?.paymentTermVersionId
  );
  const scheduleTerm: StructureSettings['terms'][number] | undefined = version
    ? {
        id: detail.id,
        name: published ? scheduleLine?.paymentTermName || detail.name : detail.name,
        versionId: version.id,
        versionNumber: version.versionNumber,
        isCurrent: version.status === 'Published',
        demandGenerationRule: version.demandGenerationRule,
        demandOffsetDays: version.demandOffsetDays ?? undefined,
        installments: version.installments.map((item: any) => ({
          ...item,
          sourcePaymentTermInstallmentId: item.id,
        })),
      }
    : undefined;
  return {
    settings,
    context,
    heads,
    terms,
    catalogs: { collection, refund },
    scheduleTerm,
    termDetail,
  };
}
