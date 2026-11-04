import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import type { DirectoryAcademicScope } from './student-directory-scope';

const ALL = 'all';

type Props = {
  scope: DirectoryAcademicScope;
  options?: StudentDirectoryOptions;
  isLoading: boolean;
  disabled: boolean;
  onChange: (changes: Record<string, string | undefined>) => void;
};

export default function StudentDirectoryAcademicFilters({
  scope,
  options,
  isLoading,
  disabled,
  onChange,
}: Props) {
  const mediums = options?.mediums.filter((item) => item.parentId === scope.board) ?? [];
  const classes = options?.standards.filter((item) => item.parentId === scope.medium) ?? [];
  const divisions = (options?.divisions ?? []).filter(
    (item) => scope.classes.length === 1 && item.parentId === scope.classes[0]
  );
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1,
        flex: 1,
        minWidth: 0,
      }}
    >
      <CustomSelect
        label="Board"
        value={scope.board}
        options={options?.boards ?? []}
        labelKey="name"
        valueKey="id"
        isLoading={isLoading}
        disabled={disabled}
        onChange={(value) =>
          onChange({
            board: String(value),
            medium: undefined,
            class: undefined,
            division: undefined,
          })
        }
      />
      <CustomSelect
        label="Medium"
        value={scope.medium}
        options={mediums}
        labelKey="name"
        valueKey="id"
        isLoading={isLoading}
        disabled={disabled || !scope.board}
        onChange={(value) =>
          onChange({ medium: String(value), class: undefined, division: undefined })
        }
      />
      <CustomSelect
        label="Class"
        value={scope.classes.length === 1 ? scope.classes[0] : ALL}
        options={[{ id: ALL, name: 'All Classes' }, ...classes]}
        labelKey="name"
        valueKey="id"
        isLoading={isLoading}
        disabled={disabled || !scope.medium}
        onChange={(value) =>
          onChange({ class: value === ALL ? undefined : String(value), division: undefined })
        }
      />
      <CustomSelect
        label="Division"
        value={scope.divisions.length === 1 ? scope.divisions[0] : ALL}
        options={[{ id: ALL, name: 'All Divisions' }, ...divisions]}
        labelKey="name"
        valueKey="id"
        isLoading={isLoading}
        disabled={disabled || !scope.medium || scope.classes.length !== 1}
        onChange={(value) => onChange({ division: value === ALL ? undefined : String(value) })}
      />
    </Box>
  );
}
