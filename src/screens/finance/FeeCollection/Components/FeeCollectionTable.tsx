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
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import feeCollectionData from '../../../../../financeFeeCollection.json';

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
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // const { data: feeCollectionData, isLoading: feeCollectionLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetFeeCollectionListQuery,
  //   params: {
  //     academicYearId: currentYear?.id,
  //     boardId: selectedBoard,
  //     mediumId: selectedMedium,
  //   },
  // });
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

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
      ((feeCollectionData?.feeCollectionData || []) as any[]).map((item) => ({
        ...item,
        nameValue: `${item.name || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
        classDivValue: `${item.className || '-'}-${item.division}`,
        paybleFeesValue: `₹ ${formatNumber(item.paybleFees ?? 0)}`,
        totalFeesValue: `₹ ${formatNumber(item.totalFees ?? 0)}`,
        pendingFeesValue: `₹ ${formatNumber(item.pendingFees ?? 0)}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feeCollectionData?.feeCollectionData]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, pb: 1 }}>
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
          // isLoading={feeCollectionLoading}
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
              id: 'rollNumber',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
            },
            {
              id: 'paybleFeesValue',
              label: 'Payble Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
            },
            {
              id: 'totalFeesValue',
              label: 'Total Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
            },
            {
              id: 'pendingFeesValue',
              label: 'Pending Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              minWidth: '130px',
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
