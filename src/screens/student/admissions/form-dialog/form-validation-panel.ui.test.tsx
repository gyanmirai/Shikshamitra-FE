import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { FormValidationPanel } from './form-validation-panel';
import { getBlankAdmissionFormInitialValues } from './form-dialog-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormSystemFieldsQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

it('makes a section check actionable and closes the checks popover after selecting its exact target', async () => {
  const form = getBlankAdmissionFormInitialValues();
  form.sections[0].stepId = 'empty-step';
  const onSelectIssue = vi.fn();
  render(<FormValidationPanel form={form} onSelectIssue={onSelectIssue} />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /checks? to review/ }));
  await user.click(screen.getByRole('button', { name: /has no fields/ }));
  expect(onSelectIssue).toHaveBeenCalledWith(
    expect.objectContaining({
      kind: 'section',
      sectionId: form.sections[0].id,
      stepId: 'empty-step',
    })
  );
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: /has no fields/ })).not.toBeInTheDocument()
  );
});

it('keeps checks without a field, section or step destination as guidance', async () => {
  const form = getBlankAdmissionFormInitialValues();
  form.sections = [];
  render(<FormValidationPanel form={form} onSelectIssue={vi.fn()} />);
  await userEvent.setup().click(screen.getByRole('button', { name: /checks? to review/ }));
  expect(screen.getByText('Add at least one section.')).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Add at least one section.' })
  ).not.toBeInTheDocument();
});
