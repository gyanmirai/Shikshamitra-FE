import type { HierarchyCounts } from './academic-setup-model';

type HierarchyBoardInput = {
  educationMediums?: Array<{
    educationMediumStages?: Array<{
      standards?: Array<{ divisions?: readonly unknown[] }>;
    }>;
  }>;
};

export type HierarchyLevel = {
  key: keyof HierarchyCounts;
  label: string;
  singular: string;
  icon: string;
};

export const HIERARCHY_LEVELS: HierarchyLevel[] = [
  { key: 'boards', label: 'Boards', singular: 'board', icon: 'solar:library-bold-duotone' },
  { key: 'mediums', label: 'Mediums', singular: 'medium', icon: 'solar:global-bold-duotone' },
  {
    key: 'stages',
    label: 'Stages',
    singular: 'stage',
    icon: 'solar:layers-minimalistic-bold-duotone',
  },
  {
    key: 'standards',
    label: 'Standards',
    singular: 'standard',
    icon: 'solar:notebook-bold-duotone',
  },
  {
    key: 'divisions',
    label: 'Divisions',
    singular: 'division',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
];

export const getHierarchyCounts = (boards: readonly HierarchyBoardInput[]): HierarchyCounts => {
  const mediums = boards.flatMap((board) => board.educationMediums ?? []);
  const stages = mediums.flatMap((medium) => medium.educationMediumStages ?? []);
  const standards = stages.flatMap((stage) => stage.standards ?? []);
  const divisions = standards.flatMap((standard) => standard.divisions ?? []);

  return {
    boards: boards.length,
    mediums: mediums.length,
    stages: stages.length,
    standards: standards.length,
    divisions: divisions.length,
  };
};

export const getHierarchyCoverage = (counts: HierarchyCounts) => {
  const completedLevels = HIERARCHY_LEVELS.filter((level) => counts[level.key] > 0).length;

  return {
    completedLevels,
    percentage: (completedLevels / HIERARCHY_LEVELS.length) * 100,
  };
};

export const getHierarchyNextStep = (counts: HierarchyCounts) => {
  const firstEmptyLevel = HIERARCHY_LEVELS.find((level) => counts[level.key] === 0);

  if (!firstEmptyLevel) {
    return 'All five hierarchy levels are in use. Select any item to review or extend it.';
  }

  const levelIndex = HIERARCHY_LEVELS.indexOf(firstEmptyLevel);
  if (levelIndex === 0) return 'Start by adding the first education board for this academic year.';

  const parent = HIERARCHY_LEVELS[levelIndex - 1];
  return `Next, select a ${parent.singular} and add its first ${firstEmptyLevel.singular}.`;
};
