import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';

import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Alert, Button } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  FeeCollectionStatusType,
  feeInstallmentStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { useFinancePermissions } from '../../hooks/useFinancePermissions';

import type { IFeeData, IFeeTableProps } from './type';

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  onAddFee,
  onCollectFee,
  onView,
  academicFilters,
}) => {
  const access = useFinancePermissions(financePermissions.fees.collections);
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
  } = academicFilters;

  const filterKey = JSON.stringify([
    currentYear?.id,
    selectedBoard,
    selectedMedium,
    selectedStandardId,
    selectedDivisionId,
  ]);

  const [feeCollectionParams, setFeeCollectionParams] = useState<{
    page: number;
    pageSize: number;
    search: string;
    filterKey: string;
    filters: IParams['filters'];
    sorts: IParams['sorts'];
  }>({
    page: 1,
    pageSize: 10,
    search: '',
    filterKey,
    filters: [],
    sorts: [],
  });

  // Reset the request offset immediately when the academic scope changes,
  // before the effect synchronizes pagination state.
  const page = feeCollectionParams.filterKey === filterKey ? feeCollectionParams.page : 1;

  const handleServerPagination = useCallback(
    (nextPage: number, rowsPerPage: number) => {
      setFeeCollectionParams((pre) => ({
        ...pre,
        page: nextPage,
        pageSize: rowsPerPage,
        filterKey,
      }));
    },
    [filterKey]
  );

  const handleServerSearch = useCallback((search: string) => {
    setFeeCollectionParams((pre) => ({ ...pre, page: 1, search }));
  }, []);

  const {
    data: feeCollectionData,
    isLoading: feeCollectionLoading,
    isFetching: feeCollectionFetching,
    isError: feeCollectionError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionListQuery,
    params: {
      AcademicYearId: currentYear?.id,
      BoardId: filterPayload?.boardId,
      EducationMediumId: filterPayload?.educationMediumId,
      StandardId:
        filterPayload?.standardId === 'All Classes' ? undefined : filterPayload?.standardId,
      DivisionId:
        filterPayload?.divisionId === 'All Divisions' ? undefined : filterPayload?.divisionId,
      MaxResultCount: feeCollectionParams.pageSize,
      SkipCount: (page - 1) * feeCollectionParams.pageSize,
      Search: feeCollectionParams.search || undefined,
      Filters: serializeFinanceTableFilters(feeCollectionParams.filters),
      SortBy: feeCollectionParams.sorts[0]?.column,
      SortOrder: feeCollectionParams.sorts[0]?.direction,
    },
    options: {
      skip: !currentYear?.id || !isReady || !access.canView,
    },
  });

  useEffect(() => {
    setFeeCollectionParams((prev) =>
      prev.filterKey === filterKey ? prev : { ...prev, page: 1, filterKey }
    );
  }, [filterKey]);

  const tableData = useMemo(
    () =>
      feeCollectionData?.items?.map((item: any) => ({
        ...item,
        id: item.studentId ?? item.financeFeeAccountId ?? item.id,
        name: `${item.studentName || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
        standardDivision: item.standardDivision || '-',
        rollNumber: item.rollNumber || '-',
        totalFees: item.totalFees ?? 0,
        paidFees: item.paidFees ?? 0,
        // The API's pending balance already includes overdue fees.
        pendingFees: item.pendingFees ?? 0,
        overdueFees: item.overdueFees ?? 0,
        totalConcessionAmount: item.totalConcessionAmount ?? 0,
        totalCharges: item.totalCharges ?? 0,
        pendingCharges: item.pendingCharges ?? 0,
      })),
    [feeCollectionData?.items]
  );
  return (
    <>
      <Card sx={{ p: 1, mb: 1, overflow: 'visible' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
      {selectedMedium ? (
        <CustomizableTable
          getRowAction={(row) =>
            access.canView && row.studentId
              ? {
                label: `Open ${row.name || 'record'}`,
                onClick: () => {
                  onView(row as IFeeData);
                },
              }
              : undefined}
          tableId="fee-collection-table"
          tableTitle="Collections"
          wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText="No students found in this academic scope"
          isLoading={feeCollectionLoading || feeCollectionFetching}
          serverSidePagination
          maxServerRowsPerPage={100}
          page={page - 1}
          rowsPerPage={feeCollectionParams.pageSize}
          totalCount={feeCollectionData?.totalCount ?? 0}
          onServerPagination={handleServerPagination}
          serverSideSearch
          onServerSearch={handleServerSearch}
          serverSideFilter
          serverSideSort
          serverSideSortMode="single"
          filters={feeCollectionParams.filters}
          sorts={feeCollectionParams.sorts}
          onServerFilter={(filters) =>
            setFeeCollectionParams((previous) => ({ ...previous, page: 1, filters }))
          }
          onServerSort={(_column, sorts) =>
            setFeeCollectionParams((previous) => ({ ...previous, page: 1, sorts }))
          }
          errorContent={
            feeCollectionError ? (
              <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
                Could not load collections. Try again or clear the filters.
              </Alert>
            ) : undefined
          }
          columns={[
            {
              id: 'name',
              label: 'Student (GR No.)',
              filterType: 'string',
              align: 'left',
              isFilter: true,
              width: 200,
              minWidth: 200,
              maxWidth: 500,
              sticky: true,
              stickyPosition: 'left',
            },
            {
              id: 'standardDivision',
              label: 'Class/Division',
              filterType: 'string',
              isFilter: true,
              align: 'left',
              width: 180,
              minWidth: 180,
              maxWidth: 150,
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              filterType: 'string',
              align: 'left',
              isFilter: true,
              width: 140,
              minWidth: 140,
              maxWidth: 150,
            },
            {
              id: 'totalFees',
              label: 'Total Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              width: 130,
              minWidth: 110,
              maxWidth: 160,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'paidFees',
              label: 'Paid Fees',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              width: 130,
              minWidth: 110,
              maxWidth: 160,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'pendingFees',
              label: 'Pending Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              width: 140,
              minWidth: 120,
              maxWidth: 170,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'totalConcessionAmount',
              label: 'Total Concession Amount',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              width: 190,
              minWidth: 150,
              maxWidth: 210,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'totalCharges',
              label: 'Total Charges',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              width: 150,
              minWidth: 130,
              maxWidth: 180,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'pendingCharges',
              label: 'Pending Charges',
              align: 'left',
              isFilter: true,
              filterType: 'number',
              width: 150,
              minWidth: 130,
              maxWidth: 180,
              render: (value: any) => formatNumber(value ?? 0, 'INR'),
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: [
                ...[
                  FeeCollectionStatusType.Pending,
                  FeeCollectionStatusType.Paid,
                  FeeCollectionStatusType.Overdue,
                ].map((value) => ({ value, label: feeInstallmentStatusLabel(value) })),
                { label: 'No Fee Assigned', value: FeeCollectionStatusType.NoFeeAssigned },
              ],
              sticky: true,
              stickyPosition: 'right',
              isSort: true,
              width: 150,
              minWidth: 140,
              maxWidth: 180,
              render(value) {
                const statusValue = value as FeeCollectionStatusType;
                const color = FeeCollectionStatusTypeColors[statusValue] as LabelColor;
                return <Label color={color}>{feeInstallmentStatusLabel(statusValue)}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              width: 150,
              minWidth: 140,
              align: 'left',
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              isFilter: false,
              excludeFromExport: true,
              render(value, row) {
                return (
                  <AdaptiveThreeDotsActions
                    directActionLimit={3}
                    placement="right-top"
                    moreLabel={`More actions for ${row.name}`}
                    sx={{ justifyContent: 'flex-start' }}
                    actions={[
                      {
                        id: 'collect',
                        label: `Collect fee for ${row.name}`,
                        icon: 'mdi:cash-plus',
                        disabled:
                          !access.canAdd ||
                          !row.studentId ||
                          row.status === FeeCollectionStatusType.NoFeeAssigned,
                        tooltip:
                          row.status === FeeCollectionStatusType.NoFeeAssigned
                            ? 'No fee structure assigned. Assign a fee structure to collect fees.'
                            : !row.studentId
                              ? 'Collect applicant fees from Applicant 360 or Onboarding.'
                              : undefined,
                        onClick: () =>
                          access.canAdd &&
                          row.studentId &&
                          row.status !== FeeCollectionStatusType.NoFeeAssigned &&
                          onCollectFee({ ...row, id: row.studentId } as IFeeData),
                      },
                    ]}
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      ) : (
        <EmptyContent title="Please select board and medium to view fee collection data." />
      )}
    </>
  );
};

export default FeeCollectionTable;
