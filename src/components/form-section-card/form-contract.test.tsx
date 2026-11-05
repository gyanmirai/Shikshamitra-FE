import { createRef } from 'react';
import { it, vi, expect } from 'vitest';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, TextField } from '@mui/material';
import userEvent from '@testing-library/user-event';
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
  render(
    <FormSectionCard title="Student Details" icon={GlobalIcons.admissionDetails}>
      <span>Existing form content</span>
    </FormSectionCard>
  );
  expect(screen.getByRole('heading', { name: 'Student Details' })).toBeVisible();
  expect(screen.getByText('Existing form content')).toBeVisible();
});

it('retains the default icon-only collapse control and independent section actions', async () => {
  const user = userEvent.setup();
  const action = vi.fn();
  render(
    <FormSectionCard
      title="Student Details"
      collapsible
      action={
        <button type="button" onClick={action}>
          Edit
        </button>
      }
    >
      <span>Existing form content</span>
    </FormSectionCard>
  );
  const toggle = screen.getByRole('button', { name: 'Collapse Student Details' });
  expect(toggle).toHaveTextContent('');
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('region')).toHaveAttribute('id', toggle.getAttribute('aria-controls'));
  await user.click(screen.getByRole('button', { name: 'Edit' }));
  expect(action).toHaveBeenCalledOnce();
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  toggle.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: 'Expand Student Details' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
});

it('uses optional visible toggle labels without changing controlled expansion ownership', async () => {
  const user = userEvent.setup();
  const onExpandedChange = vi.fn();
  const section = (expanded: boolean) => (
    <FormSectionCard
      title="Instructions"
      collapsible
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      toggleLabels={{ expand: 'View instructions', collapse: 'Hide instructions' }}
    >
      <span>Full instructions</span>
    </FormSectionCard>
  );
  const { rerender } = render(section(false));
  const toggle = screen.getByRole('button', { name: 'View instructions' });
  expect(toggle).toHaveTextContent('View instructions');
  expect(screen.getByText('Full instructions')).not.toBeVisible();
  toggle.focus();
  await user.keyboard('{Enter}');
  expect(onExpandedChange).toHaveBeenLastCalledWith(true);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  rerender(section(true));
  const hide = screen.getByRole('button', { name: 'Hide instructions' });
  expect(hide).toHaveTextContent('Hide instructions');
  expect(screen.getByRole('region', { name: 'Hide instructions' })).toHaveTextContent(
    'Full instructions'
  );
  hide.focus();
  await user.keyboard(' ');
  expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  expect(hide).toHaveAttribute('aria-expanded', 'true');
});
