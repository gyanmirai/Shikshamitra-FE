'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/useTabs';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { Cancel, CheckCircle } from '@mui/icons-material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ChargesPaymentStatus } from 'src/enums/fee-charges-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetChargesQuery } from 'src/redux/finance/charge-management/chargeApi';
import { Box, Tab, Tabs, Card, MenuItem, MenuList, Typography } from '@mui/material';

import type { IChargeData } from './type';

const ChargesTable = ({
  onView,
  onEdit,
  onAddCharge,
  onApprove,
  onReject,
  onRemove,
  onRefetch,
}: {
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
  onApprove: (data: IChargeData) => void;
  onReject: (data: IChargeData) => void;
  onRemove: (data: IChargeData) => void;
  onRefetch?: (refetchFn: () => void) => void;
}) => {
  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const tabs = useTabs(ChargesPaymentStatus.Pending);

  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  // Fetch charge data using custom query hook
  const {
    data: chargesData,
    isLoading: chargesLoading,
    isFetching: chargesFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: {
      academicYearId: currentYear?.id,
      boardId: selectedBoard,
      educationMediumId: selectedMedium,
      status: tabs.value,
    },
    options: {
      skip: !selectedBoard || !selectedMedium || !currentYear?.id,
    },
  });
  // State to store the selected student concession data
  // null when no student is selected
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);

    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetch && refetch) {
      // Pass the refetch function to parent
      const refetchHandler = () => {
        refetch();
      };
      onRefetch(refetchHandler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);
  // Tab Counts
  const chargeCounts = useMemo(
    () => ({
      pending:
        chargesData?.items?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Pending)
          ?.length || 0,
      approved:
        chargesData?.items?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Approved)
          ?.length || 0,
      rejected:
        chargesData?.items?.filter((i: IChargeData) => i.status === ChargesPaymentStatus.Rejected)
          ?.length || 0,
    }),
    [chargesData]
  );

  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ChargesPaymentStatus.Pending,
        count: chargeCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ChargesPaymentStatus.Approved,
        count: chargeCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ChargesPaymentStatus.Rejected,
        count: chargeCounts.rejected,
        color: 'error',
      },
    ],
    [chargeCounts]
  );

  // 🔹 Filter Table Data by Selected Tab
  const tableData = useMemo(
    () =>
      chargesData?.items
        ?.filter((i: IChargeData) => i.status === tabs.value)
        ?.map((item: IChargeData) => ({
          ...item,
          amount:
            item.amount !== undefined && item.amount !== null
              ? parseFloat(String(item.amount).replace(/,/g, ''))
              : 0,
          description: item.purposeDescription || '-',
          dueDate: item.dueDate ? dayjs(item.dueDate).format('DD-MM-YYYY') : '-',
        })),
    [chargesData?.items, tabs.value]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isPending = row.status === ChargesPaymentStatus.Pending;
      return (
        <MenuList>
          {row.status === ChargesPaymentStatus.Rejected ? (
            <MenuItem
              onClick={() => {
                onApprove(row as IChargeData);
                pop.onClose();
              }}
            >
              <CheckCircle sx={{ width: '20px', height: '20px', color: 'success.main' }} /> Approve
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                onReject(row as IChargeData);
                pop.onClose();
              }}
            >
              <Cancel sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Reject
            </MenuItem>
          )}
        </MenuList>
      );
    },
    [onApprove, onReject]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1.5, pt: 1.5, pb: 1.5 }}>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
            />
            <CustomSelect
              label="Medium"
              options={mediums || []}
              labelKey="name"
              disabled={!selectedBoard}
              valueKey="id"
              value={selectedMedium}
              onChange={(value) => setSelectedMedium(value as string)}
              formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 2 },
                flexGrow: 1,
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  sx={{ fontSize: '12px' }}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color as LabelColor}>{tab.count}</Label>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Card>

      <CustomizableTable
        tableId="charges-table"
        isLoading={chargesLoading || chargesFetching}
        noDataText={
          <>
            No Charges Found Select the Board and Medium to view charges
            <Box
              onClick={onAddCharge}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Charge
            </Box>
          </>
        }
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            isFilter: true,
            minWidth: 140,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} ({row.grNumber})
              </Typography>
            ),
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            align: 'left',
            minWidth: 90,
            filterType: 'number',
            isFilter: true,
          },
          {
            id: 'standardName',
            label: 'Class/Div',
            align: 'left',
            minWidth: 100,
            isFilter: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {row.standardName
                  ? `${row.standardName}${row.divisionName ? ` - ${row.divisionName}` : ''}`
                  : '-'}
              </Typography>
            ),
          },
          {
            id: 'categoryName',
            label: 'Charge Category',
            align: 'left',
            isFilter: true,
            minWidth: 160,
          },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            align: 'left',
            isFilter: true,
            render: (value) => `₹ ${parseFloat(value).toLocaleString()}`,
          },
          {
            id: 'description',
            label: 'Description',
            align: 'left',
            render: (value) => (
              <Typography
                variant="caption"
                fontSize="13px"
                sx={{
                  maxWidth: 250,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {value || '-'}
              </Typography>
            ),
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: '110px',
            // render: (value) => (
            //   <Typography fontSize="13px">
            //     {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
            //   </Typography>
            // ),
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isSort: false,
            isFilter: false,
            minWidth: 40,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon={row.status === 0}
                  showEditIcon={row.status === 0}
                  showThreeDots={false}
                  showDeleteIcon={row.status === 0}
                  handleDeleteClick={() => onRemove(row as IChargeData)}
                  handleViewClick={() => onView(row as IChargeData)}
                  handleEditClick={() => onEdit(row as IChargeData)}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
    </>
  );
};

export default ChargesTable;
