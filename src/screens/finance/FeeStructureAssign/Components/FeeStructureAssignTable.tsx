import type { RootState } from 'src/redux/store';
import type { IData } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Stack, Alert, Paper, Button, Checkbox, Typography } from '@mui/material';
import { useAssignmentStudentsQuery } from 'src/redux/finance/studentFeeAssignment';
import FinanceAcademicContextFilter from 'src/screens/finance/components/FinanceAcademicContextFilter';
import {
  ALL_CLASS_OPTION,
  ALL_DIVISION_OPTION,
  useFinanceAcademicFilters,
} from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import type { IFeeStructureData, IFeeStructureTableProps } from './type';

export default function FeeStructureAssignTable({
  onAssignStructure,
  onBulkAssign,
}: IFeeStructureTableProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.View`
  );
  const canAssign = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.Add`
  );
  const context = useFinanceAcademicFilters();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<IFeeStructureData[]>([]);
  const standardId =
    context.selectedStandardId === ALL_CLASS_OPTION.id
      ? undefined
      : context.selectedStandardId || undefined;
  const divisionId =
    context.selectedDivisionId === ALL_DIVISION_OPTION.id
      ? undefined
      : context.selectedDivisionId || undefined;
  const query = useAssignmentStudentsQuery(
    {
      academicYearId: currentYear?.id ?? '',
      standardId,
      divisionId,
      boardId: context.selectedBoard,
      educationMediumId: context.selectedMedium,
      search,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !currentYear?.id || !canView || !context.isReady }
  );
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [
    currentYear?.id,
    standardId,
    divisionId,
    context.selectedBoard,
    context.selectedMedium,
    search,
  ]);
  useEffect(() => {
    if (!query.currentData) return;
    const eligibleIds = new Set(
      query.currentData.items
        .filter((student) => student.isActive && !student.isFeeStructureAssigned)
        .map((student) => student.studentId)
    );
    setSelected((previous) => {
      const next = previous.filter((student) => eligibleIds.has(student.studentId));
      return next.length === previous.length ? previous : next;
    });
  }, [query.currentData]);
  const rows = (query.currentData?.items ?? []).map((student) => ({
    ...student,
    id: student.enrollmentId,
  }));
  const eligible = rows.filter((r) => r.isActive && !r.isFeeStructureAssigned);
  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <Typography variant="subtitle2">
        Academic year: {currentYear?.name || 'Select an academic year'}
      </Typography>
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <FinanceAcademicContextFilter
            boards={context.boards}
            mediums={context.mediums}
            selectedBoard={context.selectedBoard}
            selectedMedium={context.selectedMedium}
            onBoardChange={context.setSelectedBoard}
            onMediumChange={context.setSelectedMedium}
            selectSx={{ width: '100%', minWidth: 0 }}
          />
          <CustomSelect
            label="Class"
            options={context.classOptions}
            value={context.selectedStandardId}
            onChange={(v) => context.setSelectedStandardId(String(v))}
            labelKey="name"
            valueKey="id"
            isLoading={context.classesLoading}
          />
          <CustomSelect
            label="Division"
            options={context.divisionOptions}
            value={context.selectedDivisionId}
            onChange={(v) => context.setSelectedDivisionId(String(v))}
            labelKey="name"
            valueKey="id"
            disabled={context.isDivisionDisabled}
          />
        </Stack>
      </Paper>
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={() => query.refetch()}
            >
              Retry
            </Button>
          }
        >
          Student assignments could not be loaded for this year and scope.
        </Alert>
      )}
      {selected.length > 0 && canAssign && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ px: 1 }}
        >
          <Typography variant="body2">
            {selected.length} student{selected.length === 1 ? '' : 's'} selected
          </Typography>
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:account-multiple-plus-outline" />}
            variant="contained"
            onClick={() => onBulkAssign?.(selected, standardId ?? '')}
          >
            Assign structure
          </Button>
          <Button size="small" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </Stack>
      )}
      <CustomizableTable
        tableId="fee-structure-assignment"
        tableTitle="Student fee structure assignments"
        isLoading={query.isFetching}
        data={rows}
        noDataText="No enrolled students in this academic context"
        wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
        tableContainerProps={{
          sx: { height: '100%' },
          'aria-label': 'Student fee structure assignments',
        }}
        serverSidePagination
        maxServerRowsPerPage={100}
        page={page - 1}
        rowsPerPage={pageSize}
        totalCount={query.currentData?.totalCount ?? 0}
        onServerPagination={(nextPage, size) => {
          setPage(nextPage);
          setPageSize(size);
          setSelected([]);
        }}
        serverSideSearch
        searchFieldProps={{
          placeholder: 'Search students by name',
          label: '',
          inputProps: { 'aria-label': 'Search students by name' },
        }}
        onServerSearch={(value) => setSearch(value)}
        columns={[
          ...(canAssign
            ? [
                {
                  id: 'select',
                  label: '',
                  width: 64,
                  isSort: false,
                  renderColumn: () => (
                    <Checkbox
                      inputProps={{
                        'aria-label': 'Select eligible students on this page',
                        'aria-checked':
                          selected.length > 0 && selected.length < eligible.length
                            ? 'mixed'
                            : eligible.length > 0 && selected.length === eligible.length,
                      }}
                      checked={eligible.length > 0 && selected.length === eligible.length}
                      indeterminate={selected.length > 0 && selected.length < eligible.length}
                      disabled={eligible.length === 0}
                      onChange={(_, checked) => setSelected(checked ? eligible : [])}
                    />
                  ),
                  render: (_value: unknown, rawRow: IData) => {
                    const row = rawRow as IFeeStructureData & { isActive?: boolean };
                    return (
                      <Checkbox
                        inputProps={{ 'aria-label': `Select ${row.studentName}` }}
                        checked={selected.some((s) => s.studentId === row.studentId)}
                        disabled={!row.isActive || row.isFeeStructureAssigned}
                        onChange={(_, checked) =>
                          setSelected((previous) =>
                            checked
                              ? [...previous, row]
                              : previous.filter((s) => s.studentId !== row.studentId)
                          )
                        }
                      />
                    );
                  },
                },
              ]
            : []),
          {
            id: 'studentName',
            label: 'Student',
            minWidth: 220,
            isSort: false,
            filterType: 'string',
          },
          {
            id: 'isActive',
            label: 'Enrollment',
            isSort: false,
            isFilter: false,
            render: (value: unknown) => (
              <Label color={value ? 'success' : 'warning'}>
                {value ? 'Active' : 'Inactive — review required'}
              </Label>
            ),
          },
          {
            id: 'isFeeStructureAssigned',
            label: 'Assignment',
            minWidth: 140,
            sticky: true,
            stickyPosition: 'right',
            isSort: false,
            isFilter: false,
            render: (value: unknown) => (
              <Label color={value ? 'success' : 'default'}>
                {value ? 'Assigned' : 'Unassigned'}
              </Label>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            width: 80,
            align: 'right',
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            render: (_value: unknown, rawRow: IData) => {
              const row = rawRow as IFeeStructureData & { isActive?: boolean };
              return row.isFeeStructureAssigned || canAssign ? (
                <ThreeDotsActions
                  showThreeDots={false}
                  showViewIcon={row.isFeeStructureAssigned}
                  viewIcon="mdi:eye-outline"
                  viewLabel={`View assignment for ${row.studentName}`}
                  handleViewClick={() => onAssignStructure(row)}
                  directActions={
                    row.isFeeStructureAssigned
                      ? []
                      : [
                          {
                            id: 'assign',
                            icon: 'mdi:plus',
                            label: `Assign structure to ${row.studentName}`,
                            disabled: !row.isActive,
                            tooltip: row.isActive
                              ? `Assign structure to ${row.studentName}`
                              : 'Activate this student’s enrollment before assigning fees.',
                            onClick: () => onAssignStructure(row),
                          },
                        ]
                  }
                  sx={{ justifyContent: 'flex-end' }}
                />
              ) : null;
            },
          },
        ]}
      />
    </Stack>
  );
}
