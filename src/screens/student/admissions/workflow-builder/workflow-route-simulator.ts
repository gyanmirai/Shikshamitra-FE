import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';
import { getStageRouteBlocker } from './workflow-runtime-route-rules';

type ConditionNode = {
  operator?: string;
  field?: string;
  value?: unknown;
  conditions?: ConditionNode[];
};

export type WorkflowSimulationStep = {
  stageId: string;
  stageName: string;
  transitionId?: string;
  nextStageId?: string;
  routeKind?: 'condition' | 'default';
  otherMatchingRoutes?: number;
};

export type WorkflowSimulationResult = {
  status: 'completed' | 'blocked' | 'invalid';
  message: string;
  steps: WorkflowSimulationStep[];
};

export type WorkflowSimulationScenario = {
  id: string;
  label: string;
  description: string;
  facts: Record<string, string>;
};

const happyPathFacts: Record<string, string> = {
  'inquiry.management.outcome': 'Qualified',
  'assessment.outcome': 'passed',
  'documents.status': 'verified',
  'documents.waivedCount': '0',
  'eligibility.status': 'eligible',
  'payment.status': 'settled',
  'review.decision': 'approve',
  'offer.status': 'accepted',
  'seat.status': 'confirmed',
};

export const WORKFLOW_SIMULATION_SCENARIOS: WorkflowSimulationScenario[] = [
  {
    id: 'happy',
    label: 'Happy path',
    description: 'Qualified applicant with successful checks, payment, offer, and seat.',
    facts: happyPathFacts,
  },
  {
    id: 'assessment-failed',
    label: 'Assessment failed',
    description: 'Checks whether a failed assessment reaches its intended route.',
    facts: { ...happyPathFacts, 'assessment.outcome': 'failed' },
  },
  {
    id: 'documents-missing',
    label: 'Documents unresolved',
    description: 'Checks the route selected while required document evidence is unresolved.',
    facts: { ...happyPathFacts, 'documents.status': 'pending' },
  },
  {
    id: 'eligibility-failed',
    label: 'Eligibility failed',
    description: 'Checks that an ineligible applicant reaches review or a controlled outcome.',
    facts: { ...happyPathFacts, 'eligibility.status': 'ineligible' },
  },
  {
    id: 'eligibility-exception',
    label: 'Eligibility exception',
    description: 'Checks the authorized exception route for an otherwise ineligible applicant.',
    facts: {
      ...happyPathFacts,
      'eligibility.status': 'exceptionApproved',
    },
  },
  {
    id: 'payment-pending',
    label: 'Payment pending',
    description: 'Checks that an unsettled payment does not silently take the success route.',
    facts: { ...happyPathFacts, 'payment.status': 'pendingVerification' },
  },
  {
    id: 'payment-waived',
    label: 'Payment waived',
    description: 'Checks the authorized payment-waiver route.',
    facts: { ...happyPathFacts, 'payment.status': 'waived' },
  },
  {
    id: 'review-correction',
    label: 'Review correction',
    description: 'Checks the controlled return route when staff requests a correction.',
    facts: { ...happyPathFacts, 'review.decision': 'correctionRequired' },
  },
  {
    id: 'rejected',
    label: 'Application rejected',
    description: 'Checks that a rejection reaches an explicit terminal outcome.',
    facts: { ...happyPathFacts, 'review.decision': 'reject' },
  },
  {
    id: 'waitlisted',
    label: 'Applicant waitlisted',
    description: 'Checks the configured review and seat waitlist routes.',
    facts: {
      ...happyPathFacts,
      'review.decision': 'waitlist',
      'seat.status': 'waitlisted',
    },
  },
  {
    id: 'offer-declined',
    label: 'Offer declined',
    description: 'Checks the controlled route for an applicant who declines an offer.',
    facts: { ...happyPathFacts, 'offer.status': 'declined' },
  },
  {
    id: 'offer-expired',
    label: 'Offer expired',
    description: 'Checks the controlled route after the offer response window expires.',
    facts: { ...happyPathFacts, 'offer.status': 'expired' },
  },
  {
    id: 'seat-expired',
    label: 'Seat hold expired',
    description: 'Checks the controlled route when a reserved seat expires.',
    facts: { ...happyPathFacts, 'seat.status': 'expired' },
  },
];

const readValue = (value: unknown) =>
  typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);

const compareNumbers = (
  left: string,
  right: string,
  compare: (a: number, b: number) => boolean
) => {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  return (
    left.trim() !== '' && right.trim() !== '' && Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && compare(leftNumber, rightNumber)
  );
};

function evaluateNode(node: ConditionNode, facts: Readonly<Record<string, string>>): boolean {
  const operator = node.operator?.toLowerCase() ?? '';
  if (Array.isArray(node.conditions)) {
    const results = node.conditions.map((condition) => evaluateNode(condition, facts));
    return operator === 'any' ? results.some(Boolean) : results.every(Boolean);
  }

  const current = facts[node.field ?? ''] ?? '';
  const expected = readValue(node.value);
  switch (operator) {
    case 'equals':
      return current.localeCompare(expected, undefined, { sensitivity: 'accent' }) === 0;
    case 'notequals':
      return current.localeCompare(expected, undefined, { sensitivity: 'accent' }) !== 0;
    case 'contains':
      return current.toLowerCase().includes(expected.toLowerCase());
    case 'notcontains':
      return !current.toLowerCase().includes(expected.toLowerCase());
    case 'startswith':
      return current.toLowerCase().startsWith(expected.toLowerCase());
    case 'endswith':
      return current.toLowerCase().endsWith(expected.toLowerCase());
    case 'isempty':
      return current.trim() === '';
    case 'isnotempty':
      return current.trim() !== '';
    case 'greaterthan':
      return compareNumbers(current, expected, (left, right) => left > right);
    case 'greaterthanorequal':
      return compareNumbers(current, expected, (left, right) => left >= right);
    case 'lessthan':
      return compareNumbers(current, expected, (left, right) => left < right);
    case 'lessthanorequal':
      return compareNumbers(current, expected, (left, right) => left <= right);
    case 'in':
    case 'notin': {
      const values = Array.isArray(node.value)
        ? node.value.map(readValue)
        : expected.split(',').map((value) => value.trim());
      const includes = values.some((value) => value.toLowerCase() === current.toLowerCase());
      return operator === 'in' ? includes : !includes;
    }
    default:
      return false;
  }
}

export function evaluateWorkflowCondition(
  conditionRuleJson: string | undefined,
  facts: Readonly<Record<string, string>>
) {
  if (!conditionRuleJson?.trim()) return true;
  try {
    return evaluateNode(JSON.parse(conditionRuleJson) as ConditionNode, facts);
  } catch {
    return false;
  }
}

export function getWorkflowConditionFields(transitions: AdmissionWorkflowTransition[]) {
  const fields = new Set<string>();
  const collect = (node: ConditionNode) => {
    if (node.field) fields.add(node.field);
    node.conditions?.forEach(collect);
  };
  transitions.forEach((transition) => {
    if (!transition.conditionRuleJson) return;
    try {
      collect(JSON.parse(transition.conditionRuleJson) as ConditionNode);
    } catch {
      // Invalid conditions are reported by workflow validation.
    }
  });
  return [...fields].sort();
}

export function simulateWorkflowRoute(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[],
  facts: Readonly<Record<string, string>>
): WorkflowSimulationResult {
  const entryStages = stages.filter((stage) => stage.isEntryStage);
  if (entryStages.length !== 1) {
    return { status: 'invalid', message: 'Select exactly one entry stage.', steps: [] };
  }

  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const visited = new Set<string>();
  const steps: WorkflowSimulationStep[] = [];
  let current = entryStages[0];

  while (current) {
    if (visited.has(current.id)) {
      return {
        status: 'invalid',
        message: `The route returns to ${current.name}. Cyclic workflows cannot be published.`,
        steps,
      };
    }
    visited.add(current.id);
    const step: WorkflowSimulationStep = { stageId: current.id, stageName: current.name };
    steps.push(step);
    if (current.isTerminalStage) {
      const blocker = getStageRouteBlocker(current, facts);
      if (blocker) return { status: 'blocked', message: blocker, steps };
      return {
        status: 'completed',
        message: `This scenario reaches the terminal stage “${current.name}”.`,
        steps,
      };
    }

    const currentStageId = current.id;
    const outgoing = transitions
      .filter((transition) => transition.fromStageId === currentStageId)
      .sort((left, right) => left.priority - right.priority);
    const eligible = outgoing.filter(
      (transition) =>
        !transition.isDefault && evaluateWorkflowCondition(transition.conditionRuleJson, facts)
    );
    const winner = eligible[0] ?? outgoing.find((transition) => transition.isDefault);
    const blocker = getStageRouteBlocker(current, facts, winner, evaluateWorkflowCondition);
    if (blocker) return { status: 'blocked', message: blocker, steps };
    if (eligible.length > 1 && eligible[0].priority === eligible[1].priority) {
      return {
        status: 'blocked',
        message: `${current.name} has multiple matching routes with priority ${eligible[0].priority}.`,
        steps,
      };
    }
    if (!winner) {
      return {
        status: 'blocked',
        message: `No route matches after ${current.name}. Add a matching condition or a default route.`,
        steps,
      };
    }

    const next = stageById.get(winner.toStageId);
    if (!next) {
      return {
        status: 'invalid',
        message: `${current.name} routes to a stage that no longer exists.`,
        steps,
      };
    }
    step.transitionId = winner.id;
    step.nextStageId = next.id;
    step.routeKind = winner.isDefault ? 'default' : 'condition';
    step.otherMatchingRoutes = Math.max(0, eligible.length - 1);
    current = next;
  }

  return { status: 'invalid', message: 'The route could not be evaluated.', steps };
}
