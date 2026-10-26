import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

export type AcademicYearRecord = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
};

export type AcademicSetupNodeType =
  'Academic Year' | 'Education Board' | 'Medium' | 'Organization' | 'Standard' | 'Division';

export type AcademicSetupParents = {
  year?: AcademicYearRecord;
  board?: Board;
  medium?: Medium;
  organization?: Organization;
  standard?: Standards;
};

export type AcademicSetupEntity =
  AcademicYearRecord | Board | Medium | Organization | Standards | Division;

export type AcademicSetupNode = {
  id: string;
  name: string;
  type: AcademicSetupNodeType;
  data: AcademicSetupEntity;
  children?: AcademicSetupNode[];
  parentsData: AcademicSetupParents;
};

export type HierarchyCounts = {
  boards: number;
  mediums: number;
  stages: number;
  standards: number;
  divisions: number;
};

export const NODE_TYPE_META: Record<
  AcademicSetupNodeType,
  { icon: string; label: string; childLabel: string; addLabel: string }
> = {
  'Academic Year': {
    icon: 'solar:calendar-bold-duotone',
    label: 'Academic year',
    childLabel: 'Education Boards',
    addLabel: 'Add board',
  },
  'Education Board': {
    icon: 'solar:library-bold-duotone',
    label: 'Board',
    childLabel: 'Mediums',
    addLabel: 'Add medium',
  },
  Medium: {
    icon: 'solar:global-bold-duotone',
    label: 'Medium',
    childLabel: 'Stages',
    addLabel: 'Add stage',
  },
  Organization: {
    icon: 'solar:layers-minimalistic-bold-duotone',
    label: 'Stage',
    childLabel: 'Standards',
    addLabel: 'Add standard',
  },
  Standard: {
    icon: 'solar:notebook-bold-duotone',
    label: 'Standard',
    childLabel: 'Divisions',
    addLabel: 'Add division',
  },
  Division: {
    icon: 'solar:users-group-rounded-bold-duotone',
    label: 'Division',
    childLabel: '',
    addLabel: '',
  },
};

export const buildHierarchyTree = (
  boards: readonly Board[],
  year: AcademicYearRecord
): AcademicSetupNode[] =>
  boards.map((board) => ({
    id: board.id,
    name: board.name,
    type: 'Education Board',
    data: board,
    parentsData: { year },
    children: (board.educationMediums ?? []).map((medium) => ({
      id: medium.id,
      name: medium.name,
      type: 'Medium',
      data: medium,
      parentsData: { year, board },
      children: (medium.educationMediumStages ?? []).map((stage) => ({
        id: stage.id,
        name: stage.name,
        type: 'Organization',
        data: stage,
        parentsData: { year, board, medium },
        children: (stage.standards ?? []).map((standard) => ({
          id: standard.id,
          name: standard.name,
          type: 'Standard',
          data: standard,
          parentsData: { year, board, medium, organization: stage },
          children: (standard.divisions ?? []).map((division) => ({
            id: division.id,
            name: division.name,
            type: 'Division',
            data: division,
            parentsData: { year, board, medium, organization: stage, standard },
          })),
        })),
      })),
    })),
  }));

export const findHierarchyNode = (
  nodes: readonly AcademicSetupNode[],
  id: string,
  type: AcademicSetupNodeType
): AcademicSetupNode | null => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === id && node.type === type) return node;
    const match = findHierarchyNode(node.children ?? [], id, type);
    if (match) return match;
  }
  return null;
};
