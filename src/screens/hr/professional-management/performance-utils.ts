import type {
  ProfessionalReview,
  PerformanceEvidence,
  PerformanceTemplate,
  ProfessionalReviewCycle,
  PerformanceReviewResponse,
  PerformanceTemplateSection,
  PerformanceTemplateCriterion,
} from 'src/redux/hr/professional-management-api';

export const stageLabels: Record<number, string> = {
  0: 'Self Appraisal',
  1: 'Reporting Manager',
  2: 'HOD / Coordinator',
  3: 'Principal / Management',
  4: 'HR Verification',
};

export const cycleStatusLabels: Record<number, string> = {
  0: 'Draft',
  1: 'Published',
  2: 'In Progress',
  3: 'Calibration',
  4: 'Finalized',
  5: 'Archived',
};

export const staffCategoryLabels: Record<number, string> = {
  0: 'Teacher',
  1: 'Class Teacher',
  2: 'HOD / Coordinator',
  3: 'Principal / Vice Principal',
  4: 'Admin',
  5: 'Accounts',
  6: 'Librarian / Lab Assistant',
  7: 'Transport',
  8: 'Security / Housekeeping',
  9: 'IT / Support',
};

export const boardTypeLabels: Record<number, string> = {
  0: 'Generic Indian',
  1: 'CBSE',
  2: 'GSEB',
};

export const sqaaDomainLabels: Record<number, string> = {
  0: 'Curriculum, Pedagogy & Assessment',
  1: 'Infrastructure',
  2: 'Human Resources',
  3: 'Leadership & Governance',
  4: 'Inclusiveness and Well-being',
  5: 'Beneficiary Satisfaction',
  6: 'Management and School Processes',
};

export function getSectionWeightTotal(sections: PerformanceTemplateSection[] = []) {
  return Number(sections.reduce((sum, section) => sum + Number(section.weight || 0), 0).toFixed(2));
}

export function isTemplatePublishable(sections: PerformanceTemplateSection[] = []) {
  return (
    getSectionWeightTotal(sections) === 100 && sections.every((section) => section.criteria?.length)
  );
}

export function formatPerformanceScore(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-';

  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(2)}%` : '-';
}

export function getPerformanceErrorMessage(error: unknown, fallback: string) {
  const value = error as
    | {
        data?: {
          error?: { code?: string; message?: string };
          code?: string;
          message?: string;
        };
        error?: string;
      }
    | undefined;
  const code = value?.data?.error?.code || value?.data?.code;

  if (code === 'HR:ProfessionalManagement:060007') {
    return 'Add evidence for each required criterion before submitting.';
  }

  return value?.data?.error?.message || value?.data?.message || value?.error || fallback;
}

export type PerformanceWorkspaceMode = 'self' | 'review' | 'observation' | 'outcome';

export type PerformanceWorkspaceCapabilities = {
  stageType: number;
  allowStageSelection: boolean;
  canEditRatings: boolean;
  canAddEvidence: boolean;
  canSaveDraft: boolean;
  canSubmitStage: boolean;
  canAddObservation: boolean;
  canAddFeedback: boolean;
  canAddDevelopmentPlan: boolean;
  canFinalizeOutcome: boolean;
  summaryLabel: string;
};

export function getPerformanceWorkspaceCapabilities(
  mode: PerformanceWorkspaceMode
): PerformanceWorkspaceCapabilities {
  const base = {
    allowStageSelection: false,
    canEditRatings: false,
    canAddEvidence: false,
    canSaveDraft: false,
    canSubmitStage: false,
    canAddObservation: false,
    canAddFeedback: false,
    canAddDevelopmentPlan: false,
    canFinalizeOutcome: false,
    summaryLabel: 'Stage comment',
  };

  if (mode === 'self') {
    return {
      ...base,
      stageType: 0,
      canEditRatings: true,
      canAddEvidence: true,
      canSaveDraft: true,
      canSubmitStage: true,
    };
  }

  if (mode === 'review') {
    return {
      ...base,
      stageType: 1,
      allowStageSelection: true,
      canEditRatings: true,
      canAddEvidence: true,
      canSaveDraft: true,
      canSubmitStage: true,
      canAddFeedback: true,
    };
  }

  if (mode === 'observation') {
    return {
      ...base,
      stageType: 1,
      canAddObservation: true,
      summaryLabel: 'Observation notes',
    };
  }

  return {
    ...base,
    stageType: 3,
    canAddDevelopmentPlan: true,
    canFinalizeOutcome: true,
    summaryLabel: 'Outcome notes',
  };
}

const normalizePerformanceText = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const normalizeDateOnly = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export function getUniquePerformanceTemplates(templates: PerformanceTemplate[] = []) {
  const byKey = new Map<string, PerformanceTemplate>();

  templates.forEach((template) => {
    const key = [
      normalizePerformanceText(template.name),
      Number(template.boardType ?? 0),
      Number(template.staffCategory),
    ].join('|');
    const current = byKey.get(key);
    if (!current || (Number(template.status) === 1 && Number(current.status) !== 1)) {
      byKey.set(key, template);
    }
  });

  return Array.from(byKey.values());
}

export function hasDuplicatePerformanceCycle({
  cycles,
  name,
  periodStart,
  periodEnd,
}: {
  cycles: ProfessionalReviewCycle[];
  name: string;
  periodStart: string | Date;
  periodEnd: string | Date;
}) {
  const normalizedName = normalizePerformanceText(name);
  const start = normalizeDateOnly(periodStart);
  const end = normalizeDateOnly(periodEnd);

  return cycles.some((cycle) => {
    const status = Number(cycle.status);
    return (
      status !== 4 &&
      status !== 5 &&
      normalizePerformanceText(cycle.name) === normalizedName &&
      normalizeDateOnly(cycle.periodStart) === start &&
      normalizeDateOnly(cycle.periodEnd) === end
    );
  });
}

export function getLatestActivePerformanceCycle(cycles: ProfessionalReviewCycle[] = []) {
  return [...cycles]
    .filter((cycle) => {
      const status = Number(cycle.status);
      return status !== 4 && status !== 5;
    })
    .sort((a, b) => {
      const aDate = new Date(a.periodStart || 0).getTime();
      const bDate = new Date(b.periodStart || 0).getTime();
      const byPeriodStart = bDate - aDate;
      if (byPeriodStart !== 0) return byPeriodStart;

      return normalizePerformanceText(b.name).localeCompare(normalizePerformanceText(a.name));
    })[0];
}

export function filterPerformanceReviews({
  reviews,
  cycleId,
  status,
}: {
  reviews: ProfessionalReview[];
  cycleId?: string;
  status?: string;
}) {
  return reviews.filter((review) => {
    const cycleMatches = !cycleId || cycleId === 'all' || review.cycleId === cycleId;
    const statusMatches = !status || status === 'all' || Number(review.status) === Number(status);
    return cycleMatches && statusMatches;
  });
}

export function getMissingRequiredEvidenceCriteria({
  criteria,
  responses,
  evidence,
}: {
  criteria: PerformanceTemplateCriterion[];
  responses: PerformanceReviewResponse[];
  evidence: PerformanceEvidence[];
}) {
  const responseByCriterion = new Map(
    responses.map((response) => [response.criterionId, response])
  );
  const evidenceCriterionIds = new Set(
    evidence
      .map((item) => item.criterionId)
      .filter((criterionId): criterionId is string => Boolean(criterionId))
  );

  return criteria.filter((criterion) => {
    if (!criterion.id || !criterion.evidenceRequired) return false;

    const response = responseByCriterion.get(criterion.id);
    return Boolean(
      response && !response.isNotApplicable && !evidenceCriterionIds.has(criterion.id)
    );
  });
}

export function calculateWeightedScore({
  sections,
  criteria,
  responses,
  ratingScaleMax = 5,
}: {
  sections: PerformanceTemplateSection[];
  criteria: PerformanceTemplateCriterion[];
  responses: PerformanceReviewResponse[];
  ratingScaleMax?: number;
}) {
  const responseByCriterion = new Map(
    responses.map((response) => [response.criterionId, response])
  );

  return Number(
    sections
      .reduce((total, section) => {
        const sectionCriteria = criteria.filter((criterion) => {
          const response = responseByCriterion.get(criterion.id || '');
          return (
            criterion.sectionId === section.id &&
            response &&
            !response.isNotApplicable &&
            response.rating
          );
        });
        const applicableWeight = sectionCriteria.reduce(
          (sum, criterion) => sum + Number(criterion.weight || 0),
          0
        );
        if (!applicableWeight) return total;
        const sectionScore = sectionCriteria.reduce((sum, criterion) => {
          const response = responseByCriterion.get(criterion.id || '');
          return (
            sum +
            (Number(response?.rating || 0) / ratingScaleMax) *
              (Number(criterion.weight || 0) / applicableWeight)
          );
        }, 0);
        return total + sectionScore * Number(section.weight || 0);
      }, 0)
      .toFixed(2)
  );
}
