'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Alert, Stack, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeStructuresQuery } from 'src/redux/finance/financeFeeStructure';
import { InfoTooltipIcon } from 'src/screens/hr/policies/components/HRPolicySharedUI';

import type { IFeeStructure, IFeeStructureTableProps } from '../type';

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
    params: { academicYearId: currentYear?.id, page: page + 1, pageSize, search },
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
      { id: 'name', label: 'Name', align: 'left', filterType: 'string' },
      {
        id: 'boardMediumValue',
        label: 'Board/Medium',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'totalClassValue',
        label: (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <span>Configured Classes</span>
            <InfoTooltipIcon title="Total classes configured in this fee structure." />
          </Stack>
        ),
        align: 'left',
        filterType: 'string',
        render: (value) => (value == null ? '-' : value),
      },
      {
        id: 'action',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 50,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon={canEdit}
            showViewIcon
            handleViewClick={() => onView?.(row as IFeeStructure)}
            handleEditClick={() => onEdit?.(row as IFeeStructure)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, onToggle, onView, onEdit, canEdit]
  );

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {!currentYear?.id && (
        <Alert severity="info">Select an academic year to manage Fee Structures.</Alert>
      )}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Fee Structure workspaces could not be loaded.
        </Alert>
      )}
      <CustomizableTable
        tableId="fee-structure-table"
        serverSidePagination
        serverSideSearch
        isFilter={false}
        page={page}
        rowsPerPage={pageSize}
        totalCount={feeStructureData?.totalCount ?? 0}
        maxServerRowsPerPage={100}
        onServerPagination={(nextPage, size) => {
          setPage(nextPage);
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
