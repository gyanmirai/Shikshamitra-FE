import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { StudentFieldPalette } from './student-field-palette';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const fields = [
  {
    key: 'Applicant.FirstName',
    displayName: 'Applicant first name',
    description: 'Student name',
    fieldType: 0 as const,
    readOnly: false,
  },
  {
    key: 'Medical.BloodGroup',
    displayName: 'Blood group',
    description: 'Student blood group',
    fieldType: 6 as const,
    readOnly: false,
  },
  {
    key: 'PreviousSchool.Name',
    displayName: 'Previous school name',
    description: 'Last school',
    fieldType: 0 as const,
    readOnly: false,
  },
];

describe('StudentFieldPalette', () => {
  it('groups linked fields, marks used fields, and filters by group or name', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={fields} usedBindings={['Applicant.FirstName']} onAdd={onAdd} />
      </ThemeProvider>
    );

    expect(screen.getByText('2 available of 3 student fields')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Health and support (1)' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Applicant first name already added' })
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add Blood group' }));
    expect(onAdd).toHaveBeenCalledWith(fields[1]);

    await user.type(
      screen.getByRole('textbox', { name: 'Search student fields' }),
      'previous school'
    );
    expect(screen.getByText('1 matching fields')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Previous school name' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add Blood group' })).not.toBeInTheDocument();
  });

  it('keeps the last option searchable when the catalogue has 100 fields', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const fullCatalogue = Array.from({ length: 100 }, (_, index) => ({
      key: `Identity.Record${index + 1}`,
      displayName: `Student record ${index + 1}`,
      fieldType: 0 as const,
      readOnly: false,
    }));
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={fullCatalogue} onAdd={onAdd} />
      </ThemeProvider>
    );

    expect(screen.getByText('100 available of 100 student fields')).toBeVisible();
    await user.type(screen.getByRole('textbox', { name: 'Search student fields' }), 'record 100');
    expect(screen.getByText('1 matching fields')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add Student record 100' }));
    expect(onAdd).toHaveBeenCalledWith(fullCatalogue[99]);
  });
});
