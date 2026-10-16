import type { StudentOnboardingFilterOptions } from 'src/redux/student/onboarding/student-onboarding-types';

import CustomSelect from 'src/components/custom-select';
import { Paper, Stack, Switch, FormControlLabel } from '@mui/material';
import {
  readAcademicFilterIds,
  academicMultipleFilterValue,
} from 'src/utils/student-academic-filter-query';

const ALL_STANDARDS = '__all__';

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
  const divisions = (options?.divisions ?? []).filter((item) =>
    !readAcademicFilterIds(selectedStandardId).length
      ? standards.some((standard) => standard.id === item.parentId)
      : readAcademicFilterIds(selectedStandardId).includes(String(item.parentId))
  );

  return (
    <Paper
      variant="outlined"
      data-testid="student-setup-academic-filters"
      sx={{ p: 1, flexShrink: 0, borderRadius: 2 }}
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
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
          multiple
          options={[{ id: ALL_STANDARDS, name: 'All classes' }, ...standards]}
          label="Class"
          value={
            readAcademicFilterIds(selectedStandardId).length
              ? readAcademicFilterIds(selectedStandardId)
              : [ALL_STANDARDS]
          }
          onChange={(value) =>
            onStandardChange(academicMultipleFilterValue(selectedStandardId, value))
          }
          labelKey="name"
          valueKey="id"
          isSearch
          disabled={disabled || (!allowAllScope && !selectedMediumId)}
        />
        <CustomSelect
          fullWidth
          multiple
          options={[
            { id: ALL_STANDARDS, name: 'All divisions' },
            ...divisions.map((division) => ({
              ...division,
              name: `${standards.find((standard) => standard.id === division.parentId)?.name} / ${division.name}`,
            })),
          ]}
          label="Division"
          value={
            readAcademicFilterIds(selectedDivisionId).length
              ? readAcademicFilterIds(selectedDivisionId)
              : [ALL_STANDARDS]
          }
          onChange={(value) =>
            onDivisionChange(academicMultipleFilterValue(selectedDivisionId, value))
          }
          labelKey="name"
          valueKey="id"
          disabled={disabled || (!allowAllScope && !selectedMediumId)}
        />
        {onTodayChange && (
          <FormControlLabel
            sx={{ m: 0, flexShrink: 0, alignSelf: { lg: 'center' } }}
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
      </Stack>
    </Paper>
  );
}
