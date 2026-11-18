import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, IconButton, InputAdornment } from '@mui/material';

import { studentAcademicFilterRowSx } from '../student-academic-filter-layout';

export type DirectoryFilters = {
  board: string;
  medium: string;
  class: string;
  division: string;
};

type Props = {
  values: DirectoryFilters;
  options?: StudentDirectoryOptions;
  isLoading: boolean;
  disabled?: boolean;
  allowAllScope?: boolean;
  requireClassForDivision?: boolean;
  divisionHelpInTooltip?: boolean;
  onChange: (changes: Partial<DirectoryFilters>) => void;
};

const scopeValue = (value: string | number) => (value === 'all' ? '' : String(value));

export default function StudentDirectoryFilterFields({
  values,
  options,
  isLoading,
  disabled = false,
  allowAllScope = true,
  requireClassForDivision = false,
  divisionHelpInTooltip = false,
  onChange,
}: Props) {
  const mediums = (options?.mediums ?? []).filter(
    (medium) => !values.board || medium.parentId === values.board
  );
  const classes = (options?.standards ?? [])
    .filter((standard) => !values.medium || standard.parentId === values.medium)
    .filter(
      (standard) => !values.board || mediums.some((medium) => medium.id === standard.parentId)
    );
  const divisions = (options?.divisions ?? [])
    .filter((division) => !values.class || division.parentId === values.class)
    .filter(
      (division) =>
        (!values.medium && !values.board) ||
        classes.some((standard) => standard.id === division.parentId)
    );
  const resetScope = { board: '', medium: '', class: '', division: '' };
  const hasBoard = Boolean(
    values.board && options?.boards.some((item) => item.id === values.board)
  );
  const hasMedium =
    hasBoard && Boolean(values.medium && mediums.some((item) => item.id === values.medium));
  const hasClass =
    hasMedium && Boolean(values.class && classes.some((item) => item.id === values.class));
  const choices = (name: string, items: { id: string; name: string }[]) =>
    allowAllScope ? [{ id: 'all', name }, ...items] : items;
  const selected = (value: string) => value || (allowAllScope ? 'all' : '');

  return (
    <Box sx={{ ...studentAcademicFilterRowSx, flex: 1 }}>
      <CustomSelect
        label="Board"
        value={selected(values.board)}
        multiple={false}
        isLoading={isLoading}
        disabled={disabled}
        options={choices('All boards', options?.boards ?? [])}
        labelKey="name"
        valueKey="id"
        onChange={(value) => onChange({ ...resetScope, board: scopeValue(String(value)) })}
      />
      <CustomSelect
        label="Medium"
        value={selected(values.medium)}
        multiple={false}
        isLoading={isLoading}
        disabled={disabled || (!allowAllScope && !hasBoard)}
        options={choices('All mediums', allowAllScope || hasBoard ? mediums : [])}
        labelKey="name"
        valueKey="id"
        onChange={(value) =>
          onChange({ medium: scopeValue(String(value)), class: '', division: '' })
        }
      />
      <CustomSelect
        label="Class"
        value={selected(values.class)}
        multiple={false}
        isLoading={isLoading}
        disabled={disabled || (!allowAllScope && !hasMedium)}
        options={choices('All classes', allowAllScope || hasMedium ? classes : [])}
        labelKey="name"
        valueKey="id"
        onChange={(value) => onChange({ class: scopeValue(String(value)), division: '' })}
      />
      <CustomSelect
        label="Division"
        value={selected(values.division)}
        multiple={false}
        isLoading={isLoading}
        disabled={
          disabled || (requireClassForDivision && !values.class) || (!allowAllScope && !hasClass)
        }
        helperText={
          requireClassForDivision && !values.class && !divisionHelpInTooltip
            ? 'Select a class first'
            : undefined
        }
        endAdornment={
          divisionHelpInTooltip ? (
            <InputAdornment position="end" sx={{ mr: 2.5 }}>
              <CustomTooltip
                title={
                  values.class
                    ? 'Filter students by division within the selected class.'
                    : 'Select a class first to choose a division.'
                }
                arrow
              >
                <IconButton
                  size="small"
                  aria-label="About Division filter"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Iconify icon="mdi:information-outline" width={16} sx={{ color: 'info.main' }} />
                </IconButton>
              </CustomTooltip>
            </InputAdornment>
          ) : undefined
        }
        options={choices('All divisions', allowAllScope || hasClass ? divisions : [])}
        labelKey="name"
        valueKey="id"
        onChange={(value) => onChange({ division: scopeValue(String(value)) })}
      />
    </Box>
  );
}
