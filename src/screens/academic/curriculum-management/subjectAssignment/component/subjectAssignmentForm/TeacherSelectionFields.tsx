import React from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Avatar, Checkbox } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import type { TeacherProfile } from '../type';

interface EmployeeOption {
  id: string;
  label: string;
}

interface TeacherSelectionFieldsProps {
  index: number;
  primaryTeacherObj: EmployeeOption | null;
  secondaryTeacherObjs: EmployeeOption[];
  secondaryTeacherIds: string[];
  primaryTeacherId: string;
  fetchPrimaryTeacherOptions: (
    query: string
  ) => Promise<{ data: EmployeeOption[]; hasMore: boolean }>;
  fetchSecondaryTeacherOptions: (
    query: string
  ) => Promise<{ data: EmployeeOption[]; hasMore: boolean }>;
  onPrimaryChange: (newValue: EmployeeOption | null) => void;
  onSecondaryChange: (newValues: EmployeeOption[]) => void;
  getError: (field: string) => string | undefined;
}

const TeacherSelectionFields = ({
  primaryTeacherObj,
  secondaryTeacherObjs,
  secondaryTeacherIds,
  primaryTeacherId,
  fetchPrimaryTeacherOptions,
  fetchSecondaryTeacherOptions,
  onPrimaryChange,
  onSecondaryChange,
  getError,
}: TeacherSelectionFieldsProps) => (
  <>
    <PaginatedSearchSelect
      label="Primary Teacher"
      fetchOptions={fetchPrimaryTeacherOptions}
      value={primaryTeacherObj}
      onChange={(_: unknown, newValue: EmployeeOption | null) => onPrimaryChange(newValue)}
      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
      isOptionEqualToValue={(option: EmployeeOption, value: EmployeeOption) =>
        option.id === value.id
      }
      filterOptions={(options: EmployeeOption[]) =>
        options.filter((o) => !secondaryTeacherIds?.includes(o.id))
      }
      renderOption={(props: any, option: EmployeeOption) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            {...rest}
            key={`${option.label}-${key}`}
            sx={{ display: 'flex', gap: 1 }}
          >
            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{option.label?.[0]}</Avatar>
            {option.label}
          </Box>
        );
      }}
      debounceMs={400}
      minChars={0}
      size="small"
      fullWidth
      error={!!getError('primaryTeacher')}
      helperText={getError('primaryTeacher')}
    />

    <PaginatedSearchSelect
      label="Secondary Teachers"
      multiple
      disableCloseOnSelect
      fetchOptions={fetchSecondaryTeacherOptions}
      value={secondaryTeacherObjs}
      onChange={(_: unknown, newValues: EmployeeOption[]) => onSecondaryChange(newValues)}
      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
      isOptionEqualToValue={(option: EmployeeOption, value: EmployeeOption) =>
        option.id === value.id
      }
      filterOptions={(options: EmployeeOption[]) =>
        options.filter((o) => o.id !== primaryTeacherId)
      }
      renderOption={(props: any, option: EmployeeOption, { selected }: { selected: boolean }) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
              checked={selected}
              sx={{ mr: 1 }}
            />
            <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>{option.label?.[0]}</Avatar>
            {option.label}
          </li>
        );
      }}
      renderTags={(values: EmployeeOption[]) => {
        if (!values || values.length === 0) return null;
        const first = values[0];
        const remaining = values.length - 1;
        return [
          <Chip
            key={first?.id}
            avatar={<Avatar>{first?.label?.[0]}</Avatar>}
            label={first?.label}
            size="small"
            variant="soft"
            sx={{ ml: 1 }}
          />,
          remaining > 0 && (
            <TeacherListPopover
              key="popover"
              teachers={values.slice(1).map((v) => ({ id: v.id, fullName: v.label }))}
              count={remaining}
            />
          ),
        ];
      }}
      debounceMs={400}
      minChars={0}
      size="small"
      fullWidth
      placeholder={secondaryTeacherIds?.length ? '' : 'Select assist teachers'}
      error={!!getError('secondaryTeacher')}
      helperText={
        Array.isArray(getError('secondaryTeacher'))
          ? getError('secondaryTeacher')
          : getError('secondaryTeacher')
      }
    />
  </>
);

/**
 * Memoization Justification:
 * Contains two PaginatedSearchSelect components with async data fetching.
 * React.memo prevents re-renders from sibling field changes (subject code,
 * editors) that don't affect teacher selection props.
 */
export default React.memo(TeacherSelectionFields);

export const TeacherListPopover = ({
  teachers,
  count,
}: {
  teachers: TeacherProfile[];
  count: number;
}) => (
  <CustomTooltip
    sx={{ textAlign: 'justify' }}
    title={
      <Box sx={{ p: 1, maxWidth: 180, borderRadius: 1 }}>
        {teachers.map((teacher) => (
          <Chip
            key={teacher.fullName}
            variant="soft"
            avatar={<Avatar sx={{ width: 24, height: 24 }}>{teacher?.fullName?.charAt(0)}</Avatar>}
            label={teacher.fullName}
            sx={{ ml: 0.5, height: 24, fontSize: 12, mb: 1 }}
            size="small"
          />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip
      label={`+${count}`}
      sx={{ ml: 0.5, height: 24, fontSize: 12, cursor: 'pointer' }}
      size="small"
      variant="soft"
    />
  </CustomTooltip>
);
