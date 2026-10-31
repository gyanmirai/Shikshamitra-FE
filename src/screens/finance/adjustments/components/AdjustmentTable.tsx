'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IParams } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { financePermissions } from 'src/constants/finance-menu';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Tab, Card, Tabs, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetAdjustmentApplicationsQuery } from 'src/redux/finance/adjustments/adjustmentApi';

import FinanceListActionRow from '../../components/FinanceListActionRow';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';
import { serializeFinanceTableFilters } from '../../components/financeTableQuery';
import { mapAdjustmentApplicationItem } from '../utils/mapAdjustmentApplication';
import { useFinanceAcademicFilters } from '../../hooks/useFinanceAcademicFilters';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from '../enums/adjustment.enum';
import FinanceClassDivisionFilter from '../../components/FinanceClassDivisionFilter';
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
  onView,
  onApprove,
  onReject,
  academicFilters,
  primaryAction,
}) => {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
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
  const scope = JSON.stringify([currentYear?.id, filterPayload, tabs.value]);
  const [tableQuery, setTableQuery] = useState({
    scope,
    page: 0,
    pageSize: 10,
    search: '',
    filters: [] as IParams['filters'],
  });
  const page = tableQuery.scope === scope ? tableQuery.page : 0;
  useEffect(() => {
    setTableQuery((previous) =>
      previous.scope === scope ? previous : { ...previous, scope, page: 0 }
    );
  }, [scope]);

  const listParams = useMemo(() => {
    if (!isReady || !filterPayload || !currentYear?.id) return null;

    const base = {
      boardId: filterPayload.boardId,
      educationMediumId: filterPayload.educationMediumId,
      academicYearId: currentYear.id,
      standardId: filterPayload.standardId,
      divisionId: filterPayload.divisionId,
      page: page + 1,
      pageSize: tableQuery.pageSize,
      filter: tableQuery.search || undefined,
      filters: serializeFinanceTableFilters(tableQuery.filters),
    };

    if (tabs.value === AdjustmentTabEnum.Pending) {
      return { ...base, status: 0 };
    }
    if (tabs.value === AdjustmentTabEnum.Rejected) {
      return { ...base, status: 1 };
    }
    return { ...base, completedOnly: true };
  }, [currentYear?.id, filterPayload, isReady, tabs.value, page, tableQuery.pageSize, tableQuery.search, tableQuery.filters]);

  const {
    data: applicationsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdjustmentApplicationsQuery,
    params: listParams,
    options: { skip: !listParams || !access.canView },
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
        <AdaptiveThreeDotsActions
          directActionLimit={3}
          placement="right-top"
          actions={[
            ...(access.canAdd && isPending && onApprove
              ? [
                  {
                    id: 'approve',
                    label: 'Approve',
                    icon: 'mdi:approve',
                    color: 'success.main',
                    onClick: () => onApprove?.(row),
                  },
                ]
              : []),
            ...(access.canAdd && isPending && onReject
              ? [
                  {
                    id: 'reject',
                    label: 'Reject',
                    icon: 'entypo:cross',
                    color: 'error.main',
                    onClick: () => onReject?.(row),
                  },
                ]
              : []),
          ]}
        />
      );
    },
    [access.canAdd, onApprove, onReject]
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
      <FinanceListActionRow action={primaryAction}>
        <Tabs
          variant="scrollable"
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
      </FinanceListActionRow>

      <CustomizableTable
        getRowAction={(row) =>
          access.canView
            ? {
                label: `Open ${row.studentName || 'record'}`,
                onClick: () => {
                  onView(row as Parameters<typeof onView>[0]);
                },
              }
            : undefined
        }
        tableId="adjustment-table"
        tableTitle="Fee adjustments"
        serverSidePagination
        serverSideSearch
        serverSideFilter
        page={page}
        rowsPerPage={tableQuery.pageSize}
        searchTerm={tableQuery.search}
        filters={tableQuery.filters}
        totalCount={applicationsData?.totalCount ?? 0}
        maxServerRowsPerPage={100}
        exportLabel="Export current page"
        exportScope="loaded"
        onServerPagination={(nextPage, pageSize) =>
          setTableQuery((previous) => ({ ...previous, scope, page: nextPage - 1, pageSize }))
        }
        onServerSearch={(search) =>
          setTableQuery((previous) => ({ ...previous, scope, page: 0, search }))
        }
        onServerFilter={(nextFilters) =>
          setTableQuery((previous) => ({ ...previous, scope, page: 0, filters: nextFilters }))
        }
        onClearCriteria={() =>
          setTableQuery((previous) => ({ ...previous, scope, page: 0, search: '', filters: [] }))
        }
        isLoading={isLoading || isFetching}
        noDataText={<>No adjustment records found.</>}
        columns={[
          {
            stickyPosition: 'left',
            id: 'studentName',
            isSort: false,
            label: 'Name(Gr No.)',
            align: 'left',
            width: 150,
            minWidth: 150,
            maxWidth: 220,
            sticky: true,
            render: (value, row) => (
              <Typography variant="caption" fontSize="13px">
                {value || '-'} {row.studentGrNo && `(${row.studentGrNo})`}
              </Typography>
            ),
          },
          {
            id: 'className',
            isSort: false,
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
            isSort: false,
            label: 'Roll No.',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            width: 100,
            minWidth: 100,
            maxWidth: 130,
          },
          {
            id: 'adjustmentAmount',
            isSort: false,
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
            isSort: false,
            label: 'Requested By',
            align: 'left',
            width: 140,
            minWidth: 120,
            maxWidth: 170,
          },
          {
            id: 'createdAt',
            isSort: false,
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
            stickyPosition: 'right',
            id: 'status',
            isSort: false,
            label: 'Status',
            align: 'left',
            isFilter: true,
            filterType: 'string',
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
            stickyPosition: 'right',
            excludeFromExport: true,
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
