import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionSiblingRuntimeField } from './admission-sibling-runtime-field';

const lookup = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyGetAdmissionFormOptionsQuery: () => [lookup.load],
}));

describe('sibling lookup with the shared search selector', () => {
  it('keeps the typed query after results arrive and selects a distant student', async () => {
    const onChange = vi.fn();
    lookup.load.mockImplementation((query: { searchTerm?: string }) => ({
      unwrap: () =>
        Promise.resolve(
          query.searchTerm === 'QA'
            ? [{ value: 'student-900', label: 'QA Zoya Shah' }]
            : [{ value: 'student-1', label: 'Aadhya Shah' }]
        ),
    }));
    function TestField() {
      const [value, setValue] = useState('[]');
      return (
        <AdmissionSiblingRuntimeField
          field={{
            code: 'siblings',
            label: 'Sibling students',
            bindingKey: 'Family.SiblingStudentIds',
            fieldType: 7,
            required: false,
            readOnly: false,
          }}
          value={value}
          disabled={false}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <TestField />
      </ThemeProvider>
    );
    const user = userEvent.setup({ delay: null });
    const input = screen.getByRole('combobox', { name: 'Sibling students' });
    await user.click(input);
    await user.type(input, 'QA');
    const option = await screen.findByRole('option', { name: 'QA Zoya Shah' });
    expect(input).toHaveValue('QA');
    expect(lookup.load).toHaveBeenCalledWith({
      sourceKey: 'StudentSiblings',
      searchTerm: 'QA',
      skipCount: 0,
      maxResultCount: 21,
    });
    await user.click(option);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('["student-900"]'));
    expect(screen.getByText('QA Zoya Shah')).toBeInTheDocument();
  });
});
