import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { StudentAcademic360Table } from './StudentAcademic360Table';

import type { Academic360StudentRow } from '../types';

const student: Academic360StudentRow = {
  studentId: 'student-1',
  studentName: 'Aadhya Badal Gaadhe',
  grNo: '10226',
  rollNo: 1,
};

function renderTable(students = [student]) {
  const onOpenStudent = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentAcademic360Table
        students={students}
        totalCount={students.length}
        page={0}
        rowsPerPage={10}
        searchTerm=""
        isLoading={false}
        isError={false}
        isReady
        onOpenStudent={onOpenStudent}
        onRetry={vi.fn()}
        onPagination={vi.fn()}
        onSearch={vi.fn()}
        onSort={vi.fn()}
      />
    </ThemeProvider>
  );
  return onOpenStudent;
}

describe('Student Academic 360 row navigation', () => {
  it('opens the original student from any data cell and removes the Actions column', () => {
    const onOpenStudent = renderTable();

    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Notify Parent|Open Academic 360/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('No alerts'));

    expect(onOpenStudent).toHaveBeenCalledExactlyOnceWith(student);
    expect(screen.getByRole('row', { name: `Open Academic 360 for ${student.studentName}` }))
      .toHaveAttribute('data-student-id', student.studentId);
  });

  it.each(['Enter', ' '])('opens a focused row using %s', (key) => {
    const onOpenStudent = renderTable();
    const row = screen.getByRole('row', { name: `Open Academic 360 for ${student.studentName}` });
    expect(row).toHaveAttribute('tabindex', '0');
    row.focus();
    fireEvent.keyDown(row, { key });

    expect(onOpenStudent).toHaveBeenCalledExactlyOnceWith(student);
  });

  it('does not open a student without an identifier', () => {
    const onOpenStudent = renderTable([{ studentName: 'Missing identifier' }]);
    const row = screen.getByRole('row', { name: 'Open Academic 360 for Missing identifier' });
    expect(row).toHaveAttribute('tabindex', '-1');
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: 'Enter' });

    expect(onOpenStudent).not.toHaveBeenCalled();
  });

  it('opens students whose identifier is supplied as id', () => {
    const studentWithId = { ...student, studentId: undefined, id: 'student-fallback' };
    const onOpenStudent = renderTable([studentWithId]);
    fireEvent.click(screen.getByText(student.studentName!));

    expect(onOpenStudent).toHaveBeenCalledExactlyOnceWith(studentWithId);
  });
});
