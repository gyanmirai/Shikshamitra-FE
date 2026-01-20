import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Stack,
  Button,
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
  id?: string;
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
  icon: string | React.ReactNode;
}

const operatorOptions: OperatorOption[] = [
  { value: 'equals', label: 'Equals', icon: 'solar:check-circle-bold-duotone' },
  { value: 'notEquals', label: 'Not Equals', icon: 'solar:forbidden-circle-bold-duotone' },
  { value: 'contains', label: 'Contains', icon: 'solar:magnifer-bold-duotone' },
  { value: 'startsWith', label: 'Starts With', icon: 'solar:forward-2-bold-duotone' },
  { value: 'endsWith', label: 'Ends With', icon: 'solar:back-2-bold-duotone' },
  { value: 'greaterThan', label: 'Greater Than', icon: 'solar:arrow-up-bold-duotone' },
  { value: 'lessThan', label: 'Less Than', icon: 'solar:arrow-down-bold-duotone' },
  {
    value: 'greaterOrEqual',
    label: 'Greater Or Equal',
    icon: 'solar:double-alt-arrow-up-bold-duotone',
  },
  {
    value: 'lessOrEqual',
    label: 'Less Or Equal',
    icon: 'solar:double-alt-arrow-down-bold-duotone',
  },
  { value: 'in', label: 'In', icon: 'solar:list-bold-duotone' },
];

const AdditionalFilters: React.FC<{ formik: any; basePath?: 'ruleBased' | 'nameBased' }> = ({
  formik,
  basePath = 'ruleBased',
}) => {
  const getFieldMeta = useCallback(
    (fieldValue: string | undefined, isStudent: boolean): FieldOption | undefined => {
      const source = isStudent ? studentFieldOptions : employeeFieldOptions;
      return source.find((f) => f.value === fieldValue);
    },
    []
  );

  const handleAddFilter = (isStudent: boolean) => {
    const newFilter: FilterRow = {
      field: '',
      operator: '',
      value: '',
    };

    const targetField = isStudent ? 'studentFilters' : 'employeeFilters';
    const currentPath = `${basePath}.${targetField}`;

    // Safety check for nesting
    const section = formik.values[basePath] || {};
    const currentValue = section[targetField] || [];

    formik.setFieldValue(currentPath, [...currentValue, newFilter]);
  };

  const handleRemoveFilter = useCallback(
    (index: number, isStudent: boolean) => {
      const targetSubField = isStudent ? 'studentFilters' : 'employeeFilters';
      const currentPath = `${basePath}.${targetSubField}`;

      // Navigate nested values correctly
      const currentObj = formik.values[basePath];
      const currentFilters = currentObj?.[targetSubField] || [];

      formik.setFieldValue(
        currentPath,
        currentFilters.filter((_: any, i: number) => i !== index)
      );
    },
    [formik, basePath]
  );

  const handleChange = useCallback(
    (index: number, key: 'field' | 'operator' | 'value', value: string, isStudent: boolean) => {
      const targetSubField = isStudent ? 'studentFilters' : 'employeeFilters';
      const currentPath = `${basePath}.${targetSubField}`;

      const section = formik.values[basePath] || {};
      const currentFilters = section[targetSubField] || [];

      const updatedFilters = currentFilters.map((f: any, i: number) =>
        i === index ? { ...f, [key]: value, ...(key === 'field' ? { value: '' } : {}) } : f
      );

      formik.setFieldValue(currentPath, updatedFilters);
    },
    [formik, basePath]
  );

  const renderFilterRows = useCallback(
    (filters: FilterRow[], isStudent: boolean) => (
      <Stack spacing={2} mt={2}>
        {filters.map((f, index) => {
          const meta = getFieldMeta(f.field, isStudent);
          return (
            <Grid
              container
              spacing={1.5}
              key={index}
              alignItems="flex-start"
              sx={{
                p: 1.5,
                borderRadius: 1.25,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.04)}`,
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ typography: 'caption', fontWeight: 700 }}>Field</InputLabel>
                  <Select
                    label="Field"
                    value={f.field || ''}
                    onChange={(e) => handleChange(index, 'field', e.target.value, isStudent)}
                    sx={{ typography: 'body2' }}
                  >
                    {(isStudent ? studentFieldOptions : employeeFieldOptions).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 3.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ typography: 'caption', fontWeight: 700 }}>Operator</InputLabel>
                  <Select
                    label="Operator"
                    value={f.operator || ''}
                    onChange={(e) => handleChange(index, 'operator', e.target.value, isStudent)}
                    renderValue={(selected) => {
                      const op = operatorOptions.find((o) => o.value === selected);
                      return op?.label || '';
                    }}
                    sx={{ typography: 'body2' }}
                  >
                    {operatorOptions.map((op) => (
                      <MenuItem
                        key={op.value}
                        value={op.value}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        {typeof op.icon === 'string' ? (
                          <Iconify
                            icon={op.icon}
                            sx={{ color: 'text.secondary', mr: 1, width: 20, height: 20 }}
                          />
                        ) : (
                          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{op.icon}</Box>
                        )}
                        <Typography variant="body2">{op.label}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 3.5 }}>
                {meta?.type === 'select' ? (
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ typography: 'caption', fontWeight: 700 }}>Value</InputLabel>
                    <Select
                      label="Value"
                      value={f.value || ''}
                      onChange={(e) => handleChange(index, 'value', e.target.value, isStudent)}
                      disabled={!f.field}
                      sx={{ typography: 'body2' }}
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
                    fullWidth
                    value={f.value || ''}
                    disabled={!f.field}
                    onChange={(e) => handleChange(index, 'value', e.target.value, isStudent)}
                    InputLabelProps={{ sx: { typography: 'caption', fontWeight: 700 } }}
                    sx={{ '& .MuiInputBase-input': { typography: 'body2' } }}
                  />
                )}
              </Grid>

              <Grid size={{ xs: 1 }} sx={{ mt: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter(index, isStudent)}
                  sx={{
                    color: 'text.disabled',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    ),
    [getFieldMeta, handleChange, handleRemoveFilter]
  );

  const studentFilterContent = useMemo(() => {
    const filters = formik.values[basePath]?.studentFilters || [];
    return filters.length === 0 ? (
      <Box
        sx={{
          py: 4,
          mt: 2,
          textAlign: 'center',
          borderRadius: 2,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        }}
      >
        <Iconify
          icon="solar:user-rounded-bold-duotone"
          width={32}
          sx={{ color: 'text.disabled', opacity: 0.3, mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          No student filters applied.
        </Typography>
      </Box>
    ) : (
      renderFilterRows(filters, true)
    );
  }, [formik.values, basePath, renderFilterRows]);
  // Dependency: formik.values[basePath]?.studentFilters

  const employeeFilterContent = useMemo(() => {
    const filters = formik.values[basePath]?.employeeFilters || [];
    return filters.length === 0 ? (
      <Box
        sx={{
          py: 4,
          mt: 2,
          textAlign: 'center',
          borderRadius: 2,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        }}
      >
        <Iconify
          icon="solar:users-group-rounded-bold-duotone"
          width={32}
          sx={{ color: 'text.disabled', opacity: 0.3, mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          No employee filters applied.
        </Typography>
      </Box>
    ) : (
      renderFilterRows(filters, false)
    );
  }, [formik.values, basePath, renderFilterRows]);
  // Dependency: formik.values[basePath]?.employeeFilters

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Iconify icon="solar:filter-bold-duotone" sx={{ color: 'primary.main' }} width={24} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Additional Selection Rules
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define refined rules to include specific students or employees based on their attributes.
        </Typography>
      </Grid>

      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          borderRight: (theme) => ({ md: `1px dashed ${theme.palette.divider}` }),
          pr: { md: 4 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Student Rules
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => handleAddFilter(true)}
            sx={{ borderRadius: 1 }}
          >
            Add Rule
          </Button>
        </Box>
        {studentFilterContent}
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} sx={{ pl: { md: 4 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'warning.main',
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Employee Rules
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => handleAddFilter(false)}
            sx={{ borderRadius: 1 }}
          >
            Add Rule
          </Button>
        </Box>
        {employeeFilterContent}
      </Grid>
    </Grid>
  );
};

export default AdditionalFilters;
