'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Alert, Stack, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeStructuresQuery } from 'src/redux/finance/financeFeeStructure';

import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import type { IFeeStructure, IFeeStructureTableProps } from '../type';
import { InfoTooltipIcon } from 'src/screens/hr/policies/components/HRPolicySharedUI';

const FeeStructureTable: React.FC<IFeeStructureTableProps> = ({
  addFeeStructure,
  editData,
  setEditData,
  onDelete,
  onEdit,
  onToggle,
  onView,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canEdit = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeStructureActions.edit
  );

  const {
    data: feeStructureData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeStructuresQuery,
    params: {
      academicYearId: currentYear?.id,
      page: page + 1,
      pageSize,
      search,
      filters: serializeFinanceTableFilters(filters),
    },
    options: { skip: !currentYear?.id },
  });

  const tableData = useMemo(
    () =>
      (feeStructureData?.items ?? []).map((item: IFeeStructure) => {
        const configuredClasses = item.configuredClasses ?? 0;

        return {
          ...item,
          boardMediumValue: `${item.boardName ?? ''}/${item.mediumName ?? ''}`,
          totalClassValue:
            item.totalClasses == null ? null : `${configuredClasses}/${item.totalClasses}`,
          totalFeeHeadValue: item.totalFeeHeads ?? null,
        };
      }),
    [feeStructureData?.items]
  );

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'name', isFilter: true, label: 'Name', align: 'left', filterType: 'string' as const },
      {
        id: 'boardMediumValue',
        isFilter: true,
        label: 'Board/Medium',
        align: 'left',
        filterType: 'string' as const,
      },
      {
        id: 'totalClassValue',
        isFilter: true,
        label: 'Configured Classes',
        renderColumn: () => (
          <InfoTooltipIcon title="Total classes configured in this fee structure." />
        ),
        align: 'left',
        filterType: 'string' as const,
        render: (value) => (value == null ? '-' : value),
      },
      {
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 50,
        render: (value, row) => (
          <AdaptiveThreeDotsActions
            directActionLimit={3}
            actions={[
              ...(canEdit
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: 'solar:pen-bold',
                      onClick: () => onEdit?.(row as IFeeStructure),
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, onToggle, onView, onEdit, canEdit]
  );

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isError && (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        >
          Fee Structure workspaces could not be loaded.
        </Alert>
      )}
      <CustomizableTable
        getRowAction={(row) =>
          onView
            ? {
                label: `Open ${row.name || 'record'}`,
                onClick: () => {
                  onView?.(row as IFeeStructure);
                },
              }
            : undefined
        }
        tableId="fee-structure-table"
        tableTitle="Fee structures"
        exportLabel="Export current page"
        serverSideFilter
        filters={filters}
        onServerFilter={(next) => {
          setFilters(next);
          setPage(0);
        }}
        serverSidePagination
        serverSideSearch
        page={page}
        rowsPerPage={pageSize}
        totalCount={feeStructureData?.totalCount ?? 0}
        maxServerRowsPerPage={100}
        onServerPagination={(nextPage, size) => {
          setPage(nextPage - 1);
          setPageSize(size);
        }}
        onServerSearch={(value) => {
          setSearch(value);
          setPage(0);
        }}
        isLoading={isLoading || isFetching}
        noDataText="No Fee Structure data found"
        columns={columns}
        data={tableData}
      />
    </Stack>
  );
};

export default FeeStructureTable;
