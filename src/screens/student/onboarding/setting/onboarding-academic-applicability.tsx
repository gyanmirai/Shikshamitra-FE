'use client';

import type { Board } from 'src/types/school';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type {
  AcademicApplicableRule,
  AcademicApplicabilityMode,
} from '../onboarding-settings-model';

export type AcademicStructureOption = {
  id: string;
  name: string;
  label: string;
  boardId: string;
  academicMediumId?: string;
  academicMediumStageId?: string;
  standardId?: string;
  divisionId?: string;
};

export type OnboardingAcademicStructureOptions = {
  boards: AcademicStructureOption[];
  mediums: AcademicStructureOption[];
  stages: AcademicStructureOption[];
  standards: AcademicStructureOption[];
  divisions: AcademicStructureOption[];
};

export const buildOnboardingAcademicStructureOptions = (
  boards: Board[]
): OnboardingAcademicStructureOptions => {
  const boardOptions: AcademicStructureOption[] = [];
  const mediums: AcademicStructureOption[] = [];
  const stages: AcademicStructureOption[] = [];
  const standards: AcademicStructureOption[] = [];
  const divisions: AcademicStructureOption[] = [];

  boards.forEach((board) => {
    if (!['CBSE', 'GSEB'].includes(board.name.trim().toUpperCase())) return;
    boardOptions.push({ id: board.id, name: board.name, label: board.name, boardId: board.id });
    (board.educationMediums ?? []).forEach((medium) => {
      mediums.push({
        id: medium.id,
        name: medium.name,
        label: medium.name,
        boardId: board.id,
        academicMediumId: medium.id,
      });
      (medium.educationMediumStages ?? []).forEach((stage) => {
        const levelName = stage.name.replace(`${board.name} - ${medium.name} - `, '').trim();
        if (!['secondary', 'higher secondary'].includes(levelName.toLowerCase())) return;
        stages.push({
          id: stage.id,
          name: stage.name,
          label: levelName,
          boardId: board.id,
          academicMediumId: medium.id,
          academicMediumStageId: stage.id,
        });
        (stage.standards ?? []).forEach((standard) => {
          standards.push({
            id: standard.id,
            name: standard.name,
            label: standard.name,
            boardId: board.id,
            academicMediumId: medium.id,
            academicMediumStageId: stage.id,
            standardId: standard.id,
          });
          (standard.divisions ?? []).forEach((division) => {
            divisions.push({
              id: division.id,
              name: division.name,
              label: `${board.name} / ${medium.name} / ${stage.name} / ${standard.name} / ${division.name}`,
              boardId: board.id,
              academicMediumId: medium.id,
              academicMediumStageId: stage.id,
              standardId: standard.id,
              divisionId: division.id,
            });
          });
        });
      });
    });
  });

  return { boards: boardOptions, mediums, stages, standards, divisions };
};

const selectedParentIds = (
  mode: AcademicApplicabilityMode,
  selectedIds: string[],
  availableIds: string[]
) => (mode === 'all' ? availableIds : selectedIds);

const filterAcademicOptions = (
  value: AcademicApplicableRule,
  options: OnboardingAcademicStructureOptions
) => {
  const boardIds = selectedParentIds(
    value.boardMode,
    value.boardIds,
    options.boards.map((option) => option.id)
  );
  const mediums = options.mediums.filter((option) => boardIds.includes(option.boardId));
  const mediumIds = selectedParentIds(
    value.mediumMode,
    value.academicMediumIds,
    mediums.map((option) => option.id)
  );
  const stages = options.stages.filter(
    (option) =>
      boardIds.includes(option.boardId) &&
      Boolean(option.academicMediumId && mediumIds.includes(option.academicMediumId))
  );
  const stageIds = selectedParentIds(
    value.stageMode,
    value.academicMediumStageIds,
    stages.map((option) => option.id)
  );
  const standards = options.standards.filter(
    (option) =>
      boardIds.includes(option.boardId) &&
      Boolean(option.academicMediumId && mediumIds.includes(option.academicMediumId)) &&
      Boolean(option.academicMediumStageId && stageIds.includes(option.academicMediumStageId))
  );
  const standardIds = selectedParentIds(
    value.classMode,
    value.standardIds,
    standards.map((option) => option.id)
  );
  const divisions = options.divisions.filter(
    (option) =>
      boardIds.includes(option.boardId) &&
      Boolean(option.academicMediumId && mediumIds.includes(option.academicMediumId)) &&
      Boolean(option.academicMediumStageId && stageIds.includes(option.academicMediumStageId)) &&
      Boolean(option.standardId && standardIds.includes(option.standardId))
  );

  return { mediums, stages, standards, divisions };
};

const normalizeApplicability = (
  value: AcademicApplicableRule,
  options: OnboardingAcademicStructureOptions
): AcademicApplicableRule => {
  const boardIds = value.boardIds.filter((id) => options.boards.some((option) => option.id === id));
  const withBoards = { ...value, boardIds };
  const availableAfterBoard = filterAcademicOptions(withBoards, options);
  const academicMediumIds = value.academicMediumIds.filter((id) =>
    availableAfterBoard.mediums.some((option) => option.id === id)
  );
  const withMediums = { ...withBoards, academicMediumIds };
  const availableAfterMedium = filterAcademicOptions(withMediums, options);
  const academicMediumStageIds = value.academicMediumStageIds.filter((id) =>
    availableAfterMedium.stages.some((option) => option.id === id)
  );
  const withStages = { ...withMediums, academicMediumStageIds };
  const availableAfterStage = filterAcademicOptions(withStages, options);
  const standardIds = value.standardIds.filter((id) =>
    availableAfterStage.standards.some((option) => option.id === id)
  );
  const withStandards = { ...withStages, standardIds };
  const availableAfterClass = filterAcademicOptions(withStandards, options);
  const divisionIds = value.divisionIds.filter((id) =>
    availableAfterClass.divisions.some((option) => option.id === id)
  );

  return { ...withStandards, divisionIds };
};

export const normalizeSingleAcademicApplicability = (
  value: AcademicApplicableRule,
  boards: Board[]
): AcademicApplicableRule => {
  const singleValue: AcademicApplicableRule = {
    ...value,
    boardMode: 'selected',
    boardIds: value.boardIds.slice(0, 1),
    mediumMode: 'selected',
    academicMediumIds: value.academicMediumIds.slice(0, 1),
    stageMode: 'selected',
    academicMediumStageIds: value.academicMediumStageIds,
    classMode: 'selected',
    standardIds: value.standardIds,
    divisionMode: value.divisionMode,
    divisionIds: value.divisionIds,
    includeFutureStructures: false,
  };

  return normalizeApplicability(singleValue, buildOnboardingAcademicStructureOptions(boards));
};

export const createEmptySingleAcademicApplicability = (): AcademicApplicableRule => ({
  boardMode: 'selected',
  boardIds: [],
  mediumMode: 'selected',
  academicMediumIds: [],
  stageMode: 'selected',
  academicMediumStageIds: [],
  classMode: 'selected',
  standardIds: [],
  divisionMode: 'all',
  divisionIds: [],
  includeFutureStructures: false,
});

export const getSingleAcademicPathValidationError = (value: AcademicApplicableRule) => {
  if (value.boardMode !== 'selected' || value.boardIds.length !== 1) return 'Select one Board.';
  if (value.mediumMode !== 'selected' || value.academicMediumIds.length !== 1) {
    return 'Select one Medium.';
  }
  if (value.stageMode !== 'selected' || value.academicMediumStageIds.length === 0) {
    return 'Select at least one School Level.';
  }
  if (value.classMode !== 'selected' || value.standardIds.length === 0) {
    return 'Select at least one Standard.';
  }
  if (value.divisionMode === 'selected' && value.divisionIds.length === 0) {
    return 'Select at least one Division.';
  }
  return null;
};

const getSelectedNames = (ids: string[], options: AcademicStructureOption[]) =>
  ids.map((id) => options.find((option) => option.id === id)?.name ?? id);

const summarizeDimension = (
  mode: AcademicApplicabilityMode,
  ids: string[],
  options: AcademicStructureOption[],
  allLabel: string,
  singularLabel: string
) => {
  if (mode === 'all') return allLabel;
  const names = getSelectedNames(ids, options);
  if (names.length === 1) return names[0];
  return `${names.length} ${singularLabel}${names.length === 1 ? '' : 's'}`;
};

export const getAcademicApplicabilitySummary = (value: AcademicApplicableRule, boards: Board[]) => {
  const options = buildOnboardingAcademicStructureOptions(boards);
  return [
    summarizeDimension(value.boardMode, value.boardIds, options.boards, 'All Boards', 'Board'),
    summarizeDimension(
      value.mediumMode,
      value.academicMediumIds,
      options.mediums,
      'All Media',
      'Medium'
    ),
    summarizeDimension(
      value.stageMode,
      value.academicMediumStageIds,
      options.stages,
      'All School Levels',
      'School Level'
    ),
    summarizeDimension(
      value.classMode,
      value.standardIds,
      options.standards,
      'All Classes',
      'Class'
    ),
    summarizeDimension(
      value.divisionMode,
      value.divisionIds,
      options.divisions,
      'All Divisions',
      'Division'
    ),
  ].join(' / ');
};

/** Preserve hierarchy IDs while showing concise labels in dependent selectors. */
export function AcademicApplicabilityFields({
  value, boards, onChange, showErrors = false,
}: {
  value: AcademicApplicableRule;
  boards: Board[];
  onChange: (value: AcademicApplicableRule) => void;
  showErrors?: boolean;
}) {
  const options = useMemo(() => buildOnboardingAcademicStructureOptions(boards), [boards]);
  const available = useMemo(() => filterAcademicOptions(value, options), [options, value]);
  const update = (patch: Partial<AcademicApplicableRule>) =>
    onChange(normalizeApplicability({ ...value, includeFutureStructures: false, ...patch }, options));
  const boardId = value.boardMode === 'selected' ? value.boardIds[0] ?? '' : '';
  const mediumId = value.mediumMode === 'selected' ? value.academicMediumIds[0] ?? '' : '';
  const stages = value.stageMode === 'selected' ? value.academicMediumStageIds : [];
  const standards = value.classMode === 'selected' ? value.standardIds : [];
  const selectOptions = (choices: AcademicStructureOption[]) =>
    choices.map((option) => ({ value: option.id, label: option.label }));
  const multiple = (
    label: string, ids: string[], choices: AcademicStructureOption[],
    disabled: boolean, onSelect: (ids: string[]) => void, optional = false
  ) => (
    <ShakingTextField error={showErrors && !optional && ids.length === 0}>
      <CustomSelect
        size="small" label={label} multiple value={ids} options={selectOptions(choices)}
        required={!optional} disabled={disabled || choices.length === 0}
        error={showErrors && !optional && ids.length === 0}
        helperText={disabled ? 'Choose the parent selection first.' : optional ? 'Leave empty for all divisions in the selected standards.' : undefined}
        onChange={(selectedIds) => onSelect(selectedIds.map(String))}
      />
    </ShakingTextField>
  );
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
      <ShakingTextField error={showErrors && !boardId}>
        <CustomSelect size="small" required label="Board" value={boardId}
          options={selectOptions(options.boards)} disabled={!options.boards.length}
          error={showErrors && !boardId}
          onChange={(id) => update({
            boardMode: 'selected', boardIds: [String(id)],
            mediumMode: 'selected', academicMediumIds: [],
            stageMode: 'selected', academicMediumStageIds: [],
            classMode: 'selected', standardIds: [], divisionMode: 'all', divisionIds: [],
          })} />
      </ShakingTextField>
      <ShakingTextField error={showErrors && !mediumId}>
        <CustomSelect size="small" required label="Medium" value={mediumId}
          options={selectOptions(available.mediums)} disabled={!boardId || !available.mediums.length}
          error={showErrors && !mediumId} helperText={!boardId ? 'Choose a board first.' : undefined}
          onChange={(id) => update({
            mediumMode: 'selected', academicMediumIds: [String(id)],
            stageMode: 'selected', academicMediumStageIds: [],
            classMode: 'selected', standardIds: [], divisionMode: 'all', divisionIds: [],
          })} />
      </ShakingTextField>
      {multiple('School levels', stages, available.stages, !mediumId, (ids) => update({
        stageMode: 'selected', academicMediumStageIds: ids,
        classMode: 'selected', standardIds: [], divisionMode: 'all', divisionIds: [],
      }))}
      {multiple('Standards', standards, available.standards, !stages.length, (ids) => update({
        classMode: 'selected', standardIds: ids, divisionMode: 'all', divisionIds: [],
      }))}
      <Box sx={{ gridColumn: '1 / -1' }}>
        {multiple('Divisions', value.divisionIds, available.divisions, !standards.length, (ids) => update({
          divisionMode: ids.length ? 'selected' : 'all', divisionIds: ids,
        }), true)}
      </Box>
    </Box>
  );
}

export const SingleAcademicPathFields = AcademicApplicabilityFields;
