import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { Box, Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

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
  onChange: (changes: Partial<DirectoryFilters>) => void;
};

const scopeValue = (value: string | number) => (value === 'all' ? '' : String(value));

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 1.5,
};

export default function StudentDirectoryFilterFields({
  values,
  options,
  isLoading,
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

  return (
    <Stack spacing={2}>
      <Typography variant="overline" color="text.secondary">
        Academic scope
      </Typography>
      <Box sx={gridSx}>
        <CustomSelect
          label="Board"
          value={values.board || 'all'}
          isLoading={isLoading}
          options={[{ id: 'all', name: 'All boards' }, ...(options?.boards ?? [])]}
          labelKey="name"
          valueKey="id"
          onChange={(value) => onChange({ ...resetScope, board: scopeValue(String(value)) })}
        />
        <CustomSelect
          label="Medium"
          value={values.medium || 'all'}
          isLoading={isLoading}
          options={[{ id: 'all', name: 'All mediums' }, ...mediums]}
          labelKey="name"
          valueKey="id"
          onChange={(value) =>
            onChange({ medium: scopeValue(String(value)), class: '', division: '' })
          }
        />
        <CustomSelect
          label="Class"
          value={values.class || 'all'}
          isLoading={isLoading}
          options={[{ id: 'all', name: 'All classes' }, ...classes]}
          labelKey="name"
          valueKey="id"
          onChange={(value) => onChange({ class: scopeValue(String(value)), division: '' })}
        />
        <CustomSelect
          label="Division"
          value={values.division || 'all'}
          isLoading={isLoading}
          options={[{ id: 'all', name: 'All divisions' }, ...divisions]}
          labelKey="name"
          valueKey="id"
          onChange={(value) => onChange({ division: scopeValue(String(value)) })}
        />
      </Box>
    </Stack>
  );
}
