import type { IColumn } from 'src/components/customizabaleTable/types';

/** Data headings shared by the directory and its synthetic browser contract. */
export const staffDirectoryDataColumns: IColumn[] = [
  { id: 'fullName', label: 'Name', filterType: 'string' },
  { id: 'roleValue', label: 'Role', filterType: 'string' },
  { id: 'dob', label: 'DOB', filterType: 'date' },
  {
    id: 'genderValue',
    label: 'Gender',
    filterType: 'enum',
    enumOptions: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
    ],
  },
  { id: 'doi', label: 'DOJ', filterType: 'date' },
  { id: 'email', label: 'Email', filterType: 'string' },
  { id: 'mobileNo', label: 'Mobile', filterType: 'string' },
  {
    id: 'isTeaching',
    label: 'Group',
    filterType: 'enum',
    enumOptions: [
      { label: 'Teaching', value: true },
      { label: 'Non-teaching', value: false },
    ],
  },
  { id: 'shiftName', label: 'Shift', filterType: 'string' },
  { id: 'organization', label: 'Organization', filterType: 'string' },
  {
    id: 'statusValue',
    label: 'Status',
    filterType: 'enum',
    enumOptions: ['Active', 'Upcoming', 'Inactive', 'Left', 'Retired'].map((value) => ({
      label: value,
      value,
    })),
  },
];

export function withStaffDirectoryCapabilities(columns: IColumn[]): IColumn[] {
  return columns.map((column) => {
    const metadata = staffDirectoryDataColumns.find((field) => field.id === column.id);
    return metadata ? { ...column, ...metadata, isSort: true, isFilter: true } : column;
  });
}
