import type {
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fireEvent, render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { ApplicationProgressCard } from './application-progress-card';

const stages: AdmissionApplicationStage[] = Array.from({ length: 8 }, (_, index) => ({
  id: `stage-${index + 1}`,
  definitionStageId: `definition-${index + 1}`,
  code: `STAGE_${index + 1}`,
  name:
    index === 3
      ? 'A very long stage name supplied by the published school admission workflow'
      : `Configured stage ${index + 1}`,
  stageType: 11,
  displayOrder: index + 1,
  status: index < 3 ? 2 : index === 3 ? 1 : 0,
  allowManualSkip: false,
}));

const workflow: AdmissionApplicationWorkflow = {
  workflowDefinitionId: 'workflow-1',
  status: 0,
  startedAt: '2026-09-18T08:00:00Z',
  currentStageInstanceId: 'stage-4',
  stages,
  availableTransitions: [
    {
      id: 'transition-1',
      toStageDefinitionId: 'definition-5',
      toStageInstanceId: 'stage-5',
      toStageName: 'Configured stage 5',
      priority: 1,
      isDefault: true,
    },
  ],
  history: [],
};

const renderCard = (canOverride: boolean, onOverride = vi.fn()) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationProgressCard
        workflow={workflow}
        currentStage={stages[3]}
        canOverride={canOverride}
        onOverride={onOverride}
      />
    </ThemeProvider>
  );

describe('ApplicationProgressCard', () => {
  it('shows a compact mobile summary and expands the complete configured journey', () => {
    renderCard(false);

    const summary = screen.getByRole('button', { name: /Step 4 of 8/ });
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    expect(summary).toHaveTextContent('View journey');

    fireEvent.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText(/published school admission workflow/).length).toBeGreaterThan(0);
  });

  it('preserves the permission-controlled override action in the journey area', () => {
    const onOverride = vi.fn();
    const { unmount } = renderCard(false, onOverride);
    fireEvent.click(screen.getByRole('button', { name: /Step 4 of 8/ }));
    expect(screen.queryByRole('button', { name: 'Override route' })).not.toBeInTheDocument();
    unmount();

    renderCard(true, onOverride);
    fireEvent.click(screen.getByRole('button', { name: /Step 4 of 8/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Override route' }));
    expect(onOverride).toHaveBeenCalledOnce();
  });
});
