import type { StudentOnboardingFilterOptions } from 'src/redux/student/onboarding/student-onboarding-types';

import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Switch, FormControlLabel } from '@mui/material';
import { readAcademicFilterIds } from 'src/utils/student-academic-filter-query';

import { studentAcademicFilterRowSx } from '../../student-academic-filter-layout';

const ALL_OPTION = '__all__';

export function StudentSetupFilters({
  options,
  allowAllScope = false,
  isLoading = false,
  disabled = false,
  selectedBoardId,
  selectedMediumId,
  selectedStandardId,
  selectedDivisionId,
  onBoardChange,
  onMediumChange,
  onStandardChange,
  onDivisionChange,
  todayOnly,
  onTodayChange,
}: {
  options?: StudentOnboardingFilterOptions;
  allowAllScope?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  selectedBoardId: string;
  selectedMediumId: string;
  selectedStandardId: string;
  selectedDivisionId: string;
  onBoardChange: (value: string) => void;
  onMediumChange: (value: string) => void;
  onStandardChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
  todayOnly?: boolean;
  onTodayChange?: (value: boolean) => void;
}) {
  const mediums = (options?.mediums ?? []).filter(
    (item) => !selectedBoardId || item.parentId === selectedBoardId
  );
  const standards = (options?.standards ?? []).filter((item) =>
    selectedMediumId
      ? item.parentId === selectedMediumId
      : mediums.some((medium) => medium.id === item.parentId)
  );
  const classIds = readAcademicFilterIds(selectedStandardId);
  const selectedClass =
    classIds.length === 1 ? standards.find((standard) => standard.id === classIds[0]) : undefined;
  const divisions = selectedClass
    ? (options?.divisions ?? []).filter((division) => division.parentId === selectedClass.id)
    : [];
  const divisionIds = selectedClass
    ? readAcademicFilterIds(selectedDivisionId).filter((id) =>
        divisions.some((division) => division.id === id)
      )
    : [];
  const classValue = classIds.join(',') || ALL_OPTION;
  const divisionValue = divisionIds.join(',') || ALL_OPTION;
  // Older worklist links can still carry multiple IDs. Keep their scope until staff replaces it.
  const classOptions = [
    { id: ALL_OPTION, name: 'All Classes' },
    ...(classIds.length > 1 ? [{ id: classValue, name: 'Multiple Classes' }] : []),
    ...standards,
  ];
  const divisionOptions = [
    { id: ALL_OPTION, name: 'All Divisions' },
    ...(divisionIds.length > 1 ? [{ id: divisionValue, name: 'Multiple Divisions' }] : []),
    ...divisions,
  ];

  return (
    <Paper
      variant="outlined"
      data-testid="student-setup-academic-filters"
      sx={{ p: 1, flexShrink: 0, borderRadius: 2 }}
    >
      <Box sx={studentAcademicFilterRowSx}>
        <CustomSelect
          fullWidth
          options={
            allowAllScope
              ? [{ id: '', name: 'All boards' }, ...(options?.boards ?? [])]
              : (options?.boards ?? [])
          }
          label="Board"
          value={selectedBoardId}
          isLoading={isLoading}
          disabled={disabled}
          onChange={(value) => onBoardChange(String(value))}
          labelKey="name"
          valueKey="id"
        />
        <CustomSelect
          fullWidth
          options={allowAllScope ? [{ id: '', name: 'All mediums' }, ...mediums] : mediums}
          label="Medium"
          value={selectedMediumId}
          onChange={(value) => onMediumChange(String(value))}
          labelKey="name"
          valueKey="id"
          isLoading={isLoading}
          disabled={disabled || (!allowAllScope && !selectedBoardId)}
        />
        <CustomSelect
          fullWidth
          options={classOptions}
          label="Class"
          value={classValue}
          onChange={(value) => onStandardChange(value === ALL_OPTION ? '' : String(value))}
          labelKey="name"
          valueKey="id"
          isLoading={isLoading}
          disabled={disabled || (!allowAllScope && !selectedMediumId)}
        />
        <CustomSelect
          fullWidth
          options={divisionOptions}
          label="Division"
          value={divisionValue}
          onChange={(value) => onDivisionChange(value === ALL_OPTION ? '' : String(value))}
          labelKey="name"
          valueKey="id"
          isLoading={isLoading}
          disabled={disabled || !selectedClass}
        />
        {onTodayChange && (
          <FormControlLabel
            sx={{ m: 0, flexShrink: 0, alignSelf: { sm: 'center' } }}
            control={
              <Switch
                size="small"
                checked={Boolean(todayOnly)}
                disabled={disabled || isLoading}
                onChange={(_event, checked) => onTodayChange(checked)}
              />
            }
            label="Added today"
          />
        )}
      </Box>
    </Paper>
  );
}
