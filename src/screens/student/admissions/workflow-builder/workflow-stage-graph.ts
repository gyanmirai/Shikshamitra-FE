import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { duplicateStage } from '../workflow-builder-utils';
import { isApplicationStageType } from './workflow-stage-configuration';

export type WorkflowGraph = {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
};
export type WorkflowGraphChange = WorkflowGraph & { error?: string };

const orderedStages = (stages: AdmissionWorkflowStage[]) =>
  [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
const normalizeOrder = (stages: AdmissionWorkflowStage[]) =>
  stages.map((stage, displayOrder) => ({ ...stage, displayOrder }));
const isPlainDefault = (route: AdmissionWorkflowTransition) =>
  route.isDefault && !route.conditionRuleJson;
const reject = (graph: WorkflowGraph, error: string): WorkflowGraphChange => ({ ...graph, error });
const routeTo = (
  fromStageId: string,
  toStageId: string,
  priority = 0
): AdmissionWorkflowTransition => ({
  id: crypto.randomUUID(),
  fromStageId,
  toStageId,
  priority,
  isDefault: true,
});

function canReach(transitions: AdmissionWorkflowTransition[], from: string, to: string) {
  const pending = [from];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.pop()!;
    if (current === to) return true;
    if (!visited.has(current)) {
      visited.add(current);
      transitions
        .filter((route) => route.fromStageId === current)
        .forEach((route) => pending.push(route.toStageId));
    }
  }
  return false;
}

export function insertWorkflowStage(
  graph: WorkflowGraph,
  stage: AdmissionWorkflowStage,
  afterStageId?: string
): WorkflowGraphChange {
  const { stages, transitions } = graph;
  if (stages.some((item) => item.id === stage.id))
    return reject(graph, 'This stage already belongs to the journey.');
  if (!isApplicationStageType(stage.stageType))
    return reject(graph, 'Choose a supported admission stage type.');
  if (!stages.length)
    return { stages: [{ ...stage, displayOrder: 0, isEntryStage: true }], transitions };
  const ordered = orderedStages(stages);
  const source = ordered.find((item) => item.id === afterStageId);
  if (!source) return reject(graph, 'Choose where to insert this stage.');
  if (!isApplicationStageType(source.stageType))
    return reject(graph, 'Replace the retired stage before inserting a stage beside it.');
  if (source.isTerminalStage) return insertBeforeTerminal(graph, stage, source, ordered);
  const defaults = transitions.filter(
    (route) => route.fromStageId === source.id && route.isDefault
  );
  if (defaults.length > 1 || defaults.some((route) => !isPlainDefault(route))) {
    return reject(
      graph,
      'The selected stage has an ambiguous or historical usual path. Review its routes before inserting.'
    );
  }
  const existing = defaults[0];
  const following = ordered[ordered.findIndex((item) => item.id === source.id) + 1];
  const destination = existing
    ? stages.find((item) => item.id === existing.toStageId)
    : following &&
        !following.isEntryStage &&
        !transitions.some((route) => route.toStageId === following.id)
      ? following
      : undefined;
  if (
    existing &&
    (!destination ||
      !isApplicationStageType(destination.stageType) ||
      destination.isEntryStage ||
      destination.id === source.id ||
      canReach(transitions, destination.id, source.id))
  ) {
    return reject(
      graph,
      'The selected usual path cannot be safely split. Review its destination before inserting.'
    );
  }
  const nextDestination =
    destination &&
    isApplicationStageType(destination.stageType) &&
    !canReach(transitions, destination.id, source.id)
      ? destination
      : undefined;
  if (stage.isTerminalStage && nextDestination)
    return reject(
      graph,
      'An ending stage cannot be inserted before another stage. Clear End of journey first.'
    );
  const newStage = { ...stage, isEntryStage: false };
  const result = [...ordered];
  result.splice(ordered.findIndex((item) => item.id === source.id) + 1, 0, newStage);
  const first = existing
    ? { ...existing, toStageId: stage.id }
    : routeTo(
        source.id,
        stage.id,
        Math.max(
          -1,
          ...transitions
            .filter((route) => route.fromStageId === source.id)
            .map((route) => route.priority)
        ) + 1
      );
  return {
    stages: normalizeOrder(result),
    transitions: [
      ...(existing
        ? transitions.map((route) => (route.id === existing.id ? first : route))
        : [...transitions, first]),
      ...(nextDestination ? [routeTo(stage.id, nextDestination.id)] : []),
    ],
  };
}

function insertBeforeTerminal(
  graph: WorkflowGraph,
  stage: AdmissionWorkflowStage,
  terminal: AdmissionWorkflowStage,
  ordered: AdmissionWorkflowStage[]
): WorkflowGraphChange {
  const incoming = graph.transitions.filter((route) => route.toStageId === terminal.id);
  if (
    stage.isTerminalStage ||
    graph.transitions.some((route) => route.fromStageId === terminal.id) ||
    incoming.length > 1 ||
    incoming.some((route) => !isPlainDefault(route))
  ) {
    return reject(
      graph,
      'This ending stage cannot be safely expanded. Review its connected paths first.'
    );
  }
  const previous = incoming[0] && graph.stages.find((item) => item.id === incoming[0].fromStageId);
  if (
    (!incoming.length && !terminal.isEntryStage) ||
    (incoming.length &&
      (!previous ||
        !isApplicationStageType(previous.stageType) ||
        previous.isTerminalStage ||
        terminal.isEntryStage ||
        canReach(graph.transitions, terminal.id, previous.id)))
  ) {
    return reject(
      graph,
      'The ending stage needs one usual incoming path before inserting a stage.'
    );
  }
  const inserted = { ...stage, isEntryStage: terminal.isEntryStage, isTerminalStage: false };
  const result = ordered.map((item) =>
    item.id === terminal.id ? { ...item, isEntryStage: false } : item
  );
  result.splice(
    ordered.findIndex((item) => item.id === terminal.id),
    0,
    inserted
  );
  return {
    stages: normalizeOrder(result),
    transitions: [
      ...graph.transitions.map((route) =>
        route.id === incoming[0]?.id ? { ...route, toStageId: stage.id } : route
      ),
      routeTo(stage.id, terminal.id),
    ],
  };
}

export function duplicateWorkflowStage(graph: WorkflowGraph, stageId: string): WorkflowGraphChange {
  const source = graph.stages.find((stage) => stage.id === stageId);
  if (!source) return reject(graph, 'The stage is no longer available.');
  const copies = duplicateStage(orderedStages(graph.stages), stageId);
  const copy = copies.find((stage) => !graph.stages.some((item) => item.id === stage.id));
  return copy
    ? insertWorkflowStage(graph, copy, stageId)
    : reject(graph, 'The stage could not be duplicated.');
}

export function removeWorkflowStage(graph: WorkflowGraph, stageId: string): WorkflowGraphChange {
  const { stages, transitions } = graph;
  const stage = stages.find((item) => item.id === stageId);
  if (!stage) return reject(graph, 'The stage is no longer available.');
  const incoming = transitions.filter((route) => route.toStageId === stageId);
  const outgoing = transitions.filter((route) => route.fromStageId === stageId);
  if (
    !isApplicationStageType(stage.stageType) ||
    [...incoming, ...outgoing].some((route) => !isPlainDefault(route)) ||
    incoming.length > 1 ||
    outgoing.length > 1
  ) {
    return reject(
      graph,
      'This stage has historical or branching paths. Keep it until those paths can be reviewed safely.'
    );
  }
  const remaining = orderedStages(stages).filter((item) => item.id !== stageId);
  if (!remaining.length)
    return {
      stages: [],
      transitions: transitions.filter(
        (route) => route.fromStageId !== stageId && route.toStageId !== stageId
      ),
    };
  const previous = incoming[0] && remaining.find((item) => item.id === incoming[0].fromStageId);
  const next = outgoing[0] && remaining.find((item) => item.id === outgoing[0].toStageId);
  if (
    (incoming.length &&
      (!previous || !isApplicationStageType(previous.stageType) || previous.isTerminalStage)) ||
    (outgoing.length && (!next || !isApplicationStageType(next.stageType)))
  ) {
    return reject(
      graph,
      'A connected path references an unavailable stage. Review the journey before removing this stage.'
    );
  }
  const kept = transitions.filter(
    (route) => route.fromStageId !== stageId && route.toStageId !== stageId
  );
  if (
    stage.isEntryStage &&
    (!next ||
      incoming.length ||
      remaining.some((item) => item.isEntryStage) ||
      kept.some((route) => route.toStageId === next.id))
  ) {
    return reject(graph, 'Choose a single supported next stage before removing the entry stage.');
  }
  if (
    stage.isTerminalStage &&
    (!previous || outgoing.length || kept.some((route) => route.fromStageId === previous.id))
  ) {
    return reject(
      graph,
      'This ending stage cannot be removed while its predecessor has another path.'
    );
  }
  if (
    previous &&
    next &&
    (next.isEntryStage ||
      previous.id === next.id ||
      kept.some((route) => route.fromStageId === previous.id && route.toStageId === next.id) ||
      canReach(kept, next.id, previous.id))
  ) {
    return reject(
      graph,
      'Removing this stage would create a duplicate or circular path. Review its connected paths first.'
    );
  }
  if (previous && !next && !stage.isTerminalStage)
    return reject(graph, 'Choose the next step or mark this stage as ending before removing it.');
  return {
    stages: normalizeOrder(
      remaining.map((item) => ({
        ...item,
        ...(stage.isEntryStage && item.id === next?.id ? { isEntryStage: true } : {}),
        ...(stage.isTerminalStage && item.id === previous?.id ? { isTerminalStage: true } : {}),
      }))
    ),
    transitions: previous && next ? [...kept, { ...incoming[0], toStageId: next.id }] : kept,
  };
}
