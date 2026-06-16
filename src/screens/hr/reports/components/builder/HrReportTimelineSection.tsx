import type { Dispatch, SetStateAction } from 'react';
import type { HrReportField } from 'src/redux/hr/hrReportsApi';

import { Box, Chip, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';

import type { HrReportBuilderState } from '../../hr-report-types';

type HrReportTimelineSectionProps = {
  state: HrReportBuilderState;
  setState: Dispatch<SetStateAction<HrReportBuilderState>>;
  dateFields: HrReportField[];
  dateRangeError: string;
  isPayrollSource: boolean;
  timelineChips: string[];
  onClearTimeline: () => void;
};

export function HrReportTimelineSection({
  state,
  setState,
  dateFields,
  dateRangeError,
  isPayrollSource,
  timelineChips,
  onClearTimeline,
}: HrReportTimelineSectionProps) {
  return (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">Timeline</Typography>
          <Button
            size="small"
            variant="text"
            disabled={!state.dateField && !state.fromDate && !state.toDate && !state.month}
            onClick={onClearTimeline}
          >
            Clear Timeline
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: isPayrollSource ? '1fr 1fr' : '1.2fr 1fr 1fr' },
          }}
        >
          {isPayrollSource ? (
            <TextField
              size="small"
              type="month"
              label="Payroll Month"
              value={state.month}
              InputLabelProps={{ shrink: true }}
              onChange={(event) =>
                setState((current) => ({ ...current, month: event.target.value }))
              }
            />
          ) : (
            <>
              <TextField
                select
                size="small"
                label="Date Basis"
                value={state.dateField}
                disabled={dateFields.length === 0}
                onChange={(event) =>
                  setState((current) => ({ ...current, dateField: event.target.value }))
                }
              >
                {dateFields.map((field) => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="date"
                label="From Date"
                value={state.fromDate}
                InputLabelProps={{ shrink: true }}
                error={Boolean(dateRangeError)}
                onChange={(event) =>
                  setState((current) => ({ ...current, fromDate: event.target.value }))
                }
              />
              <TextField
                size="small"
                type="date"
                label="To Date"
                value={state.toDate}
                InputLabelProps={{ shrink: true }}
                error={Boolean(dateRangeError)}
                helperText={dateRangeError}
                onChange={(event) =>
                  setState((current) => ({ ...current, toDate: event.target.value }))
                }
              />
            </>
          )}
        </Box>

        {timelineChips.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {timelineChips.map((chip) => (
              <Chip key={chip} label={chip} size="small" variant="soft" />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
