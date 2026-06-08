import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, MenuList, MenuItem } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { DUMMY_FEE_COLLECTION_LIST } from './dummyData';

import type { IFeeData, IFeeTableProps } from './type';

const FeeCollectionTable: React.FC<IFeeTableProps> = ({
  onAddFee,
  onCollectFee,
  onView,
  onGiveAdjustment,
}) => {
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

  const [feeCollectionParams, setFeeCollectionParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
  });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setFeeCollectionParams((pre) => ({ ...pre, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setFeeCollectionParams((pre) => ({ ...pre, page: 1, search }));
  }, []);

  const {
    data: feeCollectionData,
    isLoading: feeCollectionLoading,
    isFetching: feeCollectionFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionListQuery,
    params: {
      AcademicYearId: currentYear?.id,
      BoardId: filterPayload?.boardId,
      EducationMediumId: filterPayload?.educationMediumId,
      StandardId: filterPayload?.standardId,
      DivisionId: filterPayload?.divisionId,
      MaxResultCount: feeCollectionParams.pageSize,
      SkipCount: (feeCollectionParams.page - 1) * feeCollectionParams.pageSize,
      Search: feeCollectionParams.search || undefined,
    },
    options: {
      skip: !currentYear?.id || !isReady,
    },
  });

  useEffect(() => {
    setFeeCollectionParams((prev) => ({ ...prev, page: 1 }));
  }, [selectedBoard, selectedMedium, selectedStandardId, selectedDivisionId]);

  const tableData = useMemo(
    () =>
      feeCollectionData?.items?.map((item: any) => ({
        ...item,
        name: `${item.studentName || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
        standardDivision: item.standardDivision || '-',
        rollNumber: item.rollNumber || '-',
        totalFees: item.totalFees ?? 0,
        paidFees: item.paidFees ?? 0,
        pendingFees: item.pendingFees ?? 0,
        overdueFees: item.overdueFees ?? 0,
        totalCharges: item.totalCharges ?? 0,
        pendingCharges: item.pendingCharges ?? 0,
      })),
    [feeCollectionData?.items]
  );
  return (
    <>
      <Card sx={{ p: 1, mb: 1, overflow: 'visible' }}>
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
      {selectedMedium ? (
        <CustomizableTable
          tableId="fee-collection-table"
          noDataText={<>Fee Collection Data Not Found </>}
          isLoading={feeCollectionLoading || feeCollectionFetching}
          serverSidePagination
          totalCount={feeCollectionData?.totalCount || DUMMY_FEE_COLLECTION_LIST.totalCount}
          onServerPagination={handleServerPagination}
          serverSideSearch
          onServerSearch={handleServerSearch}
          columns={[
            {
              id: 'name',
              label: 'Name(Gr No.)',
              align: 'left',
              isFilter: true,
              width: 200,
              minWidth: 200,
              maxWidth: 500,
              sticky: true,
              // render: (value, row) => (
              //   <Typography variant="caption" fontSize="13px">
              //     {value || '-'} {row.grNumber && `(${row.grNumber})`}
              //   </Typography>
              // ),
            },
            {
              id: 'standardDivision',
              label: 'Class/Div',
              align: 'left',
              width: 150,
              minWidth: 100,
              maxWidth: 150,
            },
            {
              id: 'rollNumber',
              label: 'Roll No.',
              align: 'left',
              isFilter: true,
              width: 100,
              minWidth: 100,
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
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
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
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
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
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
            },
            {
              id: 'overdueFees',
              label: 'Overdue Fees',
              filterType: 'number',
              align: 'left',
              isFilter: true,
              width: 140,
              minWidth: 120,
              maxWidth: 170,
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
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
              render: (value: any) => `₹ ${formatNumber(value ?? 0)}`,
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
              width: 100,
              minWidth: 84,
              maxWidth: 130,
              render(value) {
                const statusValue = value as FeeCollectionStatusType;
                const color = FeeCollectionStatusTypeColors[statusValue] as LabelColor;
                return <Label color={color}>{FeeCollectionStatusType[statusValue]}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              width: 96,
              minWidth: 80,
              align: 'left',
              isSort: false,
              sticky: true,
              isFilter: false,
              render(value, row) {
                return (
                  <MenuList sx={{ display: 'flex', flexDirection: 'row', p: 0, minWidth: 'auto' }}>
                    <CustomTooltip title="Collect Fee">
                      <MenuItem
                        onClick={() =>
                          onCollectFee({ ...row, id: row.studentId ?? row.id } as IFeeData)
                        }
                      >
                        <Iconify
                          icon="fluent:payment-16-regular"
                          sx={{ height: '16px', width: '16px' }}
                        />
                      </MenuItem>
                    </CustomTooltip>
                    <CustomTooltip title="View Details">
                      <MenuItem onClick={() => onView(row as IFeeData)}>
                        <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
                      </MenuItem>
                    </CustomTooltip>
                    <CustomTooltip title="Give Adjustment">
                      <MenuItem
                        onClick={() =>
                          onGiveAdjustment({ ...row, id: row.studentId ?? row.id } as IFeeData)
                        }
                      >
                        <Iconify icon="mdi:adjust" sx={{ height: '16px', width: '16px' }} />
                      </MenuItem>
                    </CustomTooltip>
                  </MenuList>
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
