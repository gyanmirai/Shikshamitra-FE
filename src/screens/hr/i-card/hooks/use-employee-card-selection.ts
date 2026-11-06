import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';

import { type EmployeeICardRow, createICardStaffColumns } from '../i-card-staff-columns';

import type { BuilderState } from '../employee-builder-state';

export function useEmployeeCardSelection(
  state: BuilderState,
  setState: Dispatch<SetStateAction<BuilderState>>,
  logoUrl: string
) {
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePageSize, setEmployeePageSize] = useState(25);
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('all');
  const [selectedEmployeesById, setSelectedEmployeesById] = useState<
    Record<string, EmployeeICardRow>
  >({});
  const selectedMediumStageId = state.organization === 'all' ? undefined : state.organization;
  const employeeQuery = {
    page: employeePage,
    pageSize: employeePageSize,
    mediumStageId: selectedMediumStageId,
    status: employeeStatusFilter === 'all' ? undefined : employeeStatusFilter,
    designation: state.designationFilter === 'all' ? undefined : state.designationFilter,
    search: state.employeeSearch.trim() || undefined,
  };
  const {
    data: employeeData,
    isFetching: isFetchingEmployees,
    error: employeeError,
    refetch: retryEmployees,
    tableProps: employeeTableProps,
  } = useHrTableQuery(
    {
      table: 'employee-icard-selection-table',
      query: employeeQuery,
      page: employeePage - 1,
      size: employeePageSize,
      resetPage: () => setEmployeePage(1),
    },
    useGetEmployeeQuery(employeeQuery)
  );
  const employees = (employeeData?.items || []) as EmployeeICardRow[];
  const filteredEmployees = employees;

  const selected = Object.values(selectedEmployeesById);
  const readiness = {
    selected: state.selectedEmployeeIds.length,
    missingPhoto: selected.filter((employee) => !employee.thumbnailPicture).length,
    missingPhone: selected.filter((employee) => !employee.mobileNo).length,
    missingDesignation: selected.filter((employee) => !employee.designation).length,
    missingEmployeeCode: selected.filter((employee) => !employee.employeeIdentifier).length,
    missingLogo: logoUrl ? 0 : 1,
  };

  const designationOptions = Array.from(
    new Set(employees.map((employee) => employee.designation).filter(Boolean) as string[])
  ).map((designation) => ({
    id: designation,
    name: designation,
  }));

  const sampleEmployee = employees[0];
  const selectedPreviewEmployees = state.selectedEmployeeIds
    .map((id) => selectedEmployeesById[id])
    .filter((employee): employee is EmployeeICardRow => Boolean(employee));
  const previewEmployee = selectedPreviewEmployees[0] || sampleEmployee;

  const patchState = (patch: Partial<BuilderState>) => setState((prev) => ({ ...prev, ...patch }));

  const toggleEmployeeSelection = (employee: EmployeeICardRow) => {
    const checked = state.selectedEmployeeIds.includes(employee.id);
    patchState({
      selectedEmployeeIds: checked
        ? state.selectedEmployeeIds.filter((id) => id !== employee.id)
        : [...state.selectedEmployeeIds, employee.id],
    });
    setSelectedEmployeesById((prev) => {
      if (!checked) return { ...prev, [employee.id]: employee };
      const next = { ...prev };
      delete next[employee.id];
      return next;
    });
  };

  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((employee) => state.selectedEmployeeIds.includes(employee.id));

  const someVisibleSelected = filteredEmployees.some((employee) =>
    state.selectedEmployeeIds.includes(employee.id)
  );

  const toggleVisibleSelection = (checked: boolean) => {
    const visibleIds = filteredEmployees.map((employee) => employee.id);
    const visibleById = Object.fromEntries(
      filteredEmployees.map((employee) => [employee.id, employee])
    );
    patchState({
      selectedEmployeeIds: checked
        ? Array.from(new Set([...state.selectedEmployeeIds, ...visibleIds]))
        : state.selectedEmployeeIds.filter((id) => !visibleIds.includes(id)),
    });
    setSelectedEmployeesById((prev) =>
      checked
        ? { ...prev, ...visibleById }
        : Object.fromEntries(Object.entries(prev).filter(([id]) => !visibleIds.includes(id)))
    );
  };

  const employeeColumns = createICardStaffColumns({
    allVisibleSelected,
    someVisibleSelected,
    selectedEmployeeIds: state.selectedEmployeeIds,
    toggleEmployeeSelection,
    toggleVisibleSelection,
  });

  return {
    employeePage,
    setEmployeePage,
    employeePageSize,
    setEmployeePageSize,
    employeeStatusFilter,
    setEmployeeStatusFilter,
    setSelectedEmployeesById,
    employeeData,
    isFetchingEmployees,
    employeeError,
    retryEmployees,
    employeeTableProps,
    readiness,
    designationOptions,
    selectedPreviewEmployees,
    sampleEmployee,
    previewEmployee,
    filteredEmployees,
    employeeColumns,
  };
}
