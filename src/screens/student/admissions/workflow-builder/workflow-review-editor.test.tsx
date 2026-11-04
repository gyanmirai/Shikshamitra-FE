import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderRetiredStage } from './stage-retirement-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

// The five-stage model retires this editor; replacement must be explicit and preserve the draft until confirmed.
it('retires Review settings and requires explicit replacement', async () => {
  const { onSave, stage } = renderRetiredStage(6, 'Review');
  expect(screen.getByText(/This saved stage type is no longer available/)).toBeInTheDocument();
  expect(
    screen.queryByRole('radio', { name: 'Collect a Staff Review and Recommendation' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Collect a Staff Review and Recommendation' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Apply Changes' })).toBeDisabled();
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: 'Stage Type *' }));
  await user.click(screen.getByRole('option', { name: 'Admission Decision' }));
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('textbox', { name: 'Stage Name *' })).toHaveValue(stage.name);
  expect(onSave).not.toHaveBeenCalled();
  await user.click(screen.getByRole('combobox', { name: 'Stage Type *' }));
  await user.click(screen.getByRole('option', { name: 'Admission Decision' }));
  await user.click(screen.getByRole('button', { name: 'Change Type' }));
  await user.click(screen.getByRole('button', { name: 'Apply Changes' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(onSave.mock.calls[0][0]).toMatchObject({
    stageType: 7,
    configurationJson: undefined,
    code: stage.code,
  });
});
