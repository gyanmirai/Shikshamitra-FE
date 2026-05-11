'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeStructuresQuery } from 'src/redux/finance/financeFeeStructure';

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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    data: feeStructureData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeStructuresQuery,
    params: { academicYearId: currentYear?.id },
  });

  const tableData = useMemo(
    () =>
      (feeStructureData?.items ?? []).map((item: IFeeStructure) => ({
        ...item,
        boardMediumValue: `${item.boardName ?? ''}/${item.mediumName ?? ''}`,
        totalClassValue: item.totalClass ?? null,
        totalFeeHeadValue: item.totalFeeHead ?? null,
      })),
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
        label: 'Total Classes',
        align: 'left',
        filterType: 'number',
        render: (value) => (value == null ? '-' : value),
      },
      {
        id: 'totalFeeHeadValue',
        label: 'Total Fee Heads',
        align: 'left',
        filterType: 'number',
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
            showEditIcon
            showViewIcon
            handleViewClick={() => onView?.(row as IFeeStructure)}
            handleEditClick={() => onEdit?.(row as IFeeStructure)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, onToggle, onView, onEdit]
  );

  return (
    <CustomizableTable
      tableId="fee-structure-table"
      isLoading={isLoading || isFetching}
      noDataText="No Fee Structure data found"
      columns={columns}
      data={tableData}
    />
  );
};

export default FeeStructureTable;
