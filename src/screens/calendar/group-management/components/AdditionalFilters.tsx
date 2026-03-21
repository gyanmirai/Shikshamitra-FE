import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
// Removed specific enums as we are using dynamic fields
import {
  useGetStudentRuleFieldsQuery,
  useGetEmployeeRuleFieldsQuery,
} from 'src/redux/calendar/group-management/groupManagementApi';
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

// --- Interface Definitions based on API Response ---
interface ApiEnumValueOption {
  value: string;
  label: string;
  intValue: number;
}

interface ApiOperator {
  name: string;
  value: number;
}

interface ApiFilterField {
  field: string;
  fieldValue: number;
  name: string;
  type: 'Enum' | 'String' | 'Number' | 'Date' | 'Boolean';
  operators: ApiOperator[];
  options: ApiEnumValueOption[] | null;
}

// Extended FieldOption to include API data
export interface FieldOption {
  value: number;
  label: string;
  type: 'text' | 'select';
  apiData?: ApiFilterField;
}

export interface FilterRow {
  id?: string;
  field?: number;
  operator?: number;
  value?: string;
}

export interface OperatorOption {
  value: number;
  label: string;
  icon: string | React.ReactNode;
}

const operatorIcons: Record<string, string> = {
  Equals: 'solar:check-circle-bold-duotone',
  NotEquals: 'solar:forbidden-circle-bold-duotone',
  Contains: 'solar:magnifer-bold-duotone',
  StartsWith: 'solar:forward-2-bold-duotone',
  EndsWith: 'solar:back-2-bold-duotone',
  GreaterThan: 'solar:arrow-up-bold-duotone',
  LessThan: 'solar:arrow-down-bold-duotone',
  GreaterOrEqual: 'solar:double-alt-arrow-up-bold-duotone',
  LessOrEqual: 'solar:double-alt-arrow-down-bold-duotone',
  In: 'solar:list-bold-duotone',
};

const AdditionalFilters: React.FC<{ formik: any; basePath?: 'ruleBased' | 'nameBased' }> = ({
  formik,
  basePath = 'ruleBased',
}) => {
  const { data: studentFieldsData, isLoading: isStudentFieldsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentRuleFieldsQuery,
  });

  const { data: employeeFieldsData, isLoading: isEmployeeFieldsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeRuleFieldsQuery,
  });

  // Transform API data into FieldOptions
  const studentFieldOptions: FieldOption[] = useMemo(() => {
    if (!studentFieldsData) return [];
    return (studentFieldsData as ApiFilterField[]).map((field) => ({
      value: field.fieldValue,
      label: field.name,
      type: field.type === 'Enum' ? 'select' : 'text',
      apiData: field,
    }));
  }, [studentFieldsData]);

  const employeeFieldOptions: FieldOption[] = useMemo(() => {
    if (!employeeFieldsData) return [];
    return (employeeFieldsData as ApiFilterField[]).map((field) => ({
      value: field.fieldValue,
      label: field.name,
      type: field.type === 'Enum' ? 'select' : 'text',
      apiData: field,
    }));
  }, [employeeFieldsData]);

  const getFieldMeta = useCallback(
    (fieldValue: number | undefined, isStudent: boolean): FieldOption | undefined => {
      const source = isStudent ? studentFieldOptions : employeeFieldOptions;
      return source.find((f) => f.value === fieldValue);
    },
    [studentFieldOptions, employeeFieldOptions]
  );

  const handleAddFilter = (isStudent: boolean) => {
    const newFilter: FilterRow = {
      field: undefined,
      operator: undefined,
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
    (index: number, key: 'field' | 'operator' | 'value', value: any, isStudent: boolean) => {
      const targetSubField = isStudent ? 'studentFilters' : 'employeeFilters';
      const currentPath = `${basePath}.${targetSubField}`;

      const section = formik.values[basePath] || {};
      const currentFilters = section[targetSubField] || [];

      const updatedFilters = currentFilters.map((f: any, i: number) => {
        if (i !== index) return f;

        // If it's a field change, reset operator and value
        if (key === 'field') {
          return { ...f, field: value, operator: undefined, value: '' };
        }

        return { ...f, [key]: value };
      });

      formik.setFieldValue(currentPath, updatedFilters);
    },
    [formik, basePath]
  );

  const getOperatorOptionsForField = useCallback(
    (fieldMeta: FieldOption | undefined): OperatorOption[] => {
      if (!fieldMeta?.apiData?.operators) return [];

      return fieldMeta.apiData.operators.map((op) => ({
        value: op.value,
        label: op.name.replace(/([A-Z])/g, ' $1').trim(), // Add spaces before capital letters
        icon: operatorIcons[op.name] || 'solar:question-circle-bold-duotone',
      }));
    },
    []
  );

  const renderFilterRows = useCallback(
    (filters: FilterRow[], isStudent: boolean) => (
      <Stack spacing={2} mt={2}>
        {filters.map((f, index) => {
          const meta = getFieldMeta(f.field, isStudent);
          const allowedOperators = getOperatorOptionsForField(meta);

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
                    value={f.field ?? ''}
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
                    value={f.operator ?? ''}
                    onChange={(e) => handleChange(index, 'operator', e.target.value, isStudent)}
                    disabled={f.field === undefined}
                    renderValue={(selected) => {
                      // Find label from allowed operators
                      const op = allowedOperators.find((o) => o.value === selected);
                      if (op) return op.label;
                      return '';
                    }}
                    sx={{ typography: 'body2' }}
                  >
                    {allowedOperators.map((op) => (
                      <MenuItem
                        key={op.value}
                        value={op.value}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <Iconify
                          icon={typeof op.icon === 'string' ? op.icon : ''}
                          sx={{ color: 'text.secondary', mr: 1, width: 20, height: 20 }}
                        />
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
                      value={f.value ?? ''}
                      onChange={(e) => handleChange(index, 'value', e.target.value, isStudent)}
                      disabled={f.field === undefined}
                      sx={{ typography: 'body2' }}
                    >
                      {meta.apiData?.options?.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
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
                    disabled={f.field === undefined}
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
    [
      getFieldMeta,
      handleChange,
      handleRemoveFilter,
      getOperatorOptionsForField,
      studentFieldOptions,
      employeeFieldOptions,
    ]
  );

  const studentFilterContent = useMemo(() => {
    if (isStudentFieldsLoading) {
      return (
        <Typography variant="caption" sx={{ p: 2 }}>
          Loading student fields...
        </Typography>
      );
    }

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
  }, [formik.values, basePath, renderFilterRows, isStudentFieldsLoading]);

  const employeeFilterContent = useMemo(() => {
    if (isEmployeeFieldsLoading) {
      return (
        <Typography variant="caption" sx={{ p: 2 }}>
          Loading employee fields...
        </Typography>
      );
    }

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
  }, [formik.values, basePath, renderFilterRows, isEmployeeFieldsLoading]);

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
            disabled={isStudentFieldsLoading}
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
            disabled={isEmployeeFieldsLoading}
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
