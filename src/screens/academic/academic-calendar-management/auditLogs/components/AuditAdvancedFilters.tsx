import dayjs from 'dayjs';
import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import {
  ROLE_OPTIONS,
  EMPTY_FILTERS,
  REASON_OPTIONS,
  APPROVAL_OPTIONS,
  HAS_DIFF_OPTIONS,
  DATE_RANGE_OPTIONS,
} from '../constants/auditLogs.constants';

import type { AuditFilterState } from '../types/auditLogs.types';

interface Props {
  filters: AuditFilterState;
  onApply: (filters: AuditFilterState) => void;
  onClose: () => void;
  entityTypes?: string[];
}

export default function AuditAdvancedFilters({
  filters,
  onApply,
  onClose,
  entityTypes = [],
}: Props) {
  const [draft, setDraft] = useState(filters);
  const invalidRange =
    draft.dateRange === 'custom' &&
    (!draft.fromDate || !draft.toDate || draft.fromDate > draft.toDate);
  const controls = [
    { key: 'dateRange', label: 'Date range', options: DATE_RANGE_OPTIONS },
    {
      key: 'entityType',
      label: 'Entity type',
      options: [
        { label: 'All entities', value: '' },
        ...Array.from(new Set([...entityTypes, filters.entityType].filter(Boolean))).map(
          (value) => ({ label: value, value })
        ),
      ],
    },
    { key: 'changedByRole', label: 'Performed by role', options: ROLE_OPTIONS },
    { key: 'hasDiff', label: 'Recorded changes', options: HAS_DIFF_OPTIONS },
    { key: 'reasonAvailable', label: 'Reason', options: REASON_OPTIONS },
    { key: 'approvalStatus', label: 'Approval status', options: APPROVAL_OPTIONS },
  ] as const;
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Advanced Filters"
      titleInfo="Refine records on the current page. Action filtering applies to the full history."
      maxWidth="sm"
      hasForm={false}
    >
      <DialogScrollContent>
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}
        >
          {controls.map(({ key, label, options }) => (
            <CustomSelect
              key={key}
              label={label}
              size="small"
              fullWidth
              options={[...options]}
              value={draft[key]}
              disabled={key === 'approvalStatus'}
              helperText={
                key === 'approvalStatus'
                  ? 'Approval status is not supplied by the audit service.'
                  : undefined
              }
              onChange={(value) => setDraft({ ...draft, [key]: String(value) })}
            />
          ))}
          {draft.dateRange === 'custom' && (
            <>
              <CustomDateRangePicker
                label="Occurred between"
                dateFormat="DD/MM/YYYY"
                value={[
                  draft.fromDate ? dayjs(draft.fromDate) : null,
                  draft.toDate ? dayjs(draft.toDate) : null,
                ]}
                slotProps={{ field: { size: 'small', fullWidth: true } }}
                onChange={([from, to]) =>
                  setDraft({
                    ...draft,
                    fromDate: from?.isValid() ? from.format('YYYY-MM-DD') : undefined,
                    toDate: to?.isValid() ? to.format('YYYY-MM-DD') : undefined,
                  })
                }
              />
              {invalidRange && (
                <Typography variant="caption" color="error.main" role="status">
                  Select a valid start and end date.
                </Typography>
              )}
            </>
          )}
          <TextField
            label="Entity ID"
            size="small"
            value={draft.entityId}
            onChange={(event) => setDraft({ ...draft, entityId: event.target.value })}
          />
        </Box>
      </DialogScrollContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          size="small"
          color="inherit"
          onClick={() => setDraft({ ...EMPTY_FILTERS, search: draft.search, action: draft.action })}
        >
          Clear filters
        </Button>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={invalidRange}
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply filters
          </Button>
        </Stack>
      </DialogActions>
    </CustomDialog>
  );
}
