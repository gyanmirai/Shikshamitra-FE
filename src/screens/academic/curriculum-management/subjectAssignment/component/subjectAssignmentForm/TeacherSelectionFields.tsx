import React from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Chip, Grid, Avatar, Checkbox } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import type { TeacherOption } from './teacherOptions';

interface TeacherSelectionFieldsProps {
  teacherObjs: TeacherOption[];
  fetchTeacherOptions: (
    query: string,
    page?: number
  ) => Promise<{ data: TeacherOption[]; hasMore: boolean }>;
  onChange: (newValues: TeacherOption[]) => void;
  getError: (field: string) => string | undefined;
}

const TeacherSelectionFields = ({
  teacherObjs,
  fetchTeacherOptions,
  onChange,
  getError,
}: TeacherSelectionFieldsProps) => (
  <Grid size={{ xs: 12, md: 8 }}>
    <PaginatedSearchSelect
      label="Teachers"
      multiple
      disableCloseOnSelect
      fetchOptions={fetchTeacherOptions}
      value={teacherObjs}
      onChange={(_: unknown, newValues: TeacherOption[]) => onChange(newValues)}
      getOptionLabel={(option: TeacherOption) => option?.label || ''}
      isOptionEqualToValue={(option: TeacherOption, value: TeacherOption) =>
        option?.id === value?.id
      }
      renderOption={(props: any, option: TeacherOption, { selected }: { selected: boolean }) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
              checked={selected}
              sx={{ mr: 1 }}
            />
            <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>
              {option.name.charAt(0)}
            </Avatar>
            {option.label}
          </li>
        );
      }}
      renderTags={(values: TeacherOption[], getTagProps: (params: { index: number }) => any) =>
        values.map((teacher, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              key={key ?? teacher.id}
              avatar={<Avatar>{teacher.name.charAt(0)}</Avatar>}
              label={teacher.label}
              size="small"
              variant="soft"
            />
          );
        })
      }
      debounceMs={700}
      minChars={0}
      size="small"
      fullWidth
      placeholder={teacherObjs.length ? '' : 'Select teachers'}
      noOptionsText="No matching teachers are assigned to this class in Academic Permission. Review Staff Directory or choose another class."
      error={!!getError('teacherIds')}
      helperText={
        getError('teacherIds') ||
        'Only teachers assigned to this class in Academic Permission are listed.'
      }
    />
  </Grid>
);

/**
 * Memoization Justification:
 * The async multi-select is independent of the adjacent subject content fields.
 * React.memo prevents editor and attachment changes from re-rendering its option list and chips.
 */
export default React.memo(TeacherSelectionFields);
