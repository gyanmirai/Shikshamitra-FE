import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import type { DirectoryAcademicScope } from './student-directory-scope';

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
    (item) =>
      classes.some((standard) => standard.id === item.parentId) &&
      (!scope.classes.length || scope.classes.includes(item.parentId ?? ''))
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
      <ResponsiveMultiSelect
        label="Class"
        value={scope.classes}
        options={classes}
        getOptionValue={(item) => item.id}
        getOptionLabel={(item) => item.name}
        isLoading={isLoading}
        disabled={disabled || !scope.medium}
        onChange={(value) => onChange({ class: value.join(',') || undefined, division: undefined })}
      />
      <ResponsiveMultiSelect
        label="Division"
        value={scope.divisions}
        options={divisions}
        getOptionValue={(item) => item.id}
        getOptionLabel={(item) =>
          scope.classes.length === 1
            ? item.name
            : `${item.name} (${classes.find((standard) => standard.id === item.parentId)?.name ?? 'Class'})`
        }
        isLoading={isLoading}
        disabled={disabled || !scope.medium}
        onChange={(value) => onChange({ division: value.join(',') || undefined })}
      />
    </Box>
  );
}
