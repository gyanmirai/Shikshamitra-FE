import type { AcademicSetupNodeType } from './academic-setup-model';

export type AcademicOrderKind = 'stage' | 'class' | 'division';

export const academicOrderKinds: Partial<Record<AcademicSetupNodeType, AcademicOrderKind>> = {
  Medium: 'stage',
  Organization: 'class',
  Standard: 'division',
};

export const academicOrderLabels: Record<
  AcademicOrderKind,
  { singular: string; plural: string; title: string }
> = {
  stage: { singular: 'Stage', plural: 'stages', title: 'Reorder Stages' },
  class: { singular: 'Class', plural: 'classes', title: 'Reorder Classes' },
  division: { singular: 'Division', plural: 'divisions', title: 'Reorder Divisions' },
};
