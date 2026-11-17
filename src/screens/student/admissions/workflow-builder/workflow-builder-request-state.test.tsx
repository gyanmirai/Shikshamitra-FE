import { render } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import AdmissionWorkflowBuilder from '../admission-workflow-builder';

const hooks = vi.hoisted(() => ({
  panel: '',
  sidePanel: null as string | null,
  draft: vi.fn(),
  usage: vi.fn(),
  versions: vi.fn(),
  forms: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: () => [{ name: 'Students.Admissions.Workflows.View', isGranted: true }],
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(hooks.panel ? `panel=${hooks.panel}` : ''),
}));
vi.mock('../use-admission-definition-options', () => ({
  useAdmissionDefinitionOptions: () => ({}),
}));
vi.mock('./hooks/use-workflow-builder-draft', () => ({
  useWorkflowBuilderDraft: (...args: unknown[]) => {
    hooks.draft(...args);
    return { stages: [], sidePanel: hooks.sidePanel, dirty: false, resetDraft: vi.fn() };
  },
}));
vi.mock('./hooks/use-workflow-builder-commands', () => ({
  useWorkflowBuilderCommands: () => ({
    updateState: { isLoading: false },
    validateState: { isLoading: false },
    publishState: { isLoading: false },
  }),
}));
vi.mock('./components/workflow-builder-page-state', () => ({
  WorkflowBuilderPageState: () => null,
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormQuery: () => ({}),
  useGetAdmissionFormsQuery: (...args: unknown[]) => {
    hooks.forms(...args);
    return {};
  },
}));
vi.mock('src/redux/student/admissions/admission-workflows-api', () => ({
  useGetAdmissionWorkflowQuery: () => ({ isLoading: true }),
  useGetAdmissionWorkflowStageTypesQuery: () => ({}),
  useGetAdmissionWorkflowUsageQuery: (...args: unknown[]) => {
    hooks.usage(...args);
    return {};
  },
  useGetAdmissionWorkflowVersionsQuery: (...args: unknown[]) => {
    hooks.versions(...args);
    return {};
  },
}));

describe('workflow builder request ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.panel = '';
    hooks.sidePanel = null;
  });
  it('honors Preview links while retaining the published forms needed by the initial editor', () => {
    hooks.panel = 'preview';
    render(<AdmissionWorkflowBuilder workflowId="workflow-1" />);
    expect(hooks.draft).toHaveBeenCalledWith(undefined, 'preview');
    expect(hooks.forms).toHaveBeenCalledWith({ status: 1, maxResultCount: 100 });
    expect(hooks.usage).toHaveBeenCalledWith('workflow-1', { skip: true });
    expect(hooks.versions).toHaveBeenCalledWith('workflow-1', { skip: true });
  });
  it.each(['usage', 'versions'])('loads optional %s only when its panel opens', (panel) => {
    hooks.sidePanel = panel;
    render(<AdmissionWorkflowBuilder workflowId="workflow-1" />);
    expect(hooks.usage).toHaveBeenCalledWith('workflow-1', { skip: panel !== 'usage' });
    expect(hooks.versions).toHaveBeenCalledWith('workflow-1', { skip: panel !== 'versions' });
  });
});
