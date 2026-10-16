import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { StudentSetupFilters } from './student-setup-academic-filters';
import StudentSetupTaskNavigation from './student-setup-task-navigation';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({ confirmPopup: { isChanges: false } }),
}));

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

it('keeps the Today switch inside the academic filter card and reports the controlled value', () => {
  const onTodayChange = vi.fn();
  const input = {
    options: {
      academicYears: [],
      boards: [{ id: 'board-1', name: 'CBSE' }],
      mediums: [{ id: 'medium-1', name: 'English', parentId: 'board-1' }],
      standards: [],
      divisions: [],
    },
    selectedBoardId: 'board-1',
    selectedMediumId: 'medium-1',
    selectedStandardId: '',
    selectedDivisionId: '',
    onBoardChange: vi.fn(),
    onMediumChange: vi.fn(),
    onStandardChange: vi.fn(),
    onDivisionChange: vi.fn(),
    onTodayChange,
  };
  const element = (todayOnly: boolean, disabled = false, isLoading = false) => (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentSetupFilters
        {...input}
        todayOnly={todayOnly}
        disabled={disabled}
        isLoading={isLoading}
      />
    </ThemeProvider>
  );
  const { rerender } = render(element(false));
  const today = within(screen.getByTestId('student-setup-academic-filters')).getByRole('switch', {
    name: 'Added today',
  });
  expect(today).not.toBeChecked();
  fireEvent.click(today);
  expect(onTodayChange).toHaveBeenCalledWith(true);

  rerender(element(true));
  expect(today).toBeChecked();
  rerender(element(true, true));
  expect(today).toBeDisabled();
  screen.getAllByRole('combobox').forEach((select) => {
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });
  rerender(element(true, false, true));
  expect(today).toBeDisabled();
});

it('renders task tabs in workflow order as links with accessible panel relationships', () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentSetupTaskNavigation
        activeView="division"
        getViewHref={(view) => `/student/onboarding/setup?view=${view}&board=board-1`}
      />
    </ThemeProvider>
  );
  const tabs = within(screen.getByRole('tablist', { name: 'Student setup tasks' })).getAllByRole(
    'tab'
  );
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    'Setup Status',
    'Division',
    'GR Number',
    'Roll Number',
    'Fees',
    'App Login',
  ]);
  const values = ['readiness', 'division', 'gr-number', 'roll-number', 'fees', 'credentials'];
  tabs.forEach((tab, index) => {
    expect(tab.tagName).toBe('A');
    expect(tab).toHaveAttribute(
      'href',
      `/student/onboarding/setup?view=${values[index]}&board=board-1`
    );
    expect(tab).toHaveAttribute('aria-controls', `student-setup-${values[index]}-panel`);
    expect(tab).toHaveAttribute('aria-selected', values[index] === 'division' ? 'true' : 'false');
  });
});
