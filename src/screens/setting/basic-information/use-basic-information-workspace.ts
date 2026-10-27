import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllTenantsQuery, useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';

import type { TenantRecord } from './types';

export function useBasicInformationWorkspace() {
  const tenantId: string | undefined = useSelector(
    (state: RootState) => state.auth.user?.profile?.tenantid
  );
  const ready = useSelector((state: RootState) => state.auth.permissionsInitialized);
  const isSuperAdmin = !tenantId;
  const form = useBoolean();
  const [editData, setEditData] = useState<TenantRecord | null>(null);
  const [images, setImages] = useState<string[] | null>(null);
  const detail = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTenantByIdQuery,
    params: tenantId,
    options: { skip: !ready || !tenantId, refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const list = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllTenantsQuery,
    options: { skip: !ready || !isSuperAdmin, refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const close = () => {
    form.onFalse();
    setEditData(null);
  };
  return {
    ready,
    isSuperAdmin,
    form,
    editData,
    images,
    setImages,
    close,
    detail,
    list,
    record: detail.currentData as TenantRecord | undefined,
    records: (list.data?.items ?? []) as TenantRecord[],
    edit: (record: TenantRecord) => {
      setEditData(record);
      form.onTrue();
    },
  };
}
