import type { ReactNode } from 'react';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { WorkflowStageList } from './components/workflow-stage-list';
import { WorkflowBuilderCanvas } from './components/workflow-builder-canvas';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span aria-hidden="true" data-icon={icon} />,
}));

const handlers = {
  onAddStage: vi.fn(),
  onEditStage: vi.fn(),
  onDuplicateStage: vi.fn(),
  onDeleteStage: vi.fn(),
  onAddTransition: vi.fn(),
  onEditTransition: vi.fn(),
  onDeleteTransition: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
};
const stage: AdmissionWorkflowStage = {
  id: 'stage-1',
  code: 'FORM',
  name: 'Application form submitted',
  stageType: 1,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: true,
  isTerminalStage: false,
};
const store = configureStore({ reducer: { confirmPopup } });
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    </Provider>
  );
}
function Canvas({
  stages = [],
  readOnly = false,
  transitions = [],
}: {
  stages?: AdmissionWorkflowStage[];
  readOnly?: boolean;
  transitions?: AdmissionWorkflowTransition[];
}) {
  return (
    <WorkflowBuilderCanvas
      stages={stages}
      transitions={transitions}
      readOnly={readOnly}
      loadingStageTypes={false}
      issueCountByStage={{}}
      canUndo
      canRedo={false}
      footerActions={<button type="button">Save draft</button>}
      {...handlers}
    />
  );
}

describe('WorkflowBuilderCanvas', () => {
  it('shows numbered stages in saved sequence without draggable controls', () => {
    const assessment: AdmissionWorkflowStage = {
      ...stage,
      id: 'assessment',
      name: 'Entrance assessment',
      stageType: 2,
      displayOrder: 0,
    };
    const form = { ...stage, displayOrder: 1, isEntryStage: false };
    const decision: AdmissionWorkflowStage = {
      ...stage,
      id: 'decision',
      name: 'Admission finalization',
      stageType: 7,
      displayOrder: 2,
      isEntryStage: false,
      isTerminalStage: true,
    };
    const stages = [decision, form, assessment];
    render(<Canvas stages={stages} />, { wrapper: Wrapper });
    const sequence = screen.getByRole('list', { name: 'Journey stage sequence' });
    const cards = within(sequence).getAllByRole('listitem');
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      assessment.name,
      form.name,
      decision.name,
    ]);
    cards.forEach((card, index) => {
      expect(within(card).getByText(String(index + 1))).toBeInTheDocument();
      expect(card).not.toHaveAttribute('draggable', 'true');
    });
    expect(screen.queryByRole('button', { name: /^Reorder / })).not.toBeInTheDocument();
    expect(stages.map((item) => item.id)).toEqual([decision.id, form.id, assessment.id]);
  });
  it('keeps saved special paths viewable without edit or remove actions', async () => {
    const next = { ...stage, id: 'next', name: 'Next stage', displayOrder: 1, isEntryStage: false };
    const special: AdmissionWorkflowTransition = {
      id: 'special',
      fromStageId: stage.id,
      toStageId: next.id,
      priority: 1,
      isDefault: false,
      conditionRuleJson: JSON.stringify({
        field: 'application.status',
        operator: 'Equals',
        value: 'approved',
      }),
    };
    render(<Canvas stages={[stage, next]} transitions={[special]} />, { wrapper: Wrapper });
    expect(
      await screen.findByRole('button', { name: 'View route to Next stage' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit route to Next stage' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove route to Next stage' })
    ).not.toBeInTheDocument();
  });
  it('removes special outcome actions from connected stage cards and their menus', async () => {
    const next = { ...stage, id: 'next', name: 'Next stage', displayOrder: 1, isEntryStage: false };
    const usual: AdmissionWorkflowTransition = {
      id: 'usual',
      fromStageId: stage.id,
      toStageId: next.id,
      priority: 0,
      isDefault: true,
    };
    render(<Canvas stages={[stage, next]} transitions={[usual]} />, { wrapper: Wrapper });
    expect(screen.queryByRole('button', { name: 'Add special outcome' })).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Edit route to Next stage' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Add special outcome' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit route to Next stage' }));
    expect(handlers.onEditTransition).toHaveBeenCalledWith(usual);
  });
  it('shows the journey directly and keeps empty-state creation usable', () => {
    render(<Canvas />, { wrapper: Wrapper });
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    const journey = screen.getByRole('region', { name: 'Admission Journey' });
    fireEvent.click(within(journey).getByRole('button', { name: 'Add stage' }));
    expect(handlers.onAddStage).toHaveBeenCalledOnce();
    expect(within(journey).getByRole('button', { name: 'Save draft' })).toBeInTheDocument();
  });

  it('puts undo and redo beside add stage and keeps the footer outside the custom scroll region', () => {
    render(<Canvas stages={[stage]} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(handlers.onUndo).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add stage' })).toBeEnabled();
    const scrollRegion = screen.getByLabelText('Admission journey stages');
    expect(scrollRegion).toHaveAttribute('tabindex', '0');
    expect(scrollRegion).toContainElement(screen.getByText(stage.name));
    expect(scrollRegion).not.toContainElement(
      screen.getByRole('group', { name: 'Journey edit history' })
    );
    expect(scrollRegion).not.toContainElement(screen.getByRole('button', { name: 'Save draft' }));
    expect(
      within(screen.getByRole('status', { name: 'Journey validation summary' })).getByText(
        'Journey needs attention'
      )
    ).toBeInTheDocument();
  });

  it('keeps read-only stages visible without edit history or add controls', () => {
    render(<Canvas stages={[stage]} readOnly />, { wrapper: Wrapper });
    expect(screen.getByText(stage.name)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Journey edit history' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add stage' })).not.toBeInTheDocument();
    const viewButton = screen.getByRole('button', { name: `View ${stage.name}` });
    fireEvent.click(viewButton);
    expect(handlers.onEditStage).toHaveBeenCalledWith(stage);
    expect(document.querySelector('[data-icon="mdi:eye-outline"]')).toBeNull();
    expect(
      screen.queryByRole('button', { name: `Actions for ${stage.name}` })
    ).not.toBeInTheDocument();
  });

  it('offers an accessible icon-only Edit action on each journey stage', () => {
    render(<Canvas stages={[stage]} />, { wrapper: Wrapper });
    const editButton = screen.getByRole('button', { name: `Edit ${stage.name}` });
    expect(editButton.textContent).toBe('');
    expect(screen.queryByText(stage.code)).not.toBeInTheDocument();
    fireEvent.click(editButton);
    expect(handlers.onEditStage).toHaveBeenCalledWith(stage);
    expect(
      screen.queryByRole('button', { name: `Actions for ${stage.name}` })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Duplicate ${stage.name}` }));
    expect(handlers.onDuplicateStage).toHaveBeenCalledWith(stage);
    fireEvent.click(screen.getByRole('button', { name: `Delete ${stage.name}` }));
    expect(handlers.onDeleteStage).toHaveBeenCalledWith(stage);
  });

  it('describes connected stages without claiming full publishing validation', () => {
    render(<Canvas stages={[{ ...stage, isTerminalStage: true }]} />, { wrapper: Wrapper });
    expect(screen.getByText('Journey connected')).toBeInTheDocument();
    expect(screen.queryByText('Journey valid')).not.toBeInTheDocument();
  });

  it('shows unsaved changes separately from the journey connection check', () => {
    render(
      <WorkflowStageList
        dirty
        stages={[{ ...stage, isTerminalStage: true }]}
        transitions={[]}
        readOnly={false}
        loadingStageTypes={false}
        issueCountByStage={{}}
        canUndo
        canRedo={false}
        footerActions={<button type="button">Save draft</button>}
        onUndo={handlers.onUndo}
        onRedo={handlers.onRedo}
        onAdd={handlers.onAddStage}
        onEdit={handlers.onEditStage}
        onDuplicate={handlers.onDuplicateStage}
        onDelete={handlers.onDeleteStage}
        onAddPath={handlers.onAddTransition}
        onEditPath={handlers.onEditTransition}
        onDeletePath={handlers.onDeleteTransition}
      />,
      { wrapper: Wrapper }
    );
    const status = screen.getByRole('status', { name: 'Journey validation summary' });
    expect(within(status).getByText('Journey connected')).toBeInTheDocument();
    expect(within(status).getByText('Unsaved changes')).toBeInTheDocument();
  });
});
