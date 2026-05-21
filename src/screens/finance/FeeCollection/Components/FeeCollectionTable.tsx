import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, MenuList, MenuItem } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { DUMMY_FEE_COLLECTION_LIST } from './dummyData';

import type { IFeeData, IFeeTableProps } from './type';

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  onAddFee,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  onCollectFee,
  onView,
}) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const feeCollectionQueryParams = useMemo(
    () => ({
      AcademicYearId: currentYear?.id,
      BoardId: selectedBoard,
      EducationMediumId: selectedMedium,
      MaxResultCount: 1000,
      SkipCount: 0,
    }),
    [currentYear?.id, selectedBoard, selectedMedium]
  );

  const {
    data: feeCollectionData,
    isLoading: feeCollectionLoading,
    isFetching: feeCollectionFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionListQuery,
    params: feeCollectionQueryParams,
    options: {
      skip: !currentYear?.id || !selectedBoard || !selectedMedium,
    },
  });
  useEffect(() => {
    const yearBoards = currentYear?.boards || [];
    setBoards(yearBoards);

    // Auto-select first board if none selected
    if (!selectedBoard && yearBoards.length > 0) {
      const firstBoard = yearBoards[0] as unknown as Board;
      setSelectedBoard(firstBoard.id);
      const firstMediums = firstBoard.educationMediums || [];
      setMediums(firstMediums);
      // Auto-select first medium of the first board
      if (firstMediums.length > 0) {
        setSelectedMedium(firstMediums[0].id);
      }
      return;
    }

    // Update mediums when board changes
    const board = yearBoards.find((item: any) => item.id === selectedBoard);
    const boardMediums = (board as unknown as Board)?.educationMediums || [];
    setMediums(boardMediums);

    // Auto-select first medium if none selected for the current board
    if (selectedBoard && !selectedMedium && boardMediums.length > 0) {
      setSelectedMedium(boardMediums[0].id);
    }
  }, [currentYear?.boards, selectedBoard, selectedMedium, setSelectedBoard, setSelectedMedium]);

  const tableData = useMemo(
    () =>
      (
        (feeCollectionData?.items?.length
          ? feeCollectionData.items
          : DUMMY_FEE_COLLECTION_LIST.items) as any[]
      ).map((item) => ({
        ...item,
        name: `${item.studentName || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
        standardDivision: item.standardDivision || '-',
        rollNumber: item.rollNumber || '-',
        totalFees: item.totalFees ?? 0,
        paidFees: item.paidFees ?? 0,
        pendingFees: item.pendingFees ?? 0,
        overdueFees: item.overdueFees ?? 0,
      })),
    [feeCollectionData?.items]
  );

  return (
    <>
      <Card sx={{ p: 1, mb: 1, overflow: 'visible' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <CustomSelect
            label="Board"
            options={boards || []}
            labelKey="name"
            valueKey="id"
            value={selectedBoard}
            onChange={(value) => {
              setSelectedBoard(value as string);
              setSelectedMedium('');
            }}
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          />
          <CustomSelect
            label="Medium"
            options={mediums || []}
            labelKey="name"
            disabled={!selectedBoard}
            valueKey="id"
            value={selectedMedium}
            onChange={(value) => setSelectedMedium(value as string)}
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          />
        </Box>
      </Card>
      {selectedMedium ? (
        <CustomizableTable
          tableId="fee-collection-table"
          noDataText={<>Fee Collection Data Not Found </>}
          isLoading={feeCollectionLoading || feeCollectionFetching}
          columns={[
            {
              id: 'name',
              label: 'Name',
              align: 'left',
              isFilter: true,
              minWidth: '300px',
              sticky: true,
            },
            {
              id: 'standardDivision',
              label: 'Class/Div',
              isFilter: true,
              align: 'left',
              minWidth: '70px',
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
            },
            {
              id: 'totalFees',
              label: 'Total Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'paidFees',
              label: 'Paid Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'pendingFees',
              label: 'Pending Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              minWidth: '130px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'overdueFees',
              label: 'Overdue Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              minWidth: '130px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: FeeCollectionStatusOptions,
              sticky: true,
              minWidth: '60px',
              render(value) {
                const statusValue = value as FeeCollectionStatusType;
                const color = FeeCollectionStatusTypeColors[statusValue] as LabelColor;
                return <Label color={color}>{FeeCollectionStatusType[statusValue]}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              minWidth: 60,
              align: 'left',
              isSort: false,
              sticky: true,
              isFilter: false,
              render(value, row) {
                return (
                  <MenuList sx={{ display: 'flex', flexDirection: 'row', p: 0, minWidth: 'auto' }}>
                    <CustomTooltip title="Collect Fee">
                      <MenuItem
                        onClick={() =>
                          onCollectFee({ ...row, id: row.studentId ?? row.id } as IFeeData)
                        }
                      >
                        <Iconify
                          icon="fluent:payment-16-regular"
                          sx={{ height: '16px', width: '16px' }}
                        />
                      </MenuItem>
                    </CustomTooltip>
                    <CustomTooltip title="View Details">
                      <MenuItem onClick={() => onView(row as IFeeData)}>
                        <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
                      </MenuItem>
                    </CustomTooltip>
                  </MenuList>
                );
              },
            },
          ]}
          data={tableData}
        />
      ) : (
        <EmptyContent title="Please select board and medium to view fee collection data." />
      )}
    </>
  );
};

export default FeeCollectionTable;
