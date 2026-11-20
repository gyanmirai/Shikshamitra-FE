import { policyVersionValuesEqual } from '../components/version/finance-policy-version-formatters';

import type { PolicyVersion } from '../hooks/useFinancePolicyVersion';

type VersionRecord = {
  id: string;
  versionNumber: number;
  snapshotJson: string;
  creationTime: string;
  creatorId?: string | null;
  creatorUserName?: string | null;
  creatorName?: string | null;
  creatorDisplayName?: string | null;
  status?: string;
  changeAction?: string;
  changeReason?: string | null;
};

export const parsePolicyVersionSnapshot = (json?: string): Record<string, unknown> => {
  try {
    const value = JSON.parse(json || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

/** The extra oldest record is comparison context, not another displayed row. */
export function buildPolicyVersionPage(
  records: VersionRecord[],
  pageSize: number
): PolicyVersion[] {
  return records.slice(0, pageSize).map((record, index) => ({
    versionNumber: record.versionNumber,
    eventId: record.id,
    actor:
      record.creatorUserName ||
      record.creatorName ||
      record.creatorDisplayName ||
      (record.creatorId ? 'Unknown user' : 'System'),
    date: record.creationTime,
    createdAt: record.creationTime,
    action: record.changeAction || 'changed',
    status: record.status,
    changeReason: record.changeReason,
    summary: record.changeReason || record.changeAction || 'Policy updated',
    snapshotJson: record.snapshotJson,
    previousSnapshotJson: records[index + 1]?.snapshotJson,
    changedFields: [],
  }));
}

/** Parse and compare only the selected version or an expanded audit event. */
export function materializePolicyVersion(version: PolicyVersion): PolicyVersion {
  if (version.snapshotJson === undefined) return version;
  const current = parsePolicyVersionSnapshot(version.snapshotJson);
  const previous = parsePolicyVersionSnapshot(version.previousSnapshotJson);
  const hasBaseline = version.previousSnapshotJson !== undefined || version.versionNumber === 1;
  const fields = [...new Set([...Object.keys(previous), ...Object.keys(current)])].filter(
    (field) =>
      !['feeheadnames', 'expensecategoryname', 'defaultpayingbankaccountname'].includes(
        field.toLowerCase()
      )
  );
  return {
    ...version,
    snapshotBefore: hasBaseline ? previous : undefined,
    snapshotAfter: current,
    changedFields: hasBaseline
      ? fields
          .filter((field) => !policyVersionValuesEqual(field, previous[field], current[field]))
          .map((field) => ({
            field,
            oldValue: previous[field] ?? null,
            newValue: current[field] ?? null,
          }))
      : [],
  };
}
