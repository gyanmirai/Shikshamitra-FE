import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Card, Button, Checkbox, MenuList, MenuItem } from '@mui/material';
import { useGetFeeCollectionListQuery } from 'src/redux/feeCollection/feeCollection';
import FinanceClassDivisionFilter from 'src/screens/finance/components/FinanceClassDivisionFilter';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  ALL_CLASS_OPTION,
  ALL_DIVISION_OPTION,
  useFinanceAcademicFilters,
} from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusOptions,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IFeeStructureData, IFeeStructureTableProps } from './type';

const FeeStructureAssignTable: React.FC<IFeeStructureTableProps> = ({
  onAssignStructure,
  onEdit,
  onBulkAssign,
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

  const [feeStructureParams, setFeeStructureParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
  });

  const [selectedStudents, setSelectedStudents] = useState<IFeeStructureData[]>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setFeeStructureParams((pre) => ({ ...pre, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setFeeStructureParams((pre) => ({ ...pre, page: 1, search }));
  }, []);

  // Filter out "All" options for class and division
  const filteredClassOptions = useMemo(
    () => classOptions.filter((opt) => opt.id !== ALL_CLASS_OPTION.id),
    [classOptions]
  );

  const filteredDivisionOptions = useMemo(
    () => divisionOptions.filter((opt) => opt.id !== ALL_DIVISION_OPTION.id),
    [divisionOptions]
  );

  const {
    data: feeStructureData,
    isLoading: feeStructureLoading,
    isFetching: feeStructureFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCollectionListQuery,
    params: {
      AcademicYearId: currentYear?.id,
      BoardId: filterPayload?.boardId,
      EducationMediumId: filterPayload?.educationMediumId,
      StandardId: filterPayload?.standardId,
      DivisionId: filterPayload?.divisionId,
      MaxResultCount: feeStructureParams.pageSize,
      SkipCount: (feeStructureParams.page - 1) * feeStructureParams.pageSize,
      Search: feeStructureParams.search || undefined,
    },
    options: {
      skip:
        !currentYear?.id ||
        !isReady ||
        !selectedStandardId ||
        !selectedDivisionId ||
        selectedStandardId === ALL_CLASS_OPTION.id ||
        selectedDivisionId === ALL_DIVISION_OPTION.id,
    },
  });

  useEffect(() => {
    setFeeStructureParams((prev) => ({ ...prev, page: 1 }));
    setSelectedStudents([]);
  }, [selectedBoard, selectedMedium, selectedStandardId, selectedDivisionId]);

  const tableData = useMemo(
    () =>
      feeStructureData?.items?.map((item: any) => ({
        ...item,
        id: item.studentId,
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
    [feeStructureData?.items]
  );

  const isReadyToDisplay =
    selectedMedium &&
    selectedStandardId &&
    selectedDivisionId &&
    selectedStandardId !== ALL_CLASS_OPTION.id &&
    selectedDivisionId !== ALL_DIVISION_OPTION.id;

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
            classOptions={filteredClassOptions}
            divisionOptions={filteredDivisionOptions}
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

      {selectedStudents.length > 0 && onBulkAssign && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:file-document-outline" />}
            onClick={() => onBulkAssign(selectedStudents)}
            size="small"
          >
            Assign Structure ({selectedStudents.length})
          </Button>
        </Box>
      )}

      {isReadyToDisplay ? (
        <CustomizableTable
          tableId="fee-structure-assign-table"
          noDataText={<>Fee Structure Assignment Data Not Found </>}
          isLoading={feeStructureLoading || feeStructureFetching}
          serverSidePagination
          totalCount={feeStructureData?.totalCount || 0}
          onServerPagination={handleServerPagination}
          serverSideSearch
          onServerSearch={handleServerSearch}
          columns={[
            {
              id: 'checkBox',
              align: 'center',
              minWidth: '60px',
              isSort: false,
              sticky: true,
              isFilter: false,
              label: '',
              renderColumn() {
                return (
                  <Checkbox
                    checked={
                      tableData?.length > 0 && selectedStudents?.length === tableData?.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents((tableData as IFeeStructureData[]) || []);
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                  />
                );
              },
              render(value, row) {
                return (
                  <Checkbox
                    checked={selectedStudents.some((i: any) => i.id === row.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, row as IFeeStructureData]);
                      } else {
                        setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                      }
                    }}
                  />
                );
              },
            },
            {
              id: 'name',
              label: 'Name(Gr No.)',
              align: 'left',
              isFilter: true,
              width: 200,
              minWidth: 200,
              maxWidth: 500,
              sticky: true,
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
                    <CustomTooltip title="Assign/Update Structure">
                      <MenuItem
                        onClick={() =>
                          onAssignStructure({
                            ...row,
                            id: row.studentId ?? row.id,
                          } as IFeeStructureData)
                        }
                      >
                        <Iconify
                          icon="mdi:file-document-outline"
                          sx={{ height: '16px', width: '16px' }}
                        />
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
        <EmptyContent title="Please select board, medium, class and division to view students." />
      )}
    </>
  );
};

export default FeeStructureAssignTable;
