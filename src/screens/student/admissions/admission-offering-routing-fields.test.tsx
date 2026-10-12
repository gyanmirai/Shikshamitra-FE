import type { ComponentProps } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionOfferingRoutingFields } from './admission-offering-routing-fields';

type Props = ComponentProps<typeof AdmissionOfferingRoutingFields>;

function show(props: Partial<Props> = {}) {
  const onChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionOfferingRoutingFields
        values={{ track: 0, entryMode: 0 }}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
    </ThemeProvider>
  );
  return { onChange, onBlur };
}

function select(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}

describe('Admission offering routing fields', () => {
  it('shows one required admission type selector without an entry-mode dropdown', () => {
    show();
    const field = screen.getByRole('combobox', { name: 'Admission type' });
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(
      field.closest('.MuiFormControl-root')?.querySelector('.MuiFormLabel-asterisk')
    ).toHaveTextContent('*');
    expect(field.closest('.MuiGrid-root')).toHaveClass('MuiGrid-grid-xs-12');
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.queryByRole('combobox', { name: 'Starts with' })).not.toBeInTheDocument();
  });

  it.each([
    { label: 'RTE', track: 1 as const },
    { label: 'Management', track: 2 as const },
    { label: 'Staff', track: 3 as const },
  ])('starts registration-first when changing General to $label', ({ label, track }) => {
    const { onChange } = show();
    select('Admission type', label);
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ track, entryMode: 1 });
  });

  it('switches an RTE offering to General with inquiry-first entry', () => {
    const { onChange } = show({ values: { track: 1, entryMode: 1 } });
    select('Admission type', 'General');
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ track: 0, entryMode: 0 });
  });

  it.each([0, 1, 2] as const)(
    'preserves saved Management entry mode %s until the admission type changes',
    (entryMode) => {
      const { onChange } = show({ values: { track: 2, entryMode } });
      expect(screen.getByRole('combobox', { name: 'Admission type' })).toHaveTextContent(
        'Management'
      );
      expect(onChange).not.toHaveBeenCalled();
      select('Admission type', 'Management');
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('locks the admission type when the offering identity is already used or loading', () => {
    const { onChange } = show({ values: { track: 2, entryMode: 0 }, locked: true });
    const field = screen.getByRole('combobox', { name: 'Admission type' });
    expect(field).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseDown(field);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('derives registration-first when changing a legacy Both offering to another special type', () => {
    const { onChange } = show({ values: { track: 2, entryMode: 2 } });
    select('Admission type', 'Staff');
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ track: 3, entryMode: 1 });
  });

  it('renders validation feedback below the admission type and reports its blur', () => {
    const { onBlur } = show({
      values: { track: 2, entryMode: 0 },
      feedback: {
        track: { error: true, helperText: 'Admission type is required' },
      },
    });
    const type = screen.getByRole('combobox', { name: 'Admission type' });
    expect(type).toHaveAttribute('aria-invalid', 'true');
    expect(type.closest('.MuiFormControl-root')).toHaveTextContent('Admission type is required');
    fireEvent.blur(type);
    expect(onBlur).toHaveBeenCalledExactlyOnceWith('track');
  });

  it('keeps routing validation visible beneath Admission type after removing Starts with', () => {
    show({
      feedback: { entryMode: { error: true, helperText: 'RTE must start with registration.' } },
    });
    const type = screen.getByRole('combobox', { name: 'Admission type' });
    expect(type).toHaveAttribute('aria-invalid', 'true');
    expect(type.closest('.MuiFormControl-root')).toHaveTextContent(
      'RTE must start with registration.'
    );
  });
});
