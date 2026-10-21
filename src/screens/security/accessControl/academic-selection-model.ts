import type { Board } from 'src/types/school';
import type { AccessSelection } from 'src/utils/academicHierarchyUtils';

export type AcademicSelectionNode = {
  id: string;
  name: string;
  type: keyof AccessSelection;
  parentId: string | null;
  children?: AcademicSelectionNode[];
};

export type SelectionStatus = 'full' | 'partial' | 'none';

export const buildAcademicSelectionTree = (boards: Board[]): AcademicSelectionNode[] =>
  boards.map((board) => ({
    id: board.id,
    name: board.name,
    type: 'boards',
    parentId: null,
    children: board.educationMediums?.map((medium) => ({
      id: medium.id,
      name: medium.name,
      type: 'mediums',
      parentId: board.id,
      children: medium.educationMediumStages?.map((stage) => ({
        id: stage.id,
        name: stage.name,
        type: 'organizations',
        parentId: medium.id,
        children: stage.standards?.map((standard) => ({
          id: standard.id,
          name: standard.name,
          type: 'standards',
          parentId: stage.id,
          children: standard.divisions?.map((division) => ({
            id: division.id,
            name: division.name,
            type: 'divisions',
            parentId: standard.id,
          })),
        })),
      })),
    })),
  }));

export function buildAcademicSelectionStatus(
  roots: AcademicSelectionNode[],
  selection: AccessSelection
) {
  const selected = new Set(Object.values(selection).flat());
  const statuses = new Map<string, SelectionStatus>();
  const visit = (node: AcademicSelectionNode): SelectionStatus => {
    const children = node.children ?? [];
    let status: SelectionStatus;
    if (!children.length) status = selected.has(node.id) ? 'full' : 'none';
    else {
      const childStatuses = children.map(visit);
      if (childStatuses.every((value) => value === 'full')) status = 'full';
      else if (childStatuses.every((value) => value === 'none')) status = 'none';
      else status = 'partial';
    }
    statuses.set(node.id, status);
    return status;
  };
  roots.forEach(visit);
  return statuses;
}

export function toggleAcademicSelection(
  roots: AcademicSelectionNode[],
  node: AcademicSelectionNode,
  selection: AccessSelection,
  deselect: boolean
): AccessSelection {
  const updated: AccessSelection = {
    boards: [...selection.boards],
    mediums: [...selection.mediums],
    organizations: [...selection.organizations],
    standards: [...selection.standards],
    divisions: [...selection.divisions],
  };
  const subtree = new Map<keyof AccessSelection, Set<string>>();
  const collect = (current: AcademicSelectionNode) => {
    const ids = subtree.get(current.type) ?? new Set<string>();
    ids.add(current.id);
    subtree.set(current.type, ids);
    current.children?.forEach(collect);
  };
  collect(node);
  subtree.forEach((ids, type) => {
    updated[type] = deselect
      ? updated[type].filter((id) => !ids.has(id))
      : Array.from(new Set([...updated[type], ...ids]));
  });
  if (deselect) {
    // A retained ancestor would grant the unchecked child again when compressed for saving.
    const parents = new Map<string, AcademicSelectionNode>();
    const index = (current: AcademicSelectionNode) => {
      parents.set(current.id, current);
      current.children?.forEach(index);
    };
    roots.forEach(index);
    let parent = node.parentId ? parents.get(node.parentId) : undefined;
    while (parent) {
      const ancestor = parent;
      updated[ancestor.type] = updated[ancestor.type].filter((id) => id !== ancestor.id);
      parent = ancestor.parentId ? parents.get(ancestor.parentId) : undefined;
    }
  }
  return updated;
}
