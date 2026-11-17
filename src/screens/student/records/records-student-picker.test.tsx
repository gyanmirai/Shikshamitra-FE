import { useState } from 'react';
import { vi, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RecordsStudentPicker from './records-student-picker';

vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryQuery: (input: any) => ({
    currentData: {
      items:
        input.studentId === 'ravi'
          ? [
              {
                studentId: 'ravi',
                firstName: 'Ravi',
                lastName: 'Shah',
                grNumber: 'GR-1043',
                standardName: 'Class 5',
                divisionName: 'A',
              },
            ]
          : [],
    },
    isFetching: false,
    isUninitialized: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function SearchHost() {
  const [selectedId, setSelectedId] = useState('ravi');
  return (
    <RecordsStudentPicker
      size="small"
      selectedId={selectedId}
      onSearchInput={() => setSelectedId('')}
      onSelect={(student) => setSelectedId(student?.studentId ?? '')}
    />
  );
}

it('preserves the newly typed name when searching clears the previous student selection', async () => {
  render(<SearchHost />);
  const input = screen.getByRole('combobox', { name: 'Student' });
  await waitFor(() => expect(input).toHaveValue('Ravi Shah · GR-1043'));
  fireEvent.change(input, { target: { value: 'Asha' } });
  await waitFor(() => expect(input).toHaveValue('Asha'));
});
