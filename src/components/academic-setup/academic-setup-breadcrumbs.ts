import type {
  AcademicYearRecord,
  AcademicSetupNode,
  AcademicSetupNodeType,
} from './academic-setup-model';

export type AcademicSetupCrumb = {
  id: string;
  name: string;
  type: AcademicSetupNodeType;
};

export const getAcademicSetupBreadcrumbs = (
  node: AcademicSetupNode,
  currentYear: AcademicYearRecord
): AcademicSetupCrumb[] => {
  const parents = node.parentsData;
  const crumbs: AcademicSetupCrumb[] = [
    {
      id: parents.year?.id ?? currentYear.id,
      name: parents.year?.name ?? currentYear.name,
      type: 'Academic Year',
    },
  ];

  if (parents.board) {
    crumbs.push({ id: parents.board.id, name: parents.board.name, type: 'Education Board' });
  }
  if (parents.medium) {
    crumbs.push({ id: parents.medium.id, name: parents.medium.name, type: 'Medium' });
  }
  if (parents.organization) {
    crumbs.push({
      id: parents.organization.id,
      name: parents.organization.name,
      type: 'Organization',
    });
  }
  if (parents.standard) {
    crumbs.push({ id: parents.standard.id, name: parents.standard.name, type: 'Standard' });
  }
  if (node.type !== 'Academic Year') {
    crumbs.push({ id: node.id, name: node.name, type: node.type });
  }

  return crumbs;
};
