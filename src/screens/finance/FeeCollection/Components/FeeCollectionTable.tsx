import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { EmptyContent } from 'src/components/empty-content';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Box, Card, MenuList, MenuItem, Skeleton, Typography } from '@mui/material';
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
    setBoards(currentYear?.boards || []);
  }, [currentYear?.boards]);

  useEffect(() => {
    const board = (currentYear?.boards || []).find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [currentYear?.boards, selectedBoard]);

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

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, pb: 1 }}>
          {!currentYear ? (
            <Skeleton variant="rounded" height={40} sx={{ maxWidth: '248px', width: '100%' }} />
          ) : (
            <PaginatedSearchSelect
              key={boards?.length ? 'boards-loaded' : 'boards-empty'}
              label="Board"
              noOptionsText="No Board Found"
              fetchOptions={async (query: string, page: number) => {
                const filtered = (boards || []).filter((b: any) =>
                  b?.name?.toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                return {
                  data: filtered.slice(start, end).map((item: any) => ({
                    label: item.name,
                    id: item.id,
                  })),
                  hasMore: end < filtered.length,
                };
              }}
              value={
                boards?.find((b: any) => b.id === selectedBoard)
                  ? {
                      label: (boards.find((b: any) => b.id === selectedBoard) as any)?.name,
                      id: selectedBoard,
                    }
                  : null
              }
              isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
              renderOption={(prop, option: any) => (
                <li {...prop} key={option.id}>
                  {option.label}
                </li>
              )}
              getOptionLabel={(option: any) => option?.label || ''}
              minChars={0}
              onChange={(_, value: any) => {
                setSelectedBoard(value?.id || '');
                setSelectedMedium('');
              }}
              size="small"
              sx={{ maxWidth: '248px', width: '100%' }}
            />
          )}
          {!currentYear ? (
            <Skeleton variant="rounded" height={40} sx={{ maxWidth: '248px', width: '100%' }} />
          ) : (
            <PaginatedSearchSelect
              key={`medium-${selectedBoard || 'empty'}`}
              label="Medium"
              noOptionsText="No Medium Found"
              disabled={!selectedBoard}
              fetchOptions={async (query: string, page: number) => {
                const filtered = (mediums || []).filter((m: any) =>
                  m?.name?.toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                return {
                  data: filtered.slice(start, end).map((item: any) => ({
                    label: item.name,
                    id: item.id,
                  })),
                  hasMore: end < filtered.length,
                };
              }}
              value={
                mediums?.find((m: any) => m.id === selectedMedium)
                  ? {
                      label: (mediums.find((m: any) => m.id === selectedMedium) as any)?.name,
                      id: selectedMedium,
                    }
                  : null
              }
              isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
              renderOption={(prop, option: any) => (
                <li {...prop} key={option.id}>
                  {option.label}
                </li>
              )}
              getOptionLabel={(option: any) => option?.label || ''}
              minChars={0}
              onChange={(_, value: any) => setSelectedMedium(value?.id || '')}
              size="small"
              sx={{ maxWidth: '248px', width: '100%' }}
            />
          )}
        </Box>
      </Card>
      {selectedMedium ? (
        <CustomizableTable
          tableId="fee-collection-table"
          noDataText={<>Fee Collection Data Not Found </>}
          // isLoading={feeCollectionLoading}
          columns={[
            {
              id: 'name',
              label: 'Name',
              align: 'left',
              isFilter: true,
              minWidth: '300px',
              sticky: true,
              render: (value, row) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'} ({row.grNumber})
                </Typography>
              ),
            },
            {
              id: 'className',
              label: 'Class/Div',
              isFilter: true,
              align: 'left',
              minWidth: '70px',
              render: (value, row) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}-{row.division}
                </Typography>
              ),
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
            },
            {
              id: 'paybleFees',
              label: 'Payble Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value) => `₹ ${formatNumber(value)}`,
            },
            {
              id: 'totalFees',
              label: 'Total Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              minWidth: '120px',
              render: (value) => `₹ ${formatNumber(value)}`,
            },
            {
              id: 'pendingFees',
              label: 'Pending Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              minWidth: '130px',
              render: (value) => `₹ ${formatNumber(value)}`,
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
          data={feeCollectionData?.feeCollectionData || []}
        />
      ) : (
        <EmptyContent title="Please select board and medium to view fee collection data." />
      )}
    </>
  );
};

export default FeeCollectionTable;
