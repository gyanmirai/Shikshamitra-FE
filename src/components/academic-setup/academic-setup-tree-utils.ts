import type { AcademicSetupNode } from './academic-setup-model';

export const getAcademicSetupAncestorIds = (node: AcademicSetupNode): string[] => {
  const { board, medium, organization, standard } = node.parentsData;

  return [board?.id, medium?.id, organization?.id, standard?.id].filter((id): id is string =>
    Boolean(id)
  );
};

export const expandAcademicSetupAncestors = (
  current: Record<string, boolean>,
  node: AcademicSetupNode
): Record<string, boolean> => {
  const next = { ...current };
  getAcademicSetupAncestorIds(node).forEach((id) => {
    next[id] = true;
  });
  return next;
};
