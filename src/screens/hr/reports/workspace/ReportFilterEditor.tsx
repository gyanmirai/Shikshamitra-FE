import type { HrReportField } from 'src/redux/hr/hrReportsApi';
import type { ReportConditionGroup } from 'src/redux/hr/hrReportingWorkspaceApi';

import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { ReportConditionValue } from './ReportConditionValue';

const operatorLabels: Record<string, string> = {
  equals: 'is',
  notEquals: 'is not',
  contains: 'contains',
  in: 'is one of',
  notIn: 'is not one of',
  gt: 'is greater than',
  lt: 'is less than',
  gte: 'is on or above',
  lte: 'is on or below',
  between: 'is between',
  empty: 'is empty',
  notEmpty: 'is not empty',
};
export function ReportFilterEditor({
  value,
  fields,
  onChange,
  nested = false,
}: {
  value: ReportConditionGroup;
  fields: HrReportField[];
  onChange: (next: ReportConditionGroup) => void;
  nested?: boolean;
}) {
  return (
    <Stack
      spacing={1.5}
      sx={nested ? { p: 2, border: 1, borderColor: 'divider', borderRadius: 1 } : undefined}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField
          select
          size="small"
          label="Match conditions"
          value={value.match}
          onChange={(e) => onChange({ ...value, match: e.target.value as 'all' | 'any' })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Match all</MenuItem>
          <MenuItem value="any">Match any</MenuItem>
        </TextField>
        <Button
          size="small"
          onClick={() =>
            onChange({
              ...value,
              conditions: [
                ...value.conditions,
                { field: fields[0]?.id || '', operator: 'equals', value: '' },
              ],
            })
          }
        >
          Add condition
        </Button>
        {!nested && (
          <Button
            size="small"
            onClick={() =>
              onChange({
                ...value,
                groups: [...value.groups, { match: 'any', conditions: [], groups: [] }],
              })
            }
          >
            Add condition group
          </Button>
        )}
      </Stack>
      {value.conditions.length === 0 && value.groups.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No fixed filters. The report includes all records allowed by the run selection and your
          access.
        </Typography>
      )}
      {value.conditions.map((condition, index) => {
        const field = fields.find((f) => f.id === condition.field);
        const update = (patch: Partial<typeof condition>) =>
          onChange({
            ...value,
            conditions: value.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)),
          });
        return (
          <Box
            key={index}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(140px, 1fr) minmax(140px, 1fr) minmax(160px, 2fr) 36px',
              },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              select
              label={`Filter field ${index + 1}`}
              value={condition.field}
              onChange={(e) =>
                update({ field: e.target.value, operator: 'equals', value: '', values: [] })
              }
            >
              {fields.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Comparison"
              value={condition.operator}
              onChange={(e) =>
                update({
                  operator: e.target.value,
                  value: '',
                  values: [],
                  askWhenGenerating: ['empty', 'notEmpty'].includes(e.target.value)
                    ? false
                    : condition.askWhenGenerating,
                })
              }
            >
              {field?.operators.map((o) => (
                <MenuItem key={o} value={o}>
                  {operatorLabels[o] || o}
                </MenuItem>
              ))}
            </TextField>
            <ReportConditionValue
              field={field}
              condition={condition}
              onChange={update}
              label={condition.askWhenGenerating ? 'Default value' : 'Value'}
            />
            <IconButton
              size="small"
              aria-label={`Remove filter ${index + 1}`}
              onClick={() =>
                onChange({ ...value, conditions: value.conditions.filter((_, i) => i !== index) })
              }
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
            {!['empty', 'notEmpty'].includes(condition.operator) && (
              <FormControlLabel
                sx={{ gridColumn: '1 / -1' }}
                control={
                  <Checkbox
                    size="small"
                    checked={!!condition.askWhenGenerating}
                    onChange={(_, checked) => update({ askWhenGenerating: checked })}
                  />
                }
                label="Ask for this value when generating"
              />
            )}
          </Box>
        );
      })}
      {value.groups.map((group, index) => (
        <Stack key={index} spacing={1}>
          <ReportFilterEditor
            nested
            value={group}
            fields={fields}
            onChange={(next) =>
              onChange({ ...value, groups: value.groups.map((g, i) => (i === index ? next : g)) })
            }
          />
          <Button
            size="small"
            color="error"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() =>
              onChange({ ...value, groups: value.groups.filter((_, i) => i !== index) })
            }
          >
            Remove group
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
