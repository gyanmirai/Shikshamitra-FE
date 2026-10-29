import type { HrReportField, HrReportFilterCondition } from 'src/redux/hr/hrReportsApi';
import type {
  ReportDesign,
  ReportParameters as Parameters,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { useRef, useState, useEffect } from 'react';
import { useGetReportingOptionsQuery } from 'src/redux/hr/hrReportingWorkspaceApi';
import {
  Box,
  Alert,
  Switch,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import { ReportConditionValue } from './ReportConditionValue';
import { isMonthlyRegister, isIssuedSalaryDocument } from '../reporting-workspace-utils';

type Props = {
  design: ReportDesign;
  value: Parameters;
  onChange: (value: Parameters) => void;
  disabled?: boolean;
  fields?: HrReportField[];
};
const periods = [
  ['thisMonth', 'This month'],
  ['lastMonth', 'Last month'],
  ['today', 'Today'],
  ['yesterday', 'Yesterday'],
  ['last7Days', 'Last 7 days'],
  ['month', 'Choose month'],
  ['date', 'Choose date'],
  ['custom', 'Custom dates'],
];

export function ReportParameters({ design, value, onChange, disabled = false, fields }: Props) {
  const salaryStatement = design.dataSource === 'payroll_statement';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const selectedOptions = useRef(new Map<string, { id: string; label: string }>());
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const { data: options, error: optionsError } = useGetReportingOptionsQuery({
    dataset: design.dataSource,
    search: debouncedSearch,
  });
  options?.staff.forEach((option) => selectedOptions.current.set(option.id, option));
  const update = (patch: Partial<Parameters>) => onChange({ ...value, ...patch });
  const enabled = (name: string) => design.parameters.includes(name);
  const filterParameters: { key: string; condition: HrReportFilterCondition }[] = [];
  design.filters.conditions.forEach((condition, index) => {
    if (condition.askWhenGenerating) filterParameters.push({ key: `filters.${index}`, condition });
  });
  design.filters.groups.forEach((group, g) =>
    group.conditions.forEach((condition, index) => {
      if (condition.askWhenGenerating)
        filterParameters.push({ key: `filters.g${g}.${index}`, condition });
    })
  );
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {optionsError && (
        <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>
          Parameter choices could not be loaded. Reload the page to try again.
        </Alert>
      )}
      {enabled('period') && (
        <TextField
          size="small"
          select
          label="Reporting period"
          name="period"
          value={value.period}
          disabled={disabled}
          onChange={(e) => update({ period: e.target.value })}
        >
          {periods
            .filter(
              ([id]) =>
                (!isMonthlyRegister(design) && !salaryStatement) ||
                ['thisMonth', 'lastMonth', 'month'].includes(id) ||
                (salaryStatement && id === 'custom')
            )
            .map(([id, label]) => (
              <MenuItem key={id} value={id}>
                {salaryStatement && id === 'custom' ? 'Custom months' : label}
              </MenuItem>
            ))}
          {enabled('academicYearId') && !isMonthlyRegister(design) && !salaryStatement && (
            <MenuItem value="academicYear">Academic year</MenuItem>
          )}
        </TextField>
      )}
      {enabled('period') && value.period === 'month' && (
        <TextField
          size="small"
          type="month"
          label="Month"
          value={value.month || ''}
          InputLabelProps={{ shrink: true }}
          disabled={disabled}
          onChange={(e) => update({ month: e.target.value })}
        />
      )}
      {enabled('period') && value.period === 'date' && (
        <TextField
          size="small"
          type="date"
          label="Reporting date"
          value={value.fromDate || ''}
          InputLabelProps={{ shrink: true }}
          disabled={disabled}
          onChange={(e) => update({ fromDate: e.target.value })}
        />
      )}
      {enabled('period') && value.period === 'custom' && (
        <>
          <TextField
            size="small"
            type={salaryStatement ? 'month' : 'date'}
            label={salaryStatement ? 'From month' : 'From date'}
            value={(salaryStatement ? value.fromDate?.slice(0, 7) : value.fromDate) || ''}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            onChange={(e) =>
              update({
                fromDate:
                  salaryStatement && e.target.value ? `${e.target.value}-01` : e.target.value,
              })
            }
          />
          <TextField
            size="small"
            type={salaryStatement ? 'month' : 'date'}
            label={salaryStatement ? 'To month' : 'To date'}
            value={(salaryStatement ? value.toDate?.slice(0, 7) : value.toDate) || ''}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
            error={!!value.fromDate && !!value.toDate && value.fromDate > value.toDate}
            helperText={
              value.fromDate && value.toDate && value.fromDate > value.toDate
                ? 'End date must follow start date.'
                : undefined
            }
            onChange={(e) =>
              update({
                toDate: salaryStatement && e.target.value ? `${e.target.value}-01` : e.target.value,
              })
            }
          />
        </>
      )}
      {enabled('departments') && (
        <Autocomplete
          multiple
          size="small"
          options={options?.departments.map((x) => x.id) || []}
          value={value.departments}
          disabled={disabled}
          onChange={(_, departments) => update({ departments })}
          renderInput={(params) => (
            <TextField {...params} label="Departments" placeholder="All authorized departments" />
          )}
        />
      )}
      {enabled('employeeIds') && (
        <Autocomplete
          multiple
          size="small"
          options={options?.staff || []}
          filterOptions={(x) => x}
          value={value.employeeIds.map(
            (id) => selectedOptions.current.get(id) || { id, label: 'Selected staff member' }
          )}
          disabled={disabled}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          getOptionLabel={(x) => x.label}
          onInputChange={(_, text) => setSearch(text)}
          onChange={(_, staff) => {
            staff.forEach((option) => selectedOptions.current.set(option.id, option));
            update({ employeeIds: staff.map((s) => s.id) });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Staff"
              placeholder={
                design.dataSource === 'payroll_statement'
                  ? 'Choose one staff member'
                  : 'All authorized staff'
              }
              error={!!optionsError}
              helperText={
                optionsError
                  ? 'Could not load staff choices. Reload the page to try again.'
                  : 'Search by staff name or code.'
              }
            />
          )}
        />
      )}
      {enabled('academicYearId') && (
        <TextField
          size="small"
          select
          label="Academic year"
          value={value.academicYearId || ''}
          disabled={disabled}
          onChange={(e) => update({ academicYearId: e.target.value || undefined })}
        >
          <MenuItem value="">
            {design.dataSource === 'leave_balances'
              ? 'Choose academic year'
              : 'All authorized years'}
          </MenuItem>
          {options?.academicYears.map((x) => (
            <MenuItem key={x.id} value={x.id}>
              {x.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {enabled('educationMediumStageId') && (
        <TextField
          size="small"
          select
          label="School section"
          value={value.educationMediumStageId || ''}
          disabled={disabled}
          onChange={(e) => update({ educationMediumStageId: e.target.value || undefined })}
        >
          <MenuItem value="">All authorized sections</MenuItem>
          {options?.sections.map((x) => (
            <MenuItem key={x.id} value={x.id}>
              {x.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {enabled('employeeGroup') && (
        <TextField
          size="small"
          select
          label="Staff group"
          value={value.employeeGroup ?? ''}
          disabled={disabled}
          onChange={(e) =>
            update({ employeeGroup: e.target.value === '' ? undefined : Number(e.target.value) })
          }
        >
          <MenuItem value="">All groups</MenuItem>
          {options?.staffGroups.map((x) => (
            <MenuItem key={x.id} value={x.id}>
              {x.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {enabled('cycleId') && (
        <TextField
          size="small"
          select
          label="Review cycle"
          value={value.cycleId || ''}
          disabled={disabled}
          onChange={(e) => update({ cycleId: e.target.value || undefined })}
        >
          <MenuItem value="">All authorized cycles</MenuItem>
          {options?.cycles.map((x) => (
            <MenuItem key={x.id} value={x.id}>
              {x.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      {isIssuedSalaryDocument(design) && (
        <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
          Only issued payslips from locked payroll are included.
        </Typography>
      )}
      {enabled('includeDrafts') && !isIssuedSalaryDocument(design) && (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={value.includeDrafts}
              disabled={disabled}
              onChange={(_, checked) => update({ includeDrafts: checked })}
            />
          }
          label="Include draft payroll"
        />
      )}
      {filterParameters.map(({ key, condition }) => (
        <ReportConditionValue
          key={key}
          field={fields?.find((field) => field.id === condition.field)}
          condition={{ ...condition, ...value.filterValues?.[key] }}
          label={
            fields?.find((field) => field.id === condition.field)?.label ||
            condition.field.replace(/([A-Z])/g, ' $1')
          }
          disabled={disabled}
          onChange={(next) =>
            update({
              filterValues: {
                ...value.filterValues,
                [key]: { value: next.value, values: next.values },
              },
            })
          }
        />
      ))}
    </Box>
  );
}
