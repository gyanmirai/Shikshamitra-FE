import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { Button } from '@mui/material';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';

const nameOf = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Restricted identity';

const entrySourceLabels: Record<string, string> = {
  ActivatedOnboarding: 'Enrollment activated',
  CompletedOnboarding: 'Onboarding completed',
  LegacyOverride: 'Approved historical entry',
  LegacyNeedsApproval: 'Historical entry pending approval',
};

export const directoryColumns: IColumn[] = [
  {
    id: 'name',
    label: 'Student',
    minWidth: 200,
    isSort: true,
    render: (_value, row) => (
      <Button
        component={RouterLink}
        href={`${studentPaths.records.studentList}?student=${encodeURIComponent(row.studentId)}`}
        color="inherit"
        sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
      >
        {nameOf(row as StudentDirectoryItem)}
      </Button>
    ),
  },
  {
    id: 'grNumber',
    label: 'GR number',
    minWidth: 120,
    isSort: true,
    render: (value, row) => value || row.grNo || '—',
  },
  { id: 'standardName', label: 'Class', minWidth: 110 },
  { id: 'divisionName', label: 'Division', minWidth: 110 },
  { id: 'rollNo', label: 'Roll number', minWidth: 100, render: (value) => value ?? '—' },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    render: (value) => (
      <Label color={value === 'Enrolled' || value === 6 ? 'success' : 'default'}>
        {typeof value === 'number'
          ? ({ 6: 'Active', 7: 'Inactive', 8: 'Left' }[value] ?? 'Unknown')
          : value}
      </Label>
    ),
  },
  {
    id: 'entrySource',
    label: 'Record entry',
    minWidth: 150,
    render: (value) => entrySourceLabels[String(value)] ?? '—',
  },
  {
    id: 'actions',
    label: 'Actions',
    isSort: false,
    isFilter: false,
    align: 'right',
    minWidth: 115,
    sticky: true,
    stickyPosition: 'right',
    excludeFromExport: true,
    render: (_value, row) => (
      <Button
        component={RouterLink}
        href={`${studentPaths.records.studentList}?student=${encodeURIComponent(row.studentId)}`}
        aria-label={`Open profile for ${nameOf(row as StudentDirectoryItem)}`}
      >
        Open profile
      </Button>
    ),
  },
];
