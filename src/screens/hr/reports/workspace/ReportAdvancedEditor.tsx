import type { ReportDesign, ReportDataset } from 'src/redux/hr/hrReportingWorkspaceApi';

import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Stack,
  Button,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import { isMonthlyRegister, isIssuedSalaryDocument } from '../reporting-workspace-utils';

const parameterLabels: Record<string, string> = {
  period: 'Reporting period',
  departments: 'Departments',
  employeeIds: 'Staff selection',
  academicYearId: 'Academic year',
  educationMediumStageId: 'School section',
  employeeGroup: 'Staff group',
  cycleId: 'Review cycle',
  includeDrafts: 'Include draft payroll',
};
export function ReportAdvancedEditor({
  design,
  dataset,
  onChange,
  section = 'advanced',
}: {
  section?: 'advanced' | 'summary';
  design: ReportDesign;
  dataset: ReportDataset;
  onChange: (next: ReportDesign) => void;
}) {
  const update = (patch: Partial<ReportDesign>) => onChange({ ...design, ...patch });
  return (
    <Stack spacing={2}>
      {section === 'summary' && (
        <>
          <Typography variant="subtitle2">Grouping and summaries</Typography>
          <Autocomplete
            multiple
            size="small"
            options={dataset.fields.filter((f) => f.groupable)}
            value={design.groups
              .map((id) => dataset.fields.find((f) => f.id === id)!)
              .filter(Boolean)}
            getOptionLabel={(f) => f.label}
            onChange={(_, fields) => update({ groups: fields.slice(0, 2).map((f) => f.id) })}
            renderInput={(params) => <TextField {...params} label="Group by (up to two fields)" />}
          />
          {design.summaries.map((summary, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                select
                size="small"
                label="Summary field"
                value={summary.field}
                fullWidth
                onChange={(e) =>
                  update({
                    summaries: design.summaries.map((s, i) =>
                      i === index ? { ...s, field: e.target.value } : s
                    ),
                  })
                }
              >
                {dataset.fields.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Calculation"
                value={summary.function}
                fullWidth
                onChange={(e) =>
                  update({
                    summaries: design.summaries.map((s, i) =>
                      i === index ? { ...s, function: e.target.value } : s
                    ),
                  })
                }
              >
                {[
                  'count',
                  'distinct',
                  ...(dataset.fields.find((f) => f.id === summary.field)?.summarizable
                    ? ['sum', 'avg']
                    : []),
                ].map((f) => (
                  <MenuItem key={f} value={f}>
                    {
                      (
                        {
                          count: 'Row count',
                          distinct: 'Distinct values',
                          sum: 'Sum',
                          avg: 'Average',
                        } as Record<string, string>
                      )[f]
                    }
                  </MenuItem>
                ))}
              </TextField>
              <IconButton
                size="small"
                aria-label={`Remove summary ${index + 1}`}
                onClick={() =>
                  update({ summaries: design.summaries.filter((_, i) => i !== index) })
                }
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() =>
              update({
                summaries: [
                  ...design.summaries,
                  { field: dataset.fields[0].id, function: 'count' },
                ],
              })
            }
          >
            Add summary
          </Button>
        </>
      )}
      {section === 'advanced' && (
        <>
          <Typography variant="subtitle2">Sorting</Typography>
          {design.sorts.map((sort, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                select
                size="small"
                label="Sort field"
                value={sort.field}
                fullWidth
                onChange={(e) =>
                  update({
                    sorts: design.sorts.map((s, i) =>
                      i === index ? { ...s, field: e.target.value } : s
                    ),
                  })
                }
              >
                {dataset.fields.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Direction"
                value={sort.direction}
                fullWidth
                onChange={(e) =>
                  update({
                    sorts: design.sorts.map((s, i) =>
                      i === index ? { ...s, direction: e.target.value } : s
                    ),
                  })
                }
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>
              <IconButton
                size="small"
                aria-label={`Remove sort ${index + 1}`}
                onClick={() => update({ sorts: design.sorts.filter((_, i) => i !== index) })}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            size="small"
            disabled={design.sorts.length >= 4}
            sx={{ alignSelf: 'flex-start' }}
            onClick={() =>
              update({
                sorts: [...design.sorts, { field: dataset.fields[0].id, direction: 'asc' }],
              })
            }
          >
            Add sort
          </Button>
          <Typography variant="subtitle2">Optional chart</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <TextField
              size="small"
              select
              label="Chart"
              value={design.chart?.type || 'none'}
              onChange={(e) =>
                update({
                  chart: {
                    ...design.chart,
                    type: e.target.value,
                    function: design.chart?.function || 'count',
                  },
                })
              }
            >
              {['none', 'kpi', 'bar', 'line', 'donut'].map((t) => (
                <MenuItem key={t} value={t}>
                  {
                    (
                      {
                        none: 'None',
                        kpi: 'KPI',
                        bar: 'Bar',
                        line: 'Line',
                        donut: 'Donut',
                      } as Record<string, string>
                    )[t]
                  }
                </MenuItem>
              ))}
            </TextField>
            {design.chart && design.chart.type !== 'none' && (
              <>
                <TextField
                  size="small"
                  select
                  label="Chart category"
                  value={design.chart.categoryField || ''}
                  onChange={(e) =>
                    update({ chart: { ...design.chart!, categoryField: e.target.value } })
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {dataset.fields
                    .filter((f) => f.groupable)
                    .map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.label}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  size="small"
                  select
                  label="Chart calculation"
                  value={design.chart.function || 'count'}
                  onChange={(e) =>
                    update({ chart: { ...design.chart!, function: e.target.value } })
                  }
                >
                  {dataset.summaryFunctions.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  select
                  label="Chart value"
                  value={design.chart.valueField || ''}
                  onChange={(e) =>
                    update({ chart: { ...design.chart!, valueField: e.target.value } })
                  }
                >
                  <MenuItem value="">Row count</MenuItem>
                  {dataset.fields.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.label}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
          </Box>
          <Typography variant="subtitle2">Ask when generating</Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap>
            {dataset.parameters
              .filter((p) => p !== 'includeDrafts' || !isIssuedSalaryDocument(design))
              .map((p) => (
                <FormControlLabel
                  key={p}
                  control={
                    <Checkbox
                      size="small"
                      checked={design.parameters.includes(p)}
                      disabled={dataset.requiredParameters.includes(p)}
                      onChange={(_, checked) =>
                        update({
                          parameters: checked
                            ? [...design.parameters, p]
                            : design.parameters.filter((x) => x !== p),
                        })
                      }
                    />
                  }
                  label={parameterLabels[p] || p}
                />
              ))}
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <TextField
              select
              size="small"
              label="Default period"
              value={design.defaultPeriod}
              onChange={(e) => update({ defaultPeriod: e.target.value })}
            >
              {[
                ['thisMonth', 'This month'],
                ['lastMonth', 'Last month'],
                ['today', 'Today'],
                ['last7Days', 'Last 7 days'],
              ]
                .filter(
                  ([id]) =>
                    (!isMonthlyRegister(design) && design.dataSource !== 'payroll_statement') ||
                    ['thisMonth', 'lastMonth'].includes(id)
                )
                .map(([id, label]) => (
                  <MenuItem key={id} value={id}>
                    {label}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Date basis"
              disabled={dataset.id !== 'employee'}
              value={design.dateField}
              onChange={(e) =>
                update({
                  dateField: e.target.value,
                  parameters: e.target.value
                    ? Array.from(new Set([...design.parameters, 'period']))
                    : design.parameters.filter((p) => p !== 'period'),
                })
              }
            >
              <MenuItem value="">Dataset date</MenuItem>
              {dataset.fields
                .filter((f) => f.type === 'date')
                .map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Paper size"
              value={design.paperSize}
              onChange={(e) => update({ paperSize: e.target.value as 'A4' | 'A3' })}
            >
              <MenuItem value="A4">A4</MenuItem>
              <MenuItem value="A3">A3</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Orientation"
              value={design.orientation}
              onChange={(e) => update({ orientation: e.target.value as 'portrait' | 'landscape' })}
            >
              <MenuItem value="portrait">Portrait</MenuItem>
              <MenuItem value="landscape">Landscape</MenuItem>
            </TextField>
          </Box>
        </>
      )}
    </Stack>
  );
}
