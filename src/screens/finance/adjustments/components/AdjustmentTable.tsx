'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Tab, Card, Tabs, Typography, IconButton } from '@mui/material';
import { useGetAdjustmentApplicationsQuery } from 'src/redux/finance/adjustments/adjustmentApi';

import { mapAdjustmentApplicationItem } from '../utils/mapAdjustmentApplication';
import { useFinanceAcademicFilters } from '../../hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from '../../components/FinanceClassDivisionFilter';
import { AdjustmentStatusEnum, type AdjustmentTabEnum } from '../enums/adjustment.enum';
import FinanceAcademicContextFilter from '../../components/FinanceAcademicContextFilter';
import {
  ADJUSTMENT_TABS,
  ADJUSTMENT_STATUS_COLORS,
  formatAdjustmentStatusLabel,
} from '../constants/adjustmentOptions';

import type { IAdjustmentTableProps } from '../types/adjustment.types';

const AdjustmentTable: React.FC<IAdjustmentTableProps> = ({
  activeTab,
  onTabChange,
  tabCounts,
  onCreateAdjustment,
  onView,
  onApprove,
  onReject,
  academicFilters,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const localFilters = useFinanceAcademicFilters();
  const filters = academicFilters || localFilters;

  // Use the finance academic filters hook
  const {
    boards,
    mediums,
    selectedBoard: filterSelectedBoard,
    selectedMedium: filterSelectedMedium,
    selectedStandardId,
    selectedDivisionId,
    isReady,
    classOptions,
    divisionOptions,
    isDivisionDisabled,
    filterPayload,
    setSelectedBoard: setFilterBoard,
    setSelectedMedium: setFilterMedium,
    setSelectedStandardId,
    setSelectedDivisionId,
    classesLoading,
  } = filters;

  const tabs = useTabs(activeTab);

  const listParams = useMemo(() => {
    if (!isReady || !filterPayload || !currentYear?.id) return null;

    const base = {
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      academicYearId: currentYear.id,
      standardId: filterPayload.standardId,
      divisionId: filterPayload.divisionId,
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

  const renderActions = useCallback(
    (params: { row: any }) => {
      const { row } = params;
      const isPending = row.status === AdjustmentStatusEnum.Pending;
      return (
        <Box display="flex" gap={1} alignItems="center">
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
                    onCreateAdjustment();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:pencil-plus-outline" sx={{ width: 16, height: 16 }} />
                  Create Adjustment
                </Box>
              </Box>
            )}
          />
          {isPending && onApprove && (
            <IconButton
              size="small"
              onClick={() => onApprove(row)}
              sx={{
                color: 'success.main',
                '&:hover': { backgroundColor: 'success.lighter' },
              }}
              title="Approve"
            >
              <Iconify icon="mdi:approve" width={20} height={20} />
            </IconButton>
          )}
          {isPending && onReject && (
            <IconButton
              size="small"
              onClick={() => onReject(row)}
              sx={{
                color: 'error.main',
                '&:hover': { backgroundColor: 'error.lighter' },
              }}
              title="Reject"
            >
              <Iconify icon="entypo:cross" width={20} height={20} />
            </IconButton>
          )}
        </Box>
      );
    },
    [onCreateAdjustment, onView, onApprove, onReject]
  );

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FinanceAcademicContextFilter
            boards={boards}
            mediums={mediums}
            selectedBoard={filterSelectedBoard}
            selectedMedium={filterSelectedMedium}
            onBoardChange={setFilterBoard}
            onMediumChange={setFilterMedium}
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
            onChange={(_e, value) => {
              tabs.onChange(_e, value);
              onTabChange(value as AdjustmentTabEnum);
            }}
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
            render: (value: any) => (
              <Typography variant="caption" fontSize="13px">
                {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
              </Typography>
            ),
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
              const statusKey = value as keyof typeof ADJUSTMENT_STATUS_COLORS;
              const color = (ADJUSTMENT_STATUS_COLORS[statusKey] ?? 'default') as LabelColor;
              return (
                <Label color={color}>
                  {typeof value === 'number' ? formatAdjustmentStatusLabel(value) : value}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            align: 'left',
            width: 140,
            minWidth: 120,
            sticky: true,
            render: (_v: any, row: any) => renderActions({ row }),
          },
        ]}
        data={data}
      />
    </>
  );
};

export default AdjustmentTable;
