'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Tab, Card, Tabs, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import { ADJUSTMENT_TABS, ADJUSTMENT_STATUS_COLORS } from '../constants/adjustmentOptions';

import type { IAdjustmentTableProps } from '../types/adjustment.types';

const AdjustmentTable: React.FC<IAdjustmentTableProps> = ({
  data,
  selectedBoard,
  setSelectedBoard,
  selectedMedium,
  setSelectedMedium,
  onCreateAdjustment,
  onView,
}) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const tabs = useTabs(AdjustmentStatusEnum.Pending);

  useEffect(() => {
    if (currentYear?.boards) {
      setBoards(currentYear.boards);
      setSelectedBoard(currentYear.boards[0]?.id);
      setSelectedMedium(currentYear.boards[0]?.educationMediums[0].id);
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
      ADJUSTMENT_TABS.reduce(
        (acc, tab) => {
          acc[tab.value] = (data || []).filter((item) => item.status === tab.value).length;
          return acc;
        },
        {} as Record<AdjustmentStatusEnum, number>
      ),
    [data]
  );

  const filteredData = useMemo(
    () => (data || []).filter((item) => item.status === tabs.value),
    [data, tabs.value]
  );

  const renderActions = useCallback(
    (params: { row: any }) => {
      const { row } = params;
      return (
        <ThreeDotsActions
          showThreeDots={false}
          showViewIcon
          handleViewClick={() => onView(row)}
          placement="right-top"
          actions={({ popover }: any) => (
            <Box onClick={popover.onClose}>
              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  listStyle: 'none',
                }}
                onClick={() => {
                  onCreateAdjustment(row);
                  popover.onClose();
                }}
              >
                <Iconify icon="mdi:pencil-plus-outline" sx={{ width: 16, height: 16 }} />
                Create Adjustment
              </Box>
            </Box>
          )}
        />
      );
    },
    [onCreateAdjustment, onView]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
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
              formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
            />
            <CustomSelect
              label="Medium"
              options={mediums || []}
              labelKey="name"
              disabled={!selectedBoard}
              valueKey="id"
              value={selectedMedium}
              onChange={(value) => setSelectedMedium(value as string)}
              formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
            />
          </Box>

          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{ '& .MuiTabs-flexContainer': { gap: 2 } }}
          >
            {ADJUSTMENT_TABS.map((tab) => (
              <Tab
                key={tab.value}
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
      </Card>

      <CustomizableTable
        tableId="adjustment-table"
        noDataText={<>No adjustment records found.</>}
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
            width: 180,
            minWidth: 160,
            maxWidth: 220,
            sticky: true,
            render: (value: any, row: any) => (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                  {String(value ?? '').charAt(0)}
                </Avatar>
                <Box>
                  <Box sx={{ fontWeight: 600, fontSize: 13 }}>{value}</Box>
                  {row.studentGrNo && (
                    <Box sx={{ fontSize: 11, color: 'text.disabled' }}>{row.studentGrNo}</Box>
                  )}
                </Box>
              </Box>
            ),
          },
          {
            id: 'className',
            label: 'Class/Div',
            isFilter: true,
            align: 'left',
            width: 120,
            minWidth: 100,
            maxWidth: 150,
            render: (_v: any, row: any) =>
              row.className && row.divisionName
                ? `${row.className} / ${row.divisionName}`
                : row.className || '-',
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            align: 'left',
            isFilter: true,
            filterType: 'number' as any,
            width: 100,
            minWidth: 90,
            maxWidth: 130,
          },
          {
            id: 'totalPaidFees',
            label: 'Total Paid Fees',
            align: 'left',
            isFilter: true,
            filterType: 'number' as any,
            width: 140,
            minWidth: 120,
            maxWidth: 170,
            render: (value: any) => (value != null ? `₹ ${Number(value).toLocaleString()}` : '-'),
          },
          {
            id: 'adjustmentAmount',
            label: 'Adj. Amount',
            align: 'left',
            isFilter: true,
            filterType: 'number' as any,
            width: 130,
            minWidth: 110,
            maxWidth: 160,
            render: (value: any) => (value != null ? `₹ ${Number(value).toLocaleString()}` : '-'),
          },
          {
            id: 'adjustmentType',
            label: 'Adjustment Type',
            align: 'left',
            isFilter: true,
            width: 170,
            minWidth: 150,
            maxWidth: 200,
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            isFilter: true,
            width: 110,
            minWidth: 90,
            maxWidth: 140,
            sticky: true,
            render: (value: any) => {
              const statusKey = value as unknown as AdjustmentStatusEnum;
              const color = (ADJUSTMENT_STATUS_COLORS[statusKey] ?? 'default') as LabelColor;
              return <Label color={color}>{value}</Label>;
            },
          },
          {
            id: 'requestedBy',
            label: 'Requested By',
            align: 'left',
            width: 140,
            minWidth: 120,
            maxWidth: 170,
          },
          {
            id: 'createdAt',
            label: 'Requested Date',
            align: 'left',
            isFilter: true,
            filterType: 'date' as any,
            width: 150,
            minWidth: 130,
            maxWidth: 180,
            render: (value: any) =>
              value
                ? new Date(value).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-',
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            width: 96,
            minWidth: 80,
            sticky: true,
            render: (_v: any, row: any) => renderActions({ row }),
          },
        ]}
        data={filteredData}
      />
    </>
  );
};

export default AdjustmentTable;
