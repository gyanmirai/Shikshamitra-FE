import { useState } from 'react';
import { it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { StudentSetupFilters } from './student-setup-academic-filters';

function Filters() {
  const [classId, setClass] = useState('');
  const [divisionId, setDivision] = useState('');
  return (
    <StudentSetupFilters
      options={{
        academicYears: [],
        boards: [{ id: 'board-1', name: 'CBSE' }],
        mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
        standards: [
          { id: 'class-1', name: 'Class 1', parentId: 'medium-1' },
          { id: 'class-10', name: 'Class 10', parentId: 'medium-1' },
        ],
        divisions: [
          { id: 'division-1', name: 'A', parentId: 'class-1' },
          { id: 'division-10', name: 'A', parentId: 'class-10' },
        ],
      }}
      selectedBoardId="board-1"
      selectedMediumId="medium-1"
      selectedStandardId={classId}
      selectedDivisionId={divisionId}
      onBoardChange={() => {}}
      onMediumChange={() => {}}
      onStandardChange={(value) => {
        setClass(value);
        setDivision('');
      }}
      onDivisionChange={setDivision}
    />
  );
}

it('offers one Board and Medium without All and multiple classes and divisions with distinct paths', async () => {
  const user = userEvent.setup();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Filters />
    </ThemeProvider>
  );
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  expect(screen.queryByRole('option', { name: 'All boards' })).not.toBeInTheDocument();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('combobox', { name: 'Medium' }));
  expect(screen.queryByRole('option', { name: 'All mediums' })).not.toBeInTheDocument();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('combobox', { name: 'Class' }));
  await user.click(screen.getByRole('option', { name: 'Class 1' }));
  await user.click(screen.getByRole('option', { name: 'Class 10' }));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 1');
  expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 10');
  await user.click(screen.getByRole('combobox', { name: 'Division' }));
  await user.click(screen.getByRole('option', { name: 'Class 1 / A' }));
  await user.click(screen.getByRole('option', { name: 'Class 10 / A' }));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('Class 1 / A');
  expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('Class 10 / A');
});
