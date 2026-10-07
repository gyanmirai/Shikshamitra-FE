import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
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
  it('explains captured admission fields and keeps previous school fields available', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onAddSection = vi.fn();
    const catalogue = [
      'Preference.Board',
      'Preference.Medium',
      'Preference.Class',
      'Preference.Campus',
      'PreviousSchool.LastClass',
    ].map((key) => ({
      key,
      displayName: key,
      fieldType: 0 as const,
      readOnly: false,
      description: '',
    }));
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={catalogue} onAdd={onAdd} onAddSection={onAddSection} />
      </ThemeProvider>
    );
    expect(screen.getByRole('note')).toHaveTextContent('No need to add them again');
    await user.click(screen.getByRole('button', { name: 'Admission preferences (4)' }));
    expect(
      screen.getByRole('button', { name: 'Preference.Class captured in inquiry' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Add Admission preferences section' }));
    expect(onAddSection).toHaveBeenCalledWith('Admission preferences', [catalogue[3]]);
    await user.type(screen.getByRole('textbox', { name: 'Search student fields' }), 'lastclass');
    await user.click(screen.getByRole('button', { name: 'Add PreviousSchool.LastClass' }));
    expect(onAdd).toHaveBeenCalledWith(catalogue[4]);
  });
  it('keeps address packs inside the related expandable category', async () => {
    const user = userEvent.setup();
    const onAddSection = vi.fn();
    const addressFields = ['Address.Country', 'Address.State', 'PermanentAddress.Country'].map(
      (key) => ({
        key,
        displayName: key,
        description: '',
        fieldType: 0 as const,
        readOnly: false,
      })
    );
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette
          fields={addressFields}
          usedBindings={['PermanentAddress.Country']}
          onAdd={vi.fn()}
          onAddSection={onAddSection}
        />
      </ThemeProvider>
    );
    expect(screen.queryByRole('button', { name: 'Current address pack' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Contact and addresses (3)' }));
    expect(screen.getByRole('button', { name: 'Permanent address pack' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Current address pack' }));
    expect(onAddSection).toHaveBeenCalledWith('Current address', addressFields.slice(0, 2));
  });
  it('groups linked fields, marks used fields, and filters by group or name', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onAddSection = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette
          fields={fields}
          usedBindings={['Applicant.FirstName']}
          onAdd={onAdd}
          onAddSection={onAddSection}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('2 available of 3 student fields')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Health and support (1)' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add Blood group' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Health and support section' }));
    expect(onAddSection).toHaveBeenCalledWith('Health and support', [fields[1]]);
    await user.click(screen.getByRole('button', { name: 'Health and support (1)' }));
    await user.click(screen.getByRole('button', { name: 'Student profile (1)' }));
    expect(
      screen.getByRole('button', { name: 'Applicant first name already added' })
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add Blood group' }));
    expect(onAdd).toHaveBeenCalledWith(fields[1]);

    const search = screen.getByRole('textbox', { name: 'Search student fields' });
    const label = search.closest('.MuiFormControl-root')?.querySelector('label');
    expect(label).toHaveAttribute('data-shrink', 'false');
    await user.click(search);
    expect(label).toHaveAttribute('data-shrink', 'false');
    await user.type(search, 'previous school');
    expect(label).toHaveAttribute('data-shrink', 'true');
    expect(screen.getByText('1 matching fields')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Previous school name' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add Blood group' })).not.toBeInTheDocument();
    await user.clear(search);
    expect(label).toHaveAttribute('data-shrink', 'false');
    expect(screen.getByText('2 available of 3 student fields')).toBeVisible();
  });

  it('keeps the last option searchable when the catalogue has 100 fields', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const fullCatalogue = Array.from({ length: 100 }, (_, index) => ({
      key: `Identity.Record${index + 1}`,
      displayName: `Student record ${index + 1}`,
      description: `Student record ${index + 1}`,
      fieldType: 0 as const,
      readOnly: false,
    }));
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={fullCatalogue} onAdd={onAdd} />
      </ThemeProvider>
    );

    expect(screen.getByText('100 available of 100 student fields')).toBeVisible();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search student fields' }), {
      target: { value: 'record 100' },
    });
    expect(screen.getByText('1 matching fields')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Add Student record 100' }));
    expect(onAdd).toHaveBeenCalledWith(fullCatalogue[99]);
  });

  it('adds the full category when the user clicks its plus after searching', async () => {
    const user = userEvent.setup();
    const onAddSection = vi.fn();
    const healthFields = [
      fields[1],
      {
        key: 'Medical.Allergies',
        displayName: 'Allergies',
        description: 'Student allergies',
        fieldType: 0 as const,
        readOnly: false,
      },
    ];
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={healthFields} onAdd={vi.fn()} onAddSection={onAddSection} />
      </ThemeProvider>
    );

    await user.type(screen.getByRole('textbox', { name: 'Search student fields' }), 'blood');
    await user.click(screen.getByRole('button', { name: 'Add Health and support section' }));
    expect(onAddSection).toHaveBeenCalledWith('Health and support', healthFields);
    expect(screen.getByRole('textbox', { name: 'Search student fields' })).toHaveValue('');
  });

  it('shows distinct loading, error, and empty catalogue states', () => {
    const { rerender } = render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={[]} loading onAdd={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.getByText('Loading student fields…')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Search student fields' })).toBeDisabled();

    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={[]} error onAdd={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.getByText('Student fields unavailable')).toBeVisible();

    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentFieldPalette fields={[]} onAdd={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.getByText('No student fields available')).toBeVisible();
  });
});
