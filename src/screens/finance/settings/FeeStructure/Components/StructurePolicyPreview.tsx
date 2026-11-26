import type { StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import { useEffect } from 'react';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import VersionDiffTable from 'src/screens/finance/policies/components/version/VersionDiffTable';
import { FinancePolicyDetails } from 'src/screens/finance/policies/components/FinancePolicyDetailsDrawer';
import {
  useGetRefundPolicyByIdQuery,
  useGetRefundPolicyVersionsQuery,
} from 'src/redux/finance/refundPolicy';
import {
  useGetProrationPolicyByIdQuery,
  useGetProrationPolicyVersionsQuery,
} from 'src/redux/finance/prorationPolicy';
import {
  useGetCollectionPolicyByIdQuery,
  useGetCollectionPolicyVersionsQuery,
} from 'src/redux/finance/collectionPolicy';
import {
  buildPolicyVersionPage,
  parsePolicyVersionSnapshot,
} from 'src/screens/finance/policies/utils/policy-version-page';

interface Props {
  option: StructureSettings['policies'][number];
  settings: StructureSettings;
  onVersionChanged: () => void;
}

export default function StructurePolicyPreview({ option, settings, onVersionChanged }: Props) {
  const collection = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectionPolicyByIdQuery,
    params: option.id,
    options: { skip: option.family !== 'collection' || !settings.permissions.collectionRead },
    popupConfig: { error: false },
  });
  const refund = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundPolicyByIdQuery,
    params: option.id,
    options: { skip: option.family !== 'refund' || !settings.permissions.refundRead },
    popupConfig: { error: false },
  });
  const proration = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetProrationPolicyByIdQuery,
    params: option.id,
    options: { skip: option.family !== 'proration' || !settings.permissions.prorationRead },
    popupConfig: { error: false },
  });
  const query =
    option.family === 'proration'
      ? proration
      : option.family === 'collection'
        ? collection
        : refund;
  const detail = query.currentData;
  const verified = detail?.currentVersionId === option.versionId && detail?.id === option.id;
  const versionChanged = !!detail && !verified;
  useEffect(() => {
    if (versionChanged) onVersionChanged();
  }, [versionChanged, onVersionChanged]);
  const args = { id: option.id, versionId: option.versionId, maxResultCount: 1 };
  const collectionVersion = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectionPolicyVersionsQuery,
    params: args,
    options: {
      skip:
        !versionChanged || option.family !== 'collection' || !settings.permissions.collectionRead,
    },
    popupConfig: { error: false },
  });
  const refundVersion = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRefundPolicyVersionsQuery,
    params: args,
    options: {
      skip: !versionChanged || option.family !== 'refund' || !settings.permissions.refundRead,
    },
    popupConfig: { error: false },
  });
  const prorationVersion = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetProrationPolicyVersionsQuery,
    params: args,
    options: {
      skip: !versionChanged || option.family !== 'proration' || !settings.permissions.prorationRead,
    },
    popupConfig: { error: false },
  });
  const versionQuery =
    option.family === 'proration'
      ? prorationVersion
      : option.family === 'collection'
        ? collectionVersion
        : refundVersion;
  const exactRecord = versionQuery.currentData?.items.find(
    (item: { id: string }) => item.id === option.versionId
  );
  const savedVersion = exactRecord && buildPolicyVersionPage([exactRecord], 1)[0];
  const snapshot = parsePolicyVersionSnapshot(savedVersion?.snapshotJson);
  const hasSnapshot = !!savedVersion && Object.keys(snapshot).length > 0;
  const loading =
    query.isLoading || query.isFetching || versionQuery.isLoading || versionQuery.isFetching;
  return (
    <FinancePolicyDetails
      presentation="feeStructure"
      policy={{
        id: option.id,
        policyName: option.name,
        policyCode: verified ? (detail.policyCode ?? '') : '',
        policyType: option.family,
        academicYearId: settings.academicYearId,
        academicYearName: settings.academicYearName,
        status: 'Active',
        version: option.versionNumber,
        isDefault: !!option.isDefault,
        effectiveFrom:
          verified && 'effectiveFrom' in detail ? (detail.effectiveFrom ?? null) : null,
        effectiveTo: verified && 'effectiveTo' in detail ? (detail.effectiveTo ?? null) : null,
        updatedAt: verified ? (detail.updatedAt ?? '') : '',
        updatedBy: verified ? (detail.updatedBy ?? '') : '',
        creationTime: verified ? detail.creationTime : undefined,
        lastModificationTime: verified ? detail.lastModificationTime : undefined,
      }}
      policyDetails={verified ? detail : undefined}
      isLoading={loading}
      isError={query.isError || (!verified && !hasSnapshot)}
      savedVersionDetails={
        hasSnapshot ? (
          <VersionDiffTable
            selectedVersion={{ ...savedVersion, snapshotAfter: snapshot }}
            showSummary={false}
            showSavedDetails
          />
        ) : undefined
      }
      errorMessage={
        versionChanged
          ? 'The saved details for this policy version could not be loaded.'
          : undefined
      }
      onRetry={versionChanged ? versionQuery.refetch : query.refetch}
    />
  );
}
