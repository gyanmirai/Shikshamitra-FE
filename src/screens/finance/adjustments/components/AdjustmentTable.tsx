'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Tab, Card, Tabs, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import { useGetAdjustmentApplicationsQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';

import { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import { mapAdjustmentApplicationItem } from '../utils/mapAdjustmentApplication';
import { ADJUSTMENT_TABS, ADJUSTMENT_STATUS_COLORS } from '../constants/adjustmentOptions';

import type { IAdjustmentTableProps } from '../types/adjustment.types';

const AdjustmentTable: React.FC<IAdjustmentTableProps> = ({ onCreateAdjustment, onView }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    boards,
    mediums,
    selectedBoard,
    selectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard,
    setSelectedMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  } = useFinanceAcademicFilters();

  const tabs = useTabs(AdjustmentStatusEnum.Pending);

  const listParams = useMemo(() => {
    if (!isReady || !filterPayload || !currentYear?.id) return null;

    const base = {
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      academicYearId: currentYear.id,
      standardId: filterPayload.standardId === 'All Classes' ? undefined : filterPayload.standardId,
      divisionId:
        filterPayload.divisionId === 'All Divisions' ? undefined : filterPayload.divisionId,
      page: 1,
      pageSize: 100,
    };

    if (tabs.value === AdjustmentStatusEnum.Pending) {
      return { ...base, status: 0 };
    }
    if (tabs.value === AdjustmentStatusEnum.Rejected) {
      return { ...base, status: 1 };
    }
    return { ...base, completedOnly: true };
  }, [currentYear?.id, filterPayload, isReady, tabs.value]);

  const {
    data: applicationsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdjustmentApplicationsQuery,
    params: listParams,
    options: { skip: !listParams },
  });

  const data = useMemo(
    () => (applicationsData?.items ?? []).map(mapAdjustmentApplicationItem),
    [applicationsData?.items]
  );

  const tabCounts = useMemo(
    () => ({
      [AdjustmentStatusEnum.Pending]: applicationsData?.pendingCount ?? 0,
      [AdjustmentStatusEnum.Approved]:
        (applicationsData?.partiallyAppliedCount ?? 0) + (applicationsData?.appliedCount ?? 0),
      [AdjustmentStatusEnum.Rejected]: applicationsData?.rejectedCount ?? 0,
    }),
    [applicationsData]
  );

  const filteredData = data;

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
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FinanceAcademicContextFilter
            boards={boards}
            mediums={mediums}
            selectedBoard={selectedBoard}
            selectedMedium={selectedMedium}
            onBoardChange={setSelectedBoard}
            onMediumChange={setSelectedMedium}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
          <FinanceClassDivisionFilter
            classOptions={classOptions}
            divisionOptions={divisionOptions}
            selectedStandardId={selectedStandardId}
            selectedDivisionId={selectedDivisionId}
            isDivisionDisabled={isDivisionDisabled}
            onClassChange={setSelectedStandardId}
            onDivisionChange={setSelectedDivisionId}
            classesLoading={classesLoading}
            selectSx={{ maxWidth: '248px', width: '100%' }}
          />
        </Box>
      </Card>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
            }}
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
        isLoading={isLoading || isFetching}
        noDataText={<>No adjustment records found.</>}
        columns={[
          {
            id: 'studentName',
            label: 'Name(Gr No.)',
            align: 'left',
            width: 150,
            minWidth: 150,
            maxWidth: 220,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.grNumber && `(${row.grNumber})`}
              </Typography>
            ),
          },
          {
            id: 'className',
            label: 'Class/Div',
            align: 'left',
            width: 130,
            minWidth: 80,
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
            minWidth: 100,
            maxWidth: 130,
          },
          {
            id: 'totalPaidFees',
            label: 'Total Paid Fees',
            align: 'left',
            isFilter: true,
            filterType: 'number' as any,
            width: 150,
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
            width: 180,
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
