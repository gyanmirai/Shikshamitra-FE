import type { ReactNode } from 'react';
import type {
  House,
  HouseQuery,
  HouseStudent,
} from 'src/redux/student/house-management/house-management-types';

import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import {
  useLazyGetHouseStudentsQuery,
  useLazyGetManagedHousesQuery,
} from 'src/redux/student/house-management/house-management-api';

const pageSize = 25;
type HousePickerProps = {
  academicMediumId: string;
  value: House | null;
  onChange: (house: House | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
};
export function HousePicker({
  academicMediumId,
  value,
  onChange,
  disabled,
  label = 'House',
  required,
  error,
  helperText,
}: HousePickerProps) {
  const [getHouses] = useLazyGetManagedHousesQuery();
  const fetchOptions = async (filter: string, page: number) => {
    if (!academicMediumId) return { data: [], hasMore: false };
    const response = await getHouses({
      academicMediumId,
      filter,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
      sorting: 'name asc',
    }).unwrap();
    return { data: response.items, hasMore: page * pageSize < response.totalCount };
  };
  return (
    <PaginatedSearchSelect<House>
      key={academicMediumId}
      label={label}
      name="houseId"
      value={value}
      onChange={(_, option) => onChange(option)}
      fetchOptions={fetchOptions}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      filterOptions={(options) => options}
      minChars={2}
      debounceMs={400}
      loadingLabel="Loading houses"
      placeholder="Search houses"
      size="small"
      fullWidth
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled || !academicMediumId}
    />
  );
}
export function LeaderStudentPicker({
  input,
  value,
  onChange,
  disabled,
}: {
  input: HouseQuery;
  value: HouseStudent | null;
  onChange: (student: HouseStudent | null) => void;
  disabled: boolean;
}) {
  const [getStudents] = useLazyGetHouseStudentsQuery();
  const scopeKey = JSON.stringify([
    input.academicMediumId,
    input.standardId,
    input.divisionId,
    input.houseId,
    input.unassignedOnly,
  ]);
  const fetchOptions = async (filter: string, page: number) => {
    if (!input.academicMediumId) return { data: [], hasMore: false };
    const response = await getStudents({
      ...input,
      filter,
      skipCount: (page - 1) * pageSize,
      maxResultCount: pageSize,
      sorting: 'studentName asc',
    }).unwrap();
    return { data: response.items, hasMore: page * pageSize < response.totalCount };
  };
  return (
    <PaginatedSearchSelect<HouseStudent>
      key={scopeKey}
      label="Leader"
      name="leaderEnrollmentId"
      value={value}
      onChange={(_, option) => onChange(option)}
      fetchOptions={fetchOptions}
      getOptionLabel={(option) =>
        `${option.studentName} · ${option.standardName}${option.divisionName ? ` / ${option.divisionName}` : ''}${option.admissionNumber ? ` · GR ${option.admissionNumber}` : ''}`
      }
      getOptionKey={(option) => option.enrollmentId}
      isOptionEqualToValue={(option, selected) => option.enrollmentId === selected.enrollmentId}
      filterOptions={(options) => options}
      minChars={2}
      debounceMs={400}
      loadingLabel="Loading eligible students"
      placeholder="Search eligible students"
      helperText="Leave empty to keep the position vacant."
      size="small"
      fullWidth
      disabled={disabled || !input.academicMediumId}
    />
  );
}
