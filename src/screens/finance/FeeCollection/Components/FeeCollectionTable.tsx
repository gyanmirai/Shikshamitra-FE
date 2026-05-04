import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import React, { useMemo, useState, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, MenuList, MenuItem } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IFeeData, IFeeTableProps } from './type';

const DUMMY_FEE_COLLECTION_DATA = [
  {
    id: '1',
    studentName: 'Aarav Sharma',
    grNo: 'GR001',
    standardName: '10',
    divisionName: 'A',
    rollNo: '01',
    totalFees: 45000,
    paidFees: 45000,
    pendingFees: 0,
    overdueFees: 0,
    status: FeeCollectionStatusType.Paid,
  },
  {
    id: '2',
    studentName: 'Priya Mehta',
    grNo: 'GR002',
    standardName: '10',
    divisionName: 'A',
    rollNo: '02',
    totalFees: 45000,
    paidFees: 20000,
    pendingFees: 25000,
    overdueFees: 0,
    status: FeeCollectionStatusType.Pending,
  },
  {
    id: '3',
    studentName: 'Rohan Patel',
    grNo: 'GR003',
    standardName: '9',
    divisionName: 'B',
    rollNo: '15',
    totalFees: 42000,
    paidFees: 10000,
    pendingFees: 20000,
    overdueFees: 12000,
    status: FeeCollectionStatusType.Overdue,
  },
  {
    id: '4',
    studentName: 'Sneha Joshi',
    grNo: 'GR004',
    standardName: '8',
    divisionName: 'C',
    rollNo: '08',
    totalFees: 38000,
    paidFees: 38000,
    pendingFees: 0,
    overdueFees: 0,
    status: FeeCollectionStatusType.Paid,
  },
  {
    id: '5',
    studentName: 'Karan Desai',
    grNo: 'GR005',
    standardName: '11',
    divisionName: 'A',
    rollNo: '22',
    totalFees: 52000,
    paidFees: 30000,
    pendingFees: 22000,
    overdueFees: 0,
    status: FeeCollectionStatusType.Pending,
  },
  {
    id: '6',
    studentName: 'Ananya Singh',
    grNo: 'GR006',
    standardName: '12',
    divisionName: 'B',
    rollNo: '05',
    totalFees: 55000,
    paidFees: 15000,
    pendingFees: 20000,
    overdueFees: 20000,
    status: FeeCollectionStatusType.Overdue,
  },
];

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  onAddFee,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  onCollectFee,
  onView,
}) => {
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: feeCollectionData, isLoading: feeCollectionLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionListQuery,
    params: {
      AcademicYearId: currentYear?.id,
      BoardId: selectedBoard,
      MediumId: selectedMedium,
    },
    options: {
      skip: !selectedBoard || !selectedMedium, // Skip query if board or medium is not selected
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

  const actions = ({ row }: any) => (
    <MenuList>
      <MenuItem
        onClick={() => {
          onCollectFee(row as IFeeData);
        }}
      >
        <Iconify icon="fluent:payment-16-regular" sx={{ height: '16px', width: '16px' }} />
        Collect Fee
      </MenuItem>
    </MenuList>
  );

  const tableData = useMemo(
    () =>
      (
        (feeCollectionData?.items?.length
          ? feeCollectionData.items
          : DUMMY_FEE_COLLECTION_DATA) as any[]
      ).map((item) => ({
        ...item,
        nameValue: `${item.studentName || '-'}${item.grNo ? ` (${item.grNo})` : ''}`,
        classDivValue: `${item.standardName || '-'}-${item.divisionName || ''}`,
        rollNoValue: item.rollNo || '-',
        totalFeesValue: item.totalFees ?? 0,
        paidFeesValue: item.paidFees ?? 0,
        pendingFeesValue: item.pendingFees ?? 0,
        overdueFeesValue: item.overdueFees ?? 0,
      })),
    [feeCollectionData]
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
          isLoading={feeCollectionLoading}
          columns={[
            {
              id: 'nameValue',
              label: 'Name',
              align: 'left',
              isFilter: true,
              minWidth: '300px',
              sticky: true,
            },
            {
              id: 'classDivValue',
              label: 'Class/Div',
              isFilter: true,
              align: 'left',
              minWidth: '70px',
            },
            {
              id: 'rollNoValue',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
            },
            {
              id: 'totalFeesValue',
              label: 'Total Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'paidFeesValue',
              label: 'Paid Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'pendingFeesValue',
              label: 'Pending Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              minWidth: '130px',
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'overdueFeesValue',
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
                const color = FeeCollectionStatusTypeColors[
                  value as FeeCollectionStatusType
                ] as LabelColor;
                return (
                  <Label color={color}>
                    {FeeCollectionStatusType[value as FeeCollectionStatusType]}
                  </Label>
                );
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
                  <ThreeDotsActions
                    actions={(props) => actions({ ...props, row })}
                    placement="right-top"
                    showViewIcon
                    handleViewClick={() => {
                      onView(row as IFeeData);
                    }}
                  />
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
