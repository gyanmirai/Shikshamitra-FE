import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, fireEvent } from '@testing-library/react';

import { ApplicationStageTabs } from './application-stage-tabs';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

const stages = [
  { id: 'fee', name: 'Fee', displayOrder: 3, stageType: 4, status: 0 },
  { id: 'form', name: 'Application form', displayOrder: 1, stageType: 1, status: 2 },
  { id: 'assessment', name: 'Assessment', displayOrder: 2, stageType: 2, status: 1 },
  { id: 'decision', name: 'Decision', displayOrder: 4, stageType: 7, status: 3 },
] as AdmissionApplicationStage[];

it('shows configured stage names in order without icons and retains accessible status labels', () => {
  renderDocumentUi(
    <ApplicationStageTabs
      stages={stages}
      selectedStageId="assessment"
      currentStageId="assessment"
      busy={false}
      onChange={vi.fn()}
    />
  );
  const tabs = screen.getAllByRole('tab');
  expect(tabs.map((tab) => tab.textContent)).toEqual([
    'Application form',
    'Assessment',
    'Fee',
    'Decision',
  ]);
  expect(tabs.map((tab) => tab.getAttribute('aria-label'))).toEqual([
    'Application form, Completed',
    'Assessment, Current step',
    'Fee, Not started',
    'Decision, Skipped',
  ]);
  tabs.forEach((tab) => {
    expect(tab.querySelector('svg, .MuiTab-iconWrapper')).toBeNull();
    expect(getComputedStyle(tab).minHeight).toBe('44px');
  });
  expect(stages.map((stage) => stage.id)).toEqual(['fee', 'form', 'assessment', 'decision']);
});

it('allows recorded-stage review while preventing future-stage navigation', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  renderDocumentUi(
    <ApplicationStageTabs
      stages={stages}
      selectedStageId="assessment"
      currentStageId="assessment"
      busy={false}
      onChange={onChange}
    />
  );
  expect(screen.getByRole('tab', { name: 'Assessment, Current step' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(screen.getByRole('tab', { name: 'Fee, Not started' })).toBeDisabled();
  fireEvent.click(screen.getByRole('tab', { name: 'Fee, Not started' }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole('tab', { name: 'Application form, Completed' }));
  expect(onChange).toHaveBeenLastCalledWith('form');
  await user.click(screen.getByRole('tab', { name: 'Decision, Skipped' }));
  expect(onChange).toHaveBeenLastCalledWith('decision');
  expect(screen.getByRole('tab', { name: 'Application form, Completed' })).toHaveAttribute(
    'aria-controls',
    'application-stage-panel-form'
  );
});

it('locks all stages during a workspace operation', () => {
  renderDocumentUi(
    <ApplicationStageTabs
      stages={stages}
      selectedStageId="assessment"
      currentStageId="assessment"
      busy
      onChange={vi.fn()}
    />
  );
  screen.getAllByRole('tab').forEach((tab) => expect(tab).toBeDisabled());
});

it('renders no tabs when no configured stages are available', () => {
  renderDocumentUi(<ApplicationStageTabs stages={[]} busy={false} onChange={vi.fn()} />);
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
});
