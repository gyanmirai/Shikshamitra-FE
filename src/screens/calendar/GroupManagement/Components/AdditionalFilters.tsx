/* eslint-disable import/order */
// eslint-disable-next-line import/order
import AddIcon from '@mui/icons-material/Add';
// eslint-disable-next-line import/order
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
/* eslint-disable sort-imports */
import React, { useMemo, useState, useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
// eslint-disable-next-line import/order
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwipeRightAltIcon from '@mui/icons-material/SwipeRightAlt';
// eslint-disable-next-line import/order
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
} from '@mui/material';

export interface FieldOption {
  value: string;
  label: string;
  type: 'text' | 'select';
  values?: string[]; // for select type
}

export interface FilterRow {
  id: string;
  field?: string;
  operator?: string;
  value?: string;
}

const studentFieldOptions: FieldOption[] = [
  { value: 'class', label: 'Class', type: 'select', values: ['1', '2', '3', '4', '5'] },
  { value: 'section', label: 'Section', type: 'select', values: ['A', 'B', 'C'] },
  { value: 'gender', label: 'Gender', type: 'select', values: ['Male', 'Female', 'Other'] },
  {
    value: 'admissionStatus',
    label: 'Admission Status',
    type: 'select',
    values: ['Active', 'Inactive', 'Pending'],
  },
  { value: 'name', label: 'Name', type: 'text' },
];

const employeeFieldOptions: FieldOption[] = [
  {
    value: 'department',
    label: 'Department',
    type: 'select',
    values: ['Admin', 'Teaching', 'Finance', 'HR'],
  },
  {
    value: 'role',
    label: 'Role',
    type: 'select',
    values: ['Teacher', 'Principal', 'Accountant', 'Clerk'],
  },
  {
    value: 'employmentType',
    label: 'Employment Type',
    type: 'select',
    values: ['Full-time', 'Part-time', 'Contract'],
  },
  { value: 'name', label: 'Name', type: 'text' },
];

export interface OperatorOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const operatorOptions: OperatorOption[] = [
  { value: 'equals', label: 'Equals', icon: <CheckCircleOutlineIcon fontSize="inherit" /> },
  { value: 'notEquals', label: 'Not Equals', icon: <DoNotDisturbAltIcon fontSize="inherit" /> },
  { value: 'contains', label: 'Contains', icon: <SearchIcon fontSize="inherit" /> },
  { value: 'startsWith', label: 'Starts With', icon: <SwipeRightAltIcon fontSize="inherit" /> },
  { value: 'endsWith', label: 'Ends With', icon: <KeyboardTabIcon fontSize="inherit" /> },
  { value: 'greaterThan', label: 'Greater Than', icon: <ArrowUpwardIcon fontSize="inherit" /> },
  { value: 'lessThan', label: 'Less Than', icon: <ArrowDownwardIcon fontSize="inherit" /> },
  {
    value: 'greaterOrEqual',
    label: 'Greater Or Equal',
    icon: <TrendingUpIcon fontSize="inherit" />,
  },
  { value: 'lessOrEqual', label: 'Less Or Equal', icon: <TrendingDownIcon fontSize="inherit" /> },
  { value: 'in', label: 'In', icon: <FormatListBulletedIcon fontSize="inherit" /> },
];

const createEmptyFilter = (): FilterRow => ({ id: crypto.randomUUID() });

const AdditionalFilters: React.FC = () => {
  const [studentFilters, setStudentFilters] = useState<FilterRow[]>([]);

  const [employeeFilters, setEmployeeFilters] = useState<FilterRow[]>([]);

  const getFieldMeta = useCallback(
    (fieldValue: string | undefined, isStudent: boolean): FieldOption | undefined => {
      const source = isStudent ? studentFieldOptions : employeeFieldOptions;
      return source.find((f) => f.value === fieldValue);
    },
    []
  );

  const handleAddFilter = (isStudent: boolean) => {
    if (isStudent) setStudentFilters((prev) => [...prev, createEmptyFilter()]);
    else setEmployeeFilters((prev) => [...prev, createEmptyFilter()]);
  };

  const handleRemoveFilter = (id: string, isStudent: boolean) => {
    if (isStudent) setStudentFilters((prev) => prev.filter((f) => f.id !== id));
    else setEmployeeFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleChange = (id: string, key: keyof FilterRow, value: string, isStudent: boolean) => {
    const updater = (list: FilterRow[]) =>
      list.map((f) =>
        f.id === id ? { ...f, [key]: value, ...(key === 'field' ? { value: undefined } : {}) } : f
      );
    if (isStudent) setStudentFilters((prev) => updater(prev));
    else setEmployeeFilters((prev) => updater(prev));
  };

  const renderFilterRows = useCallback(
    (filters: FilterRow[], isStudent: boolean) => (
      <Stack spacing={1} mt={1}>
        {filters.map((f) => {
          const meta = getFieldMeta(f.field, isStudent);
          return (
            <Grid container spacing={1} key={f.id} alignItems="center">
              <Grid size={{ xs: 4 }}>
                <FormControl
                  fullWidth
                  size="small"
                  variant="standard"
                  sx={{
                    '& .MuiInputBase-input': { fontSize: 14 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiMenuItem-root': { fontSize: 14 },
                  }}
                >
                  <InputLabel>Field</InputLabel>
                  <Select
                    size="small"
                    label="Field"
                    value={f.field || ''}
                    onChange={(e) => handleChange(f.id, 'field', e.target.value, isStudent)}
                  >
                    {(isStudent ? studentFieldOptions : employeeFieldOptions).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl
                  fullWidth
                  size="small"
                  variant="standard"
                  sx={{
                    '& .MuiInputBase-input': { fontSize: 14 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiMenuItem-root': { fontSize: 14 },
                  }}
                >
                  <InputLabel>Operator</InputLabel>
                  <Select
                    label="Operator"
                    value={f.operator || ''}
                    onChange={(e) => handleChange(f.id, 'operator', e.target.value, isStudent)}
                  >
                    {operatorOptions.map((op) => (
                      <MenuItem
                        key={op.value}
                        value={op.value}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        {/* <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                          {op.icon}
                        </Box> */}
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                {meta?.type === 'select' ? (
                  <FormControl
                    fullWidth
                    size="small"
                    variant="standard"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 14 },
                      '& .MuiMenuItem-root': { fontSize: 14 },
                    }}
                  >
                    <InputLabel>Value</InputLabel>
                    <Select
                      label="Value"
                      value={f.value || ''}
                      onChange={(e) => handleChange(f.id, 'value', e.target.value, isStudent)}
                      disabled={!f.field}
                      variant="standard"
                    >
                      {meta.values?.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Value"
                    size="small"
                    variant="standard"
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 14 },
                    }}
                    fullWidth
                    value={f.value || ''}
                    disabled={!f.field}
                    onChange={(e) => handleChange(f.id, 'value', e.target.value, isStudent)}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 1 }} display="flex" justifyContent="center">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFilter(f.id, isStudent)}
                  aria-label="delete-filter"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    ),
    [getFieldMeta]
  );

  const studentFilterContent = useMemo(
    () =>
      studentFilters.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mt={1}>
          No filters applied
        </Typography>
      ) : (
        renderFilterRows(studentFilters, true)
      ),
    [studentFilters, renderFilterRows]
  );

  const employeeFilterContent = useMemo(
    () =>
      employeeFilters.length === 0 ? (
        <Typography variant="body2" color="text.secondary" mt={1}>
          No filters applied
        </Typography>
      ) : (
        renderFilterRows(employeeFilters, false)
      ),
    [employeeFilters, renderFilterRows]
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" color="primary">
          Additional Selections
        </Typography>
      </Grid>

      <Grid size={{ xs: 6 }} sx={{ borderRight: '2px solid', borderColor: 'primary.main', pr: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">Students Selections</Typography>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleAddFilter(true)}
            aria-label="add-student-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {studentFilterContent}
      </Grid>
      <Grid size={{ xs: 6 }} pl={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">Employee Selections</Typography>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleAddFilter(false)}
            aria-label="add-employee-filter"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {employeeFilterContent}
      </Grid>
    </Grid>
  );
};

export default AdditionalFilters;
