'use client';

import type { Board } from 'src/types/school';

import { useMemo } from 'react';
import {
  Box,
  Paper,
  Stack,
  Switch,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

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
    boardOptions.push({ id: board.id, name: board.name, label: board.name, boardId: board.id });
    (board.educationMediums ?? []).forEach((medium) => {
      mediums.push({
        id: medium.id,
        name: medium.name,
        label: `${board.name} / ${medium.name}`,
        boardId: board.id,
        academicMediumId: medium.id,
      });
      (medium.educationMediumStages ?? []).forEach((stage) => {
        stages.push({
          id: stage.id,
          name: stage.name,
          label: `${board.name} / ${medium.name} / ${stage.name}`,
          boardId: board.id,
          academicMediumId: medium.id,
          academicMediumStageId: stage.id,
        });
        (stage.standards ?? []).forEach((standard) => {
          standards.push({
            id: standard.id,
            name: standard.name,
            label: `${board.name} / ${medium.name} / ${stage.name} / ${standard.name}`,
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
    academicMediumStageIds: value.academicMediumStageIds.slice(0, 1),
    classMode: 'selected',
    standardIds: value.standardIds.slice(0, 1),
    divisionMode: 'selected',
    divisionIds: value.divisionIds.slice(0, 1),
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
  divisionMode: 'selected',
  divisionIds: [],
  includeFutureStructures: false,
});

export const getSingleAcademicPathValidationError = (value: AcademicApplicableRule) => {
  if (value.boardMode !== 'selected' || value.boardIds.length !== 1) return 'Select one Board.';
  if (value.mediumMode !== 'selected' || value.academicMediumIds.length !== 1) {
    return 'Select one Medium.';
  }
  if (value.stageMode !== 'selected' || value.academicMediumStageIds.length !== 1) {
    return 'Select one School Level.';
  }
  if (value.classMode !== 'selected' || value.standardIds.length !== 1) {
    return 'Select one Class.';
  }
  if (value.divisionMode !== 'selected' || value.divisionIds.length !== 1) {
    return 'Select one Division.';
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

function DimensionFields({
  title,
  mode,
  selectedIds,
  options,
  allLabel,
  selectionLabel,
  emptyMessage,
  onModeChange,
  onSelectedIdsChange,
}: {
  title: string;
  mode: AcademicApplicabilityMode;
  selectedIds: string[];
  options: AcademicStructureOption[];
  allLabel: string;
  selectionLabel: string;
  emptyMessage: string;
  onModeChange: (mode: AcademicApplicabilityMode) => void;
  onSelectedIdsChange: (ids: string[]) => void;
}) {
  const selectionRequired = mode === 'selected' && selectedIds.length === 0;
  const pluralTitle = title === 'Class' ? 'Classes' : `${title}s`;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(180px, 0.7fr) minmax(0, 1.3fr)' },
        gap: 1.25,
      }}
    >
      <TextField
        select
        fullWidth
        size="small"
        label={`${title} coverage`}
        value={mode}
        onChange={(event) => onModeChange(event.target.value as AcademicApplicabilityMode)}
      >
        <MenuItem value="all">{allLabel}</MenuItem>
        <MenuItem value="selected">Selected {pluralTitle}</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        size="small"
        disabled={mode === 'all'}
        label={selectionLabel}
        value={selectedIds}
        onChange={(event) => {
          const { value } = event.target;
          onSelectedIdsChange(typeof value === 'string' ? value.split(',') : value);
        }}
        error={selectionRequired}
        helperText={
          selectionRequired
            ? `Select at least one ${title}.`
            : options.length
              ? undefined
              : emptyMessage
        }
        SelectProps={{
          multiple: true,
          renderValue: (selected) => {
            const ids = selected as string[];
            const names = getSelectedNames(ids, options);
            return names.length <= 2 ? names.join(', ') : `${names.length} selected`;
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Checkbox size="small" checked={selectedIds.includes(option.id)} />
            <Typography variant="body2">{option.label}</Typography>
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

export function AcademicApplicabilityFields({
  value,
  boards,
  onChange,
}: {
  value: AcademicApplicableRule;
  boards: Board[];
  onChange: (value: AcademicApplicableRule) => void;
}) {
  const options = useMemo(() => buildOnboardingAcademicStructureOptions(boards), [boards]);
  const available = useMemo(() => filterAcademicOptions(value, options), [options, value]);
  const update = (patch: Partial<AcademicApplicableRule>) =>
    onChange(normalizeApplicability({ ...value, ...patch }, options));

  const activeBoardIds = selectedParentIds(
    value.boardMode,
    value.boardIds,
    options.boards.map((option) => option.id)
  );
  const activeMediumIds = selectedParentIds(
    value.mediumMode,
    value.academicMediumIds,
    available.mediums.map((option) => option.id)
  );
  const activeStageIds = selectedParentIds(
    value.stageMode,
    value.academicMediumStageIds,
    available.stages.map((option) => option.id)
  );
  const activeStandardIds = selectedParentIds(
    value.classMode,
    value.standardIds,
    available.standards.map((option) => option.id)
  );
  const activeDivisionIds = selectedParentIds(
    value.divisionMode,
    value.divisionIds,
    available.divisions.map((option) => option.id)
  );

  return (
    <Stack spacing={1.5}>
      <DimensionFields
        title="Board"
        mode={value.boardMode}
        selectedIds={value.boardIds}
        options={options.boards}
        allLabel="All Boards"
        selectionLabel="Selected Boards"
        emptyMessage="No Board is configured for the active academic year."
        onModeChange={(boardMode) => update({ boardMode, boardIds: [] })}
        onSelectedIdsChange={(boardIds) => update({ boardIds })}
      />
      <DimensionFields
        title="Medium"
        mode={value.mediumMode}
        selectedIds={value.academicMediumIds}
        options={available.mediums}
        allLabel="All Media"
        selectionLabel="Selected Media"
        emptyMessage="Configure a Medium below the selected Board coverage first."
        onModeChange={(mediumMode) => update({ mediumMode, academicMediumIds: [] })}
        onSelectedIdsChange={(academicMediumIds) => update({ academicMediumIds })}
      />
      <DimensionFields
        title="School Level"
        mode={value.stageMode}
        selectedIds={value.academicMediumStageIds}
        options={available.stages}
        allLabel="All School Levels"
        selectionLabel="Selected School Levels"
        emptyMessage="Configure a School Level below the selected Medium coverage first."
        onModeChange={(stageMode) => update({ stageMode, academicMediumStageIds: [] })}
        onSelectedIdsChange={(academicMediumStageIds) => update({ academicMediumStageIds })}
      />
      <DimensionFields
        title="Class"
        mode={value.classMode}
        selectedIds={value.standardIds}
        options={available.standards}
        allLabel="All Classes"
        selectionLabel="Selected Classes"
        emptyMessage="Configure a Class below the selected School Level coverage first."
        onModeChange={(classMode) => update({ classMode, standardIds: [] })}
        onSelectedIdsChange={(standardIds) => update({ standardIds })}
      />
      <DimensionFields
        title="Division"
        mode={value.divisionMode}
        selectedIds={value.divisionIds}
        options={available.divisions}
        allLabel="All Divisions"
        selectionLabel="Selected Divisions"
        emptyMessage="Configure a Division below the selected Class coverage first."
        onModeChange={(divisionMode) => update({ divisionMode, divisionIds: [] })}
        onSelectedIdsChange={(divisionIds) => update({ divisionIds })}
      />

      <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'background.neutral' }}>
        <Typography variant="subtitle2">Current academic coverage</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {getAcademicApplicabilitySummary(value, boards)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activeBoardIds.length} Boards · {activeMediumIds.length} Media · {activeStageIds.length}{' '}
          School Levels · {activeStandardIds.length} Classes · {activeDivisionIds.length} Divisions
        </Typography>
      </Paper>

      <FormControlLabel
        sx={{ m: 0, alignItems: 'flex-start' }}
        control={
          <Switch
            checked={value.includeFutureStructures}
            onChange={(event) => update({ includeFutureStructures: event.target.checked })}
            slotProps={{ input: { 'aria-label': 'Include future academic structures' } }}
          />
        }
        label={
          <Box sx={{ pt: 0.5 }}>
            <Typography variant="subtitle2">Include future academic structures</Typography>
            <Typography variant="caption" color="text.secondary">
              This records the intended policy only. The backend must publish a reviewed snapshot
              before new matching structures can inherit the rule automatically.
            </Typography>
          </Box>
        }
      />
    </Stack>
  );
}

const getSingleSelectedId = (mode: AcademicApplicabilityMode, ids: string[]) =>
  mode === 'selected' ? (ids[0] ?? '') : '';

export function SingleAcademicPathFields({
  value,
  boards,
  onChange,
  showErrors = false,
}: {
  value: AcademicApplicableRule;
  boards: Board[];
  onChange: (value: AcademicApplicableRule) => void;
  showErrors?: boolean;
}) {
  const options = useMemo(() => buildOnboardingAcademicStructureOptions(boards), [boards]);
  const normalizedValue = useMemo(
    () => normalizeSingleAcademicApplicability(value, boards),
    [boards, value]
  );
  const available = useMemo(
    () => filterAcademicOptions(normalizedValue, options),
    [normalizedValue, options]
  );
  const update = (nextValue: AcademicApplicableRule) =>
    onChange(normalizeSingleAcademicApplicability(nextValue, boards));
  const boardSelected = normalizedValue.boardIds.length === 1;
  const mediumSelected = normalizedValue.academicMediumIds.length === 1;
  const stageSelected = normalizedValue.academicMediumStageIds.length === 1;
  const classSelected = normalizedValue.standardIds.length === 1;

  const selectValue = (
    selectedId: string,
    modeKey: 'boardMode' | 'mediumMode' | 'stageMode' | 'classMode' | 'divisionMode',
    idsKey:
      'boardIds' | 'academicMediumIds' | 'academicMediumStageIds' | 'standardIds' | 'divisionIds',
    reset: Partial<AcademicApplicableRule>
  ) =>
    update({
      ...normalizedValue,
      [modeKey]: 'selected',
      [idsKey]: selectedId ? [selectedId] : [],
      ...reset,
    });

  const fields = [
    {
      label: 'Board',
      value: getSingleSelectedId(normalizedValue.boardMode, normalizedValue.boardIds),
      emptyLabel: options.boards.length ? 'Select Board' : 'No Boards configured',
      errorMessage: 'Select one Board.',
      options: options.boards,
      disabled: options.boards.length === 0,
      onSelect: (selectedId: string) =>
        selectValue(selectedId, 'boardMode', 'boardIds', {
          mediumMode: 'selected',
          academicMediumIds: [],
          stageMode: 'selected',
          academicMediumStageIds: [],
          classMode: 'selected',
          standardIds: [],
          divisionMode: 'selected',
          divisionIds: [],
        }),
    },
    {
      label: 'Medium',
      value: getSingleSelectedId(normalizedValue.mediumMode, normalizedValue.academicMediumIds),
      emptyLabel: !boardSelected
        ? 'Select Board first'
        : available.mediums.length
          ? 'Select Medium'
          : 'No Media configured',
      errorMessage: 'Select one Medium.',
      options: available.mediums,
      disabled: !boardSelected || available.mediums.length === 0,
      onSelect: (selectedId: string) =>
        selectValue(selectedId, 'mediumMode', 'academicMediumIds', {
          stageMode: 'selected',
          academicMediumStageIds: [],
          classMode: 'selected',
          standardIds: [],
          divisionMode: 'selected',
          divisionIds: [],
        }),
    },
    {
      label: 'School Level',
      value: getSingleSelectedId(normalizedValue.stageMode, normalizedValue.academicMediumStageIds),
      emptyLabel: !mediumSelected
        ? 'Select Medium first'
        : available.stages.length
          ? 'Select School Level'
          : 'No School Levels configured',
      errorMessage: 'Select one School Level.',
      options: available.stages,
      disabled: !mediumSelected || available.stages.length === 0,
      onSelect: (selectedId: string) =>
        selectValue(selectedId, 'stageMode', 'academicMediumStageIds', {
          classMode: 'selected',
          standardIds: [],
          divisionMode: 'selected',
          divisionIds: [],
        }),
    },
    {
      label: 'Class',
      value: getSingleSelectedId(normalizedValue.classMode, normalizedValue.standardIds),
      emptyLabel: !stageSelected
        ? 'Select School Level first'
        : available.standards.length
          ? 'Select Class'
          : 'No Classes configured',
      errorMessage: 'Select one Class.',
      options: available.standards,
      disabled: !stageSelected || available.standards.length === 0,
      onSelect: (selectedId: string) =>
        selectValue(selectedId, 'classMode', 'standardIds', {
          divisionMode: 'selected',
          divisionIds: [],
        }),
    },
    {
      label: 'Division',
      value: getSingleSelectedId(normalizedValue.divisionMode, normalizedValue.divisionIds),
      emptyLabel: !classSelected
        ? 'Select Class first'
        : available.divisions.length
          ? 'Select Division'
          : 'No Divisions configured',
      errorMessage: 'Select one Division.',
      options: available.divisions,
      disabled: !classSelected || available.divisions.length === 0,
      onSelect: (selectedId: string) => selectValue(selectedId, 'divisionMode', 'divisionIds', {}),
    },
  ];

  return (
    <Stack spacing={1.5}>
      {fields.map((field) => (
        <TextField
          key={field.label}
          select
          fullWidth
          size="small"
          label={field.label}
          value={field.value}
          disabled={field.disabled}
          error={showErrors && !field.value}
          helperText={showErrors && !field.value ? field.errorMessage : undefined}
          onChange={(event) => field.onSelect(event.target.value)}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            {field.emptyLabel}
          </MenuItem>
          {field.options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ))}
    </Stack>
  );
}
