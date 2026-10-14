import type { HrReportField, HrReportFilterCondition } from 'src/redux/hr/hrReportsApi';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';

type HrReportFiltersSectionProps = {
  conditions: HrReportFilterCondition[];
  filterFields: HrReportField[];
  onAddCondition: () => void;
  onUpdateCondition: (
    index: number,
    updater: (condition: HrReportFilterCondition) => HrReportFilterCondition
  ) => void;
  onRemoveCondition: (index: number) => void;
};

export function HrReportFiltersSection({
  conditions,
  filterFields,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: HrReportFiltersSectionProps) {
  const renderConditionValue = (condition: HrReportFilterCondition, index: number) => {
    const field = filterFields.find((item) => item.id === condition.field);

    if (condition.operator === 'in') {
      const optionValues = field?.options.map((option) => option.id) ?? [];
      const optionLabels = new Map(field?.options.map((option) => [option.id, option.label]));

      return (
        <Autocomplete
          multiple
          freeSolo={optionValues.length === 0}
          size="small"
          options={optionValues}
          value={condition.values ?? []}
          getOptionLabel={(option) => optionLabels.get(option) ?? option}
          onChange={(_event, value) =>
            onUpdateCondition(index, (item) => ({
              ...item,
              value: undefined,
              values: value.map((itemValue) => String(itemValue)),
            }))
          }
          renderInput={(params) => <TextField {...params} label="Values" />}
        />
      );
    }

    return (
      <TextField
        size="small"
        label="Value"
        value={condition.value ?? ''}
        type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
        InputLabelProps={field?.type === 'date' ? { shrink: true } : undefined}
        onChange={(event) =>
          onUpdateCondition(index, (item) => ({ ...item, value: event.target.value }))
        }
      />
    );
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Filters</Typography>
        <Button
          size="small"
          variant="text"
          disabled={filterFields.length === 0}
          onClick={onAddCondition}
        >
          Add Filter
        </Button>
      </Stack>
      {conditions.map((condition, index) => {
        const field = filterFields.find((item) => item.id === condition.field);
        const operators = field?.operators ?? ['equals', 'contains'];
        return (
          <Box
            key={`${condition.field}-${index}`}
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: { xs: '1fr', md: '1fr 160px 1fr 48px' },
            }}
          >
            <TextField
              select
              size="small"
              label="Field"
              value={condition.field}
              onChange={(event) =>
                onUpdateCondition(index, (item) => {
                  const nextField = filterFields.find(
                    (candidate) => candidate.id === event.target.value
                  );
                  const nextOperator = nextField?.operators[0] ?? 'equals';
                  return {
                    ...item,
                    field: event.target.value,
                    operator: nextOperator,
                    value: nextOperator === 'in' ? undefined : '',
                    values: nextOperator === 'in' ? [] : undefined,
                  };
                })
              }
            >
              {filterFields.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Operator"
              value={condition.operator}
              onChange={(event) =>
                onUpdateCondition(index, (item) => {
                  const nextOperator = event.target.value;
                  if (nextOperator === 'in') {
                    const values = item.values?.length
                      ? item.values
                      : item.value?.trim()
                        ? [item.value.trim()]
                        : [];
                    return { ...item, operator: nextOperator, value: undefined, values };
                  }

                  return {
                    ...item,
                    operator: nextOperator,
                    value: item.value ?? item.values?.[0] ?? '',
                    values: undefined,
                  };
                })
              }
            >
              {operators.map((operator) => (
                <MenuItem key={operator} value={operator}>
                  {operator}
                </MenuItem>
              ))}
            </TextField>
            {renderConditionValue(condition, index)}
            <IconButton
              size="small"
              aria-label={`Remove filter condition ${index + 1}`}
              onClick={() => onRemoveCondition(index)}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
}
