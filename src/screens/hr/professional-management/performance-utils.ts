import type {
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

export function getSectionWeightTotal(sections: PerformanceTemplateSection[] = []) {
  return Number(sections.reduce((sum, section) => sum + Number(section.weight || 0), 0).toFixed(2));
}

export function isTemplatePublishable(sections: PerformanceTemplateSection[] = []) {
  return (
    getSectionWeightTotal(sections) === 100 && sections.every((section) => section.criteria?.length)
  );
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
