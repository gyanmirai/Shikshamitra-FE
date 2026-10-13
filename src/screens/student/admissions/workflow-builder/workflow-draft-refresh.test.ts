import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useWorkflowBuilderDraft } from './hooks/use-workflow-builder-draft';

vi.mock('../use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));

const original: AdmissionWorkflow = {
  id: 'workflow',
  name: 'QA workflow',
  code: 'QA',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'before-save',
  creationTime: '2026-09-25T00:00:00Z',
  transitions: [],
  stages: [
    {
      id: 'form',
      code: 'FORM',
      name: 'Original form',
      stageType: 1,
      displayOrder: 0,
      isRequired: true,
      allowManualSkip: false,
      isEntryStage: true,
      isTerminalStage: false,
    },
  ],
};

it('keeps the saved response and validation while the cached query still contains the old version', () => {
  const { result, rerender } = renderHook(
    ({ workflow }) => useWorkflowBuilderDraft(workflow, null),
    {
      initialProps: { workflow: original },
    }
  );
  const saved = {
    ...original,
    concurrencyStamp: 'after-save',
    stages: [{ ...original.stages[0], name: 'Updated form' }],
  };
  const validation = { isValid: true, issues: [], errors: [], warnings: [] };
  act(() => {
    result.current.setLoadedStamp(saved.concurrencyStamp);
    result.current.setStages(saved.stages);
    result.current.setDirty(false);
    result.current.setValidation(validation);
  });
  expect(result.current.loadedStamp).toBe('after-save');
  expect(result.current.stages[0].name).toBe('Updated form');
  expect(result.current.validation).toEqual(validation);
  rerender({ workflow: saved });
  expect(result.current.validation).toEqual(validation);
});

it('hydrates an actual newer server snapshot and invalidates the previous validation', () => {
  const { result, rerender } = renderHook(
    ({ workflow }) => useWorkflowBuilderDraft(workflow, null),
    {
      initialProps: { workflow: original },
    }
  );
  act(() => result.current.setValidation({ isValid: true, issues: [], errors: [], warnings: [] }));
  rerender({
    workflow: {
      ...original,
      concurrencyStamp: 'external-update',
      stages: [{ ...original.stages[0], name: 'Server update' }],
    },
  });
  expect(result.current.loadedStamp).toBe('external-update');
  expect(result.current.stages[0].name).toBe('Server update');
  expect(result.current.validation).toBeNull();
});

it('retains validation when the server changes only governance status and concurrency after validating', () => {
  const { result, rerender } = renderHook(
    ({ workflow }) => useWorkflowBuilderDraft(workflow, null),
    {
      initialProps: { workflow: original },
    }
  );
  const validation = { isValid: true, issues: [], errors: [], warnings: [] };
  act(() => result.current.setValidation(validation));
  rerender({
    workflow: {
      ...original,
      status: 3,
      concurrencyStamp: 'validated-stamp',
      stages: original.stages.map((stage) => ({ ...stage })),
      transitions: [],
    },
  });
  expect(result.current.loadedStamp).toBe('validated-stamp');
  expect(result.current.validation).toEqual(validation);
});

it('keeps exactly one entry when another stage is selected', () => {
  const assessment: AdmissionWorkflow['stages'][number] = {
    ...original.stages[0],
    id: 'assessment',
    code: 'ENTRANCE_EXAM',
    name: 'Entrance Exam',
    stageType: 2,
    displayOrder: 1,
    isEntryStage: false,
  };
  const workflow = { ...original, stages: [...original.stages, assessment] };
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));

  act(() => result.current.saveStage({ ...assessment, isEntryStage: true }));
  expect(
    result.current.stages.filter((stage) => stage.isEntryStage).map((stage) => stage.id)
  ).toEqual(['assessment']);

  act(() => result.current.saveStage({ ...original.stages[0], isEntryStage: true }));
  expect(
    result.current.stages.filter((stage) => stage.isEntryStage).map((stage) => stage.id)
  ).toEqual(['form']);
});

it('adds a chosen next stage and its route as one undoable change', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(original, null));
  const next: AdmissionWorkflow['stages'][number] = {
    ...original.stages[0],
    id: 'assessment',
    code: 'ASSESSMENT',
    name: 'Assessment',
    stageType: 2,
    displayOrder: 1,
    isEntryStage: false,
  };
  act(() => result.current.saveStage(next, false, 'form'));
  expect(result.current.stages).toHaveLength(2);
  expect(result.current.transitions).toEqual([
    expect.objectContaining({
      fromStageId: 'form',
      toStageId: next.id,
      isDefault: true,
      priority: 0,
    }),
  ]);
  const routeId = result.current.transitions[0].id;
  act(() => result.current.undo());
  expect(result.current.stages).toEqual(original.stages);
  expect(result.current.transitions).toEqual([]);
  act(() => result.current.redo());
  expect(result.current.stages).toHaveLength(2);
  expect(result.current.transitions[0].id).toBe(routeId);
});

it('preserves saved default and historical routes when adding a stage', () => {
  const existing: AdmissionWorkflow = {
    ...original,
    transitions: [
      { id: 'usual', fromStageId: 'form', toStageId: 'old-next', priority: 0, isDefault: true },
    ],
  };
  const { result } = renderHook(() => useWorkflowBuilderDraft(existing, null));
  const next = {
    ...original.stages[0],
    id: 'next',
    code: 'NEXT',
    displayOrder: 1,
    isEntryStage: false,
  };
  act(() => result.current.saveStage(next, false, 'form'));
  expect(result.current.transitions).toEqual(existing.transitions);
});

it('does not create a next-step route after a terminal stage', () => {
  const workflow = { ...original, stages: [{ ...original.stages[0], isTerminalStage: true }] };
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  const next = {
    ...original.stages[0],
    id: 'next',
    code: 'NEXT',
    displayOrder: 1,
    isEntryStage: false,
  };
  act(() => result.current.saveStage(next, false, 'form'));
  expect(result.current.transitions).toEqual([]);
});
