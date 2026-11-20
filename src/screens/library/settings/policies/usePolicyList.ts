import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { useState } from 'react';
import { useGetLibraryCalendarSettingsQuery } from 'src/redux/library/calendar-api';
import {
  useGetLibraryPoliciesQuery,
  useGetLibraryPolicyOptionsQuery,
} from 'src/redux/library/policies-api';

import { useWorkspaceQuery } from './useWorkspaceQuery';

export function usePolicyList(academicYearId: string) {
  const { query, update } = useWorkspaceQuery();
  const page = Math.max(1, Number(query.get('page')) || 1);
  const pageSize = [10, 20, 50, 100].includes(Number(query.get('pageSize')))
    ? Number(query.get('pageSize'))
    : 20;
  const [selected, setSelected] = useState<{ id: string; edit: boolean } | null>(null);
  const [create, setCreate] = useState(false);
  const [lifecycle, setLifecycle] = useState<{
    item: LibraryPolicyVersion;
    action: 'publish' | 'archive';
  } | null>(null);
  const list = useGetLibraryPoliciesQuery(
    { academicYearId, page, pageSize },
    { skip: !academicYearId }
  );
  const options = useGetLibraryPolicyOptionsQuery({ academicYearId }, { skip: !academicYearId });
  const calendar = useGetLibraryCalendarSettingsQuery(
    { academicYearId },
    { skip: !academicYearId }
  );
  const data = options.currentData;
  const canManage = (item: LibraryPolicyVersion) =>
    Boolean(
      data &&
      (data.canManageGlobalPolicies ||
        (item.standardId
          ? data.standards.some((option) => option.id === item.standardId)
          : item.educationMediumStageId &&
            data.stages.some((option) => option.id === item.educationMediumStageId)))
    );
  return {
    update,
    page,
    pageSize,
    selected,
    setSelected,
    create,
    setCreate,
    lifecycle,
    setLifecycle,
    list,
    options,
    calendar,
    data,
    canManage,
  };
}
