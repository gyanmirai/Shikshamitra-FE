import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { newReportRequest } from '../types';
import { InstituteAiDrawer } from './report-ai';

import type { AiPlanResult } from '../types';

const workflow = vi.hoisted(() => ({
  plan: null as AiPlanResult | null,
  preview: null,
  busy: false,
  error: '',
  stage: null,
  submit: vi.fn(),
  generate: vi.fn(),
  reset: vi.fn(),
}));
vi.mock('../hooks/use-ai-report', () => ({ useAiReport: () => workflow }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/academic/curriculum-management/reports/AiReportActivity', () => ({
  AiReportActivity: () => null,
}));
vi.mock('src/screens/academic/curriculum-management/reports/AiReportClarification', () => ({
  AiReportClarification: () => null,
}));
vi.mock('src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable', () => ({
  CurriculumReportPreviewTable: () => null,
}));

const title = 'Generate Report With ShikshaMitra AI';
function Fixture({ close }: { close: () => void }) {
  const [open, setOpen] = useState(true);
  return open ? (
    <InstituteAiDrawer
      permittedReportTypes={['rooms']}
      onQueued={vi.fn()}
      onClose={() => {
        setOpen(false);
        close();
      }}
    />
  ) : null;
}
function setup() {
  const close = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Fixture close={close} />
    </ThemeProvider>
  );
  return close;
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('confirm', vi.fn());
  Object.assign(workflow, { plan: null, busy: false, preview: null, error: '', stage: null });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['footer', 'header', 'Escape'])(
  'preserves the report draft on %s close until discard',
  async (control) => {
    const close = setup();
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /What report would you like/ }), {
        target: { value: 'UI review draft' },
      });
    });
    const leave = () => {
      if (control === 'Escape')
        fireEvent.keyDown(screen.getByRole('dialog', { name: title }), { key: 'Escape' });
      else
        fireEvent.click(
          screen.getByRole('button', {
            name: control === 'footer' ? 'Close' : `Close ${title}`,
          })
        );
    };
    leave();
    expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: /What report would you like/ })).toHaveValue(
      'UI review draft'
    );
    expect(close).not.toHaveBeenCalled();
    leave();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(close).toHaveBeenCalledOnce();
    expect(workflow.submit).not.toHaveBeenCalled();
    expect(workflow.generate).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
  }
);

it('guards a prepared plan even when the prompt form is clean', () => {
  workflow.plan = {
    status: 'Ready',
    summary: 'Rooms report plan',
    plan: newReportRequest('rooms'),
    approvalToken: 'review-token',
    clarificationQuestions: [],
  };
  const close = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByText('Rooms report plan')).toBeVisible();
  expect(close).not.toHaveBeenCalled();
  expect(workflow.reset).not.toHaveBeenCalled();
  expect(workflow.generate).not.toHaveBeenCalled();
});

it('closes an unchanged report request without prompting', () => {
  const close = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(close).toHaveBeenCalledOnce();
  expect(window.confirm).not.toHaveBeenCalled();
});

it('locks footer, header and Escape while the workflow is busy', () => {
  workflow.busy = true;
  const close = setup();
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: `Close ${title}` })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog', { name: title }), { key: 'Escape' });
  expect(close).not.toHaveBeenCalled();
  expect(workflow.generate).not.toHaveBeenCalled();
});
