'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Tab, Card, Tabs, Avatar, MenuList, MenuItem } from '@mui/material';

import type { IStudentFeeData, IStudentFeeTableProps } from '../type';

const REFUND_TABS = [
  { label: 'Pending', value: FeeRefundStatusType.Pending, color: 'warning' },
  { label: 'Approved', value: FeeRefundStatusType.Approved, color: 'success' },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected, color: 'error' },
] as const;

const StudentFeeRefundTable: React.FC<IStudentFeeTableProps> = ({
  data,
  onRequestRefund,
  onView,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
}) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const tabs = useTabs(FeeRefundStatusType.Pending);

  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
      setSelectedBoard(currentYear.boards[0].id);
      setSelectedMedium(currentYear.boards[0].educationMediums[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear.boards]);

  useEffect(() => {
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  const tabCounts = useMemo(
    () =>
      REFUND_TABS.reduce(
        (acc, tab) => {
          acc[tab.value] = (data || []).filter((item) => item.status === tab.value).length;
          return acc;
        },
        {} as Record<number, number>
      ),
    [data]
  );

  const filteredData = useMemo(
    () => (data || []).filter((item) => item.status === tabs.value),
    [data, tabs.value]
  );

  // Memoized callback function to render action menu items
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem disabled>
          <Iconify icon="uil:process" sx={{ height: '16px', width: '16px' }} />
          No actions
        </MenuItem>
      </MenuList>
    ),
    []
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
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
              sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}
            >
              {REFUND_TABS.map((tab) => (
                <Tab
                  key={String(tab.value)}
                  value={tab.value}
                  sx={{ fontSize: '12px' }}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color as LabelColor}>{tabCounts[tab.value] ?? 0}</Label>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </Card>

      <CustomizableTable
        tableId="student-fee-table"
        noDataText={<>No student refund fee data found.</>}
        columns={[
          {
            id: 'name',
            label: 'Student Name',
            align: 'left',
            minWidth: 170,
            sticky: true,
            render: (value, row) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={row.avatarUrl} sx={{ width: 32, height: 32 }} />
                {row.name}
              </Box>
            ),
          },
          { id: 'grNo', label: 'GR No.', align: 'left', isFilter: true, minWidth: 80 },
          {
            id: 'rollNo',
            label: 'Roll No.',
            align: 'left',
            isFilter: true,
            filterType: 'number',
            minWidth: 100,
          },
          { id: 'class', label: 'Class', align: 'left', isFilter: true },
          { id: 'division', label: 'Division', align: 'left', isFilter: true },
          { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: 120 },
          {
            id: 'refundAmount',
            label: 'Refund Amount',
            align: 'left',
            minWidth: '150px',
            isFilter: true,
            render: (value) => (value ? `₹ ${value.toLocaleString()}` : '-'),
          },
          {
            id: 'requestDate',
            label: 'Request Date',
            align: 'left',
            minWidth: '160px',
            isFilter: true,
            filterType: 'date',
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: 50,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    onView?.(row as IStudentFeeData);
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={filteredData}
      />
    </>
  );
};

export default StudentFeeRefundTable;
