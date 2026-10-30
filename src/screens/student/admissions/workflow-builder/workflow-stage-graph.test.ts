import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useWorkflowBuilderDraft } from './hooks/use-workflow-builder-draft';

vi.mock('../use-admission-unsaved-changes', () => ({ useAdmissionUnsavedChanges: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { warning: vi.fn() } }));

const stages: AdmissionWorkflow['stages'] = [
  {
    id: 'a',
    code: 'A',
    name: 'Form',
    stageType: 1,
    displayOrder: 0,
    isEntryStage: true,
    isTerminalStage: false,
    isRequired: true,
    allowManualSkip: false,
  },
  {
    id: 'b',
    code: 'B',
    name: 'Assessment',
    stageType: 2,
    displayOrder: 1,
    isEntryStage: false,
    isTerminalStage: false,
    isRequired: true,
    allowManualSkip: false,
  },
  {
    id: 'c',
    code: 'C',
    name: 'Decision',
    stageType: 7,
    displayOrder: 2,
    isEntryStage: false,
    isTerminalStage: true,
    isRequired: true,
    allowManualSkip: false,
  },
];
const transitions: AdmissionWorkflow['transitions'] = [
  { id: 'ab', fromStageId: 'a', toStageId: 'b', isDefault: true, priority: 0 },
  { id: 'bc', fromStageId: 'b', toStageId: 'c', isDefault: true, priority: 4 },
];
const workflow: AdmissionWorkflow = {
  id: 'workflow',
  name: 'Workflow',
  code: 'WORKFLOW',
  version: 1,
  status: 0,
  offeringCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp',
  creationTime: '2026-10-29T00:00:00Z',
  stages,
  transitions,
};
const added = { ...stages[1], id: 'new', code: 'NEW', name: 'New', displayOrder: 3 };
const paths = (routes: AdmissionWorkflow['transitions']) =>
  routes.map((route) => `${route.fromStageId}->${route.toStageId}`);

describe('workflow stage graph actions', () => {
  it('inserts between connected stages and restores the whole graph with one undo', () => {
    const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
    act(() => result.current.saveStage(added, false, 'b'));
    expect(result.current.stages.map((stage) => stage.id)).toEqual(['a', 'b', 'new', 'c']);
    expect(result.current.stages.map((stage) => stage.displayOrder)).toEqual([0, 1, 2, 3]);
    expect(paths(result.current.transitions)).toEqual(['a->b', 'b->new', 'new->c']);
    expect(result.current.transitions[1]).toMatchObject({ id: 'bc', priority: 4 });
    act(() => result.current.undo());
    expect(result.current.stages).toEqual(stages);
    expect(result.current.transitions).toEqual(transitions);
    act(() => result.current.redo());
    expect(paths(result.current.transitions)).toEqual(['a->b', 'b->new', 'new->c']);
  });
  it('clones the middle stage into the journey rather than leaving it disconnected', () => {
    const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
    act(() => result.current.duplicateStage('b'));
    const copy = result.current.stages[2];
    expect(copy.code).toBe('B_COPY');
    expect(paths(result.current.transitions)).toEqual(['a->b', `b->${copy.id}`, `${copy.id}->c`]);
    act(() => result.current.undo());
    expect(result.current.stages).toEqual(stages);
    expect(result.current.transitions).toEqual(transitions);
  });
  it('bridges the predecessor when deleting a simple middle stage', () => {
    const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
    act(() => result.current.deleteStage('b'));
    expect(result.current.stages.map((stage) => stage.id)).toEqual(['a', 'c']);
    expect(result.current.transitions).toEqual([{ ...transitions[0], toStageId: 'c' }]);
    act(() => result.current.undo());
    expect(result.current.stages).toEqual(stages);
    expect(result.current.transitions).toEqual(transitions);
  });
  it('rejects deletion attached to a historical conditional route without recording a change', () => {
    const condition = {
      ...transitions[0],
      isDefault: false,
      conditionRuleJson: '{"operator":"ALL","conditions":[]}',
    };
    const historical = { ...workflow, transitions: [condition, transitions[1]] };
    const { result } = renderHook(() => useWorkflowBuilderDraft(historical, null));
    let saved: boolean | undefined;
    act(() => {
      saved = result.current.deleteStage('b');
    });
    expect(saved).toBe(false);
    expect(result.current.stages).toEqual(stages);
    expect(result.current.transitions).toEqual(historical.transitions);
    expect(result.current.dirty).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });
});

it('connects an inserted stage to an isolated immediate next stage when filling a gap', () => {
  const { result } = renderHook(() =>
    useWorkflowBuilderDraft({ ...workflow, transitions: [transitions[0]] }, null)
  );
  act(() => result.current.saveStage(added, false, 'b'));
  expect(result.current.stages.map((stage) => stage.id)).toEqual(['a', 'b', 'new', 'c']);
  expect(paths(result.current.transitions)).toEqual(['a->b', 'b->new', 'new->c']);
});
it('does not guess a continuation into a shared next stage', () => {
  const { result } = renderHook(() =>
    useWorkflowBuilderDraft(
      {
        ...workflow,
        transitions: [
          transitions[0],
          {
            ...transitions[1],
            fromStageId: 'a',
            isDefault: false,
            conditionRuleJson:
              '{"field":"application.status","operator":"Equals","value":"approved"}',
          },
        ],
      },
      null
    )
  );
  act(() => result.current.saveStage(added, false, 'b'));
  expect(paths(result.current.transitions)).toEqual(['a->b', 'a->c', 'b->new']);
});
it('splits only the usual route while preserving exact historical conditional routes', () => {
  const special = {
    id: 'special',
    fromStageId: 'b',
    toStageId: 'c',
    priority: 1,
    isDefault: false,
    conditionRuleJson: '{ "operator": "FutureRule", "conditions": [] }',
  };
  const { result } = renderHook(() =>
    useWorkflowBuilderDraft({ ...workflow, transitions: [...transitions, special] }, null)
  );
  act(() => result.current.saveStage(added, false, 'b'));
  expect(result.current.transitions.find((route) => route.id === 'special')).toEqual(special);
  expect(paths(result.current.transitions)).toEqual(['a->b', 'b->new', 'b->c', 'new->c']);
});
it('rejects a malformed default route without changing draft or undo history', () => {
  const old = {
    ...workflow,
    transitions: [transitions[0], { ...transitions[1], conditionRuleJson: '{invalid' }],
  };
  const { result } = renderHook(() => useWorkflowBuilderDraft(old, null));
  act(() => result.current.saveStage(added, false, 'b'));
  expect(result.current.stages).toEqual(stages);
  expect(result.current.transitions).toEqual(old.transitions);
  expect(result.current.canUndo).toBe(false);
  expect(result.current.dirty).toBe(false);
});
it('rejects a usual path to an unavailable destination rather than appending a disconnected stage', () => {
  const old = {
    ...workflow,
    transitions: [transitions[0], { ...transitions[1], toStageId: 'missing' }],
  };
  const { result } = renderHook(() => useWorkflowBuilderDraft(old, null));
  act(() => result.current.saveStage(added, false, 'b'));
  expect(result.current.stages).toEqual(stages);
  expect(result.current.transitions).toEqual(old.transitions);
  expect(result.current.canUndo).toBe(false);
});
it('promotes the supported successor after deleting the entry stage', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  act(() => result.current.deleteStage('a'));
  expect(result.current.stages.map((stage) => [stage.id, stage.isEntryStage])).toEqual([
    ['b', true],
    ['c', false],
  ]);
  expect(paths(result.current.transitions)).toEqual(['b->c']);
});
it('retains an ending stage after deleting the final step of a simple route', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  act(() => result.current.deleteStage('c'));
  expect(result.current.stages[1]).toMatchObject({ id: 'b', isTerminalStage: true });
  expect(paths(result.current.transitions)).toEqual(['a->b']);
});
it('inserts a terminal-stage copy before the original ending stage', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  act(() => result.current.duplicateStage('c'));
  const copy = result.current.stages[2];
  expect(copy).toMatchObject({ code: 'C_COPY', isTerminalStage: false, isEntryStage: false });
  expect(result.current.stages[3]).toMatchObject({ id: 'c', isTerminalStage: true });
  expect(paths(result.current.transitions)).toEqual(['a->b', `b->${copy.id}`, `${copy.id}->c`]);
});
it('preserves an original sole entry and terminal by placing its copy first', () => {
  const only = { ...stages[2], displayOrder: 0, isEntryStage: true };
  const { result } = renderHook(() =>
    useWorkflowBuilderDraft({ ...workflow, stages: [only], transitions: [] }, null)
  );
  act(() => result.current.duplicateStage('c'));
  const copy = result.current.stages[0];
  expect(copy).toMatchObject({ isEntryStage: true, isTerminalStage: false });
  expect(result.current.stages[1]).toMatchObject({
    id: 'c',
    isEntryStage: false,
    isTerminalStage: true,
  });
  expect(paths(result.current.transitions)).toEqual([`${copy.id}->c`]);
});
it('does not remove an ending stage whose predecessor still has a conditional branch', () => {
  const special = {
    id: 'special',
    fromStageId: 'b',
    toStageId: 'a',
    priority: 1,
    isDefault: false,
    conditionRuleJson: '{"field":"x","operator":"IsEmpty"}',
  };
  const old = { ...workflow, transitions: [...transitions, special] };
  const { result } = renderHook(() => useWorkflowBuilderDraft(old, null));
  act(() => result.current.deleteStage('c'));
  expect(result.current.stages).toEqual(stages);
  expect(result.current.transitions).toEqual(old.transitions);
  expect(result.current.canUndo).toBe(false);
});
it('rejects insertion that would create outgoing routes from the inserted ending stage', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  act(() => result.current.saveStage({ ...added, isTerminalStage: true }, false, 'b'));
  expect(result.current.stages).toEqual(stages);
  expect(result.current.canUndo).toBe(false);
});
it('rejects a missing insertion source on a populated saved journey', () => {
  const { result } = renderHook(() => useWorkflowBuilderDraft(workflow, null));
  act(() => result.current.saveStage(added));
  expect(result.current.stages).toEqual(stages);
  expect(result.current.canUndo).toBe(false);
});
it('retains sequential auto-connection while building an initially blank draft', () => {
  const blank = { ...workflow, stages: [], transitions: [] };
  const { result } = renderHook(() => useWorkflowBuilderDraft(blank, null));
  act(() => result.current.saveStage(stages[0]));
  act(() => result.current.saveStage(stages[1]));
  expect(paths(result.current.transitions)).toEqual(['a->b']);
});
