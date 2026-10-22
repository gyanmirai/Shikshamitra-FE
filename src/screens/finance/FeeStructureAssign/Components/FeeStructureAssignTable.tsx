import type { RootState } from 'src/redux/store';
import type { IData, IParams } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Stack, Alert, Paper, Button, Checkbox, Typography } from '@mui/material';
import { useAssignmentStudentsQuery } from 'src/redux/finance/studentFeeAssignment';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
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
  feeHeadId,
}: IFeeStructureTableProps & { feeHeadId?: string }) {
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
  const [pagination, setPagination] = useState({ page: 1, scope: '' });
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [selected, setSelected] = useState<IFeeStructureData[]>([]);
  const standardId =
    context.selectedStandardId === ALL_CLASS_OPTION.id
      ? undefined
      : context.selectedStandardId || undefined;
  const divisionId =
    context.selectedDivisionId === ALL_DIVISION_OPTION.id
      ? undefined
      : context.selectedDivisionId || undefined;
  const scope = JSON.stringify([
    currentYear?.id,
    feeHeadId,
    standardId,
    divisionId,
    context.selectedBoard,
    context.selectedMedium,
    search,
    filters,
    sorts,
  ]);
  const page = pagination.scope === scope ? pagination.page : 1;
  const query = useAssignmentStudentsQuery(
    {
      academicYearId: currentYear?.id ?? '',
      feeHeadId,
      standardId,
      divisionId,
      boardId: context.selectedBoard,
      educationMediumId: context.selectedMedium,
      search,
      filters: serializeFinanceTableFilters(filters),
      sortBy: sorts[0]?.column,
      sortOrder: sorts[0]?.direction,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !currentYear?.id || !canView || !context.isReady }
  );
  useEffect(() => {
    setPagination({ page: 1, scope });
    setSelected([]);
  }, [scope]);
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
    <Stack sx={{ flex: 1, minHeight: 0, gap: 1 }}>
      {feeHeadId && (
        <Alert
          severity="info"
          action={
            <Button size="small" href={financePaths.fees.structureAssign}>
              Clear fee head filter
            </Button>
          }
        >
          Showing students assigned this fee head in the selected academic year and scope. Open an
          assignment to review its fee breakdown.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
          <FinanceAcademicContextFilter
            boards={context.boards}
            mediums={context.mediums}
            selectedBoard={context.selectedBoard}
            selectedMedium={context.selectedMedium}
            onBoardChange={context.setSelectedBoard}
            onMediumChange={context.setSelectedMedium}
            selectSx={{ width: { xs: 'calc(50% - 4px)', sm: 180 }, minWidth: 0 }}
          />
          <CustomSelect
            label="Class"
            formControlProps={{ sx: { width: { xs: 'calc(50% - 4px)', sm: 160 }, minWidth: 0 } }}
            options={context.classOptions}
            value={context.selectedStandardId}
            onChange={(v) => context.setSelectedStandardId(String(v))}
            labelKey="name"
            valueKey="id"
            isLoading={context.classesLoading}
          />
          <CustomSelect
            label="Division"
            formControlProps={{ sx: { width: { xs: 'calc(50% - 4px)', sm: 140 }, minWidth: 0 } }}
            options={context.divisionOptions}
            value={context.selectedDivisionId}
            onChange={(v) => context.setSelectedDivisionId(String(v))}
            labelKey="name"
            valueKey="id"
            disabled={context.isDivisionDisabled}
          />
        </Stack>
      </Paper>
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
        errorContent={
          query.isError ? (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              Student assignments could not be loaded. Try again or clear the filters.
            </Alert>
          ) : undefined
        }
        wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
        tableContainerProps={{
          sx: { height: '100%', '& .MuiTableCell-body': { verticalAlign: 'middle' } },
          'aria-label': 'Student fee structure assignments',
        }}
        serverSidePagination
        maxServerRowsPerPage={100}
        page={page - 1}
        rowsPerPage={pageSize}
        totalCount={query.currentData?.totalCount ?? 0}
        onServerPagination={(nextPage, size) => {
          setPagination({ page: nextPage, scope });
          setPageSize(size);
          setSelected([]);
        }}
        serverSideSearch
        searchTerm={search}
        serverSideFilter
        serverSideSort
        serverSideSortMode="single"
        filters={filters}
        sorts={sorts}
        onServerFilter={setFilters}
        onServerSort={(_column, nextSorts) => setSorts(nextSorts)}
        searchFieldProps={{
          placeholder: 'Search by name, roll no. or GR no.',
          label: '',
          inputProps: { 'aria-label': 'Search students by name, roll number or GR number' },
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
                  isFilter: false,
                  excludeFromExport: true,
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
                      disabled={query.isFetching || eligible.length === 0}
                      onChange={(_, checked) => setSelected(checked ? eligible : [])}
                    />
                  ),
                  render: (_value: unknown, rawRow: IData) => {
                    const row = rawRow as IFeeStructureData & { isActive?: boolean };
                    return (
                      <Checkbox
                        inputProps={{ 'aria-label': `Select ${row.studentName}` }}
                        checked={selected.some((s) => s.studentId === row.studentId)}
                        disabled={query.isFetching || !row.isActive || row.isFeeStructureAssigned}
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
            width: 220,
            minWidth: 180,
            align: 'left',
            sticky: true,
            stickyPosition: 'left',
            stickyOnMobile: false,
            isSort: true,
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'grNumber',
            label: 'GR No.',
            width: 140,
            minWidth: 130,
            align: 'left',
            isFilter: true,
            isSort: true,
            filterType: 'string',
            render: (value: unknown) => (value ? String(value) : '—'),
          },
          {
            id: 'standardDivision',
            label: 'Class/Division',
            width: 150,
            minWidth: 140,
            align: 'left',
            isFilter: true,
            isSort: true,
            filterType: 'string',
            render: (value: unknown) => (value ? String(value) : '—'),
          },
          {
            id: 'rollNumber',
            label: 'Roll No.',
            width: 130,
            minWidth: 120,
            align: 'left',
            cellSx: { textAlign: 'right', verticalAlign: 'middle' },
            isFilter: true,
            isSort: true,
            filterType: 'number',
            render: (value: unknown) => (value == null ? '—' : String(value)),
          },
          ...[
            { id: 'boardName', label: 'Board' },
            { id: 'mediumName', label: 'Medium' },
            { id: 'stageName', label: 'Academic Stage' },
            { id: 'className', label: 'Class' },
            { id: 'divisionName', label: 'Division' },
          ].map(({ id, label }) => ({
            id,
            label,
            width: 170,
            minWidth: 150,
            align: 'left' as const,
            isFilter: true,
            isSort: true,
            filterType: 'string' as const,
            defaultHidden: true,
            render: (value: unknown) => (value ? String(value) : '—'),
          })),
          {
            id: 'isActive',
            label: 'Enrollment',
            width: 150,
            minWidth: 140,
            align: 'left',
            isSort: true,
            isFilter: true,
            filterType: 'enum',
            enumOptions: [
              { label: 'Active', value: 0 },
              { label: 'Inactive', value: 1 },
            ],
            render: (value: unknown) => (
              <Label color={value ? 'success' : 'warning'}>{value ? 'Active' : 'Inactive'}</Label>
            ),
          },
          {
            id: 'isFeeStructureAssigned',
            label: 'Assignment',
            width: 160,
            minWidth: 140,
            align: 'left',
            sticky: true,
            stickyPosition: 'right',
            stickyOnMobile: false,
            isSort: true,
            isFilter: true,
            filterType: 'enum',
            enumOptions: [
              { label: 'Assigned', value: 0 },
              { label: 'Unassigned', value: 1 },
            ],
            render: (value: unknown) => (
              <Label color={value ? 'success' : 'default'}>
                {value ? 'Assigned' : 'Unassigned'}
              </Label>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            width: 180,
            minWidth: 180,
            align: 'left',
            cellSx: { textAlign: 'left', verticalAlign: 'middle' },
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            sticky: true,
            stickyPosition: 'right',
            render: (_value: unknown, rawRow: IData) => {
              const row = rawRow as IFeeStructureData & { isActive?: boolean };
              if (!row.isFeeStructureAssigned && canAssign)
                return (
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                    aria-label={'Assign fee structure to ' + row.studentName}
                    disabled={query.isFetching || !row.isActive}
                    onClick={() => onAssignStructure(row)}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Assign Fee Structure
                  </Button>
                );
              return row.isFeeStructureAssigned || canAssign ? (
                <AdaptiveThreeDotsActions
                  directActionLimit={2}
                  actions={
                    row.isFeeStructureAssigned
                      ? [
                          {
                            id: 'view',
                            icon: 'mdi:eye-outline',
                            label: `View assignment for ${row.studentName}`,
                            onClick: () => onAssignStructure(row),
                          },
                        ]
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
                  sx={{ justifyContent: 'flex-start' }}
                />
              ) : null;
            },
          },
        ]}
      />
    </Stack>
  );
}
