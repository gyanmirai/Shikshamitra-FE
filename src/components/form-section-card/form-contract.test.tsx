import { createRef } from 'react';
import { it, vi, expect } from 'vitest';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, TextField } from '@mui/material';
import { render, screen, fireEvent } from '@testing-library/react';

import { FormSectionCard, FormFieldSpacing } from './index';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('keeps the form boundary usable with form events, refs and existing MUI Stack composition', () => {
  const submit = vi.fn((event) => event.preventDefault());
  const ref = createRef<HTMLFormElement>();
  render(
    <FormFieldSpacing component="form" ref={ref} aria-label="Admission fields" onSubmit={submit}>
      <Stack component={FormFieldSpacing} spacing={2}>
        <TextField label="Student name" defaultValue="Aarav" helperText="Use the admission name." />
      </Stack>
    </FormFieldSpacing>
  );
  expect(ref.current).toBe(screen.getByRole('form', { name: 'Admission fields' }));
  expect(screen.getByRole('textbox', { name: 'Student name' })).toHaveValue('Aarav');
  expect(screen.getByText('Use the admission name.')).toBeVisible();
  fireEvent.submit(ref.current!);
  expect(submit).toHaveBeenCalledOnce();
});

it('provides the admission section icons while preserving the existing section-card API', () => {
  expect(GlobalIcons.admissionInterest).toMatch(/^mdi:/);
  expect(GlobalIcons.admissionStudent).toMatch(/^mdi:/);
  expect(GlobalIcons.admissionDetails).toMatch(/^mdi:/);
  render(<FormSectionCard title="Student Details" icon={GlobalIcons.admissionDetails}>
    <span>Existing form content</span>
  </FormSectionCard>);
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(screen.getByText('Existing form content')).toBeVisible();
});
