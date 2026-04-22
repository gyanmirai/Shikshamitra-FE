'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeStructuresQuery } from 'src/redux/finance/financeFeeStructure';
import {
  FeeStructureLockStatusType,
  FeeStructureLockStatusOptions,
} from 'src/enums/finance-fee-structure-status';

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
      { id: 'receiptBookName', label: 'Receipt Book', align: 'left', filterType: 'string' },
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
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 40,
        isFilter: false,
        sticky: true,
        isSort: false,
        filterType: 'enum',
        enumOptions: FeeStructureLockStatusOptions,
        render(value, row) {
          const statusColor =
            value === FeeStructureLockStatusType.Locked
              ? theme.palette.grey[500]
              : theme.vars.palette.success.main;

          return (
            <CustomTooltip
              title={value === 0 ? 'Unlock' : 'Lock'}
              arrow
              placement="left"
              PopperProps={{
                modifiers: [
                  {
                    name: 'offset',
                    options: { offset: [0, 0] },
                  },
                ],
              }}
            >
              <IconButton
                onClick={() => onToggle?.(row as IFeeStructure)}
                sx={{
                  p: 0.6,
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.1)', backgroundColor: statusColor },
                }}
              >
                <Iconify
                  icon={
                    value === FeeStructureLockStatusType.Locked
                      ? 'mdi:lock-open-outline'
                      : 'mdi:lock-outline'
                  }
                  sx={{ width: 20, height: 20, color: '#fff' }}
                />
              </IconButton>
            </CustomTooltip>
          );
        },
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
