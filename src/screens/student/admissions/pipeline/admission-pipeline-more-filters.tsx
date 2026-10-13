'use client';

import type { AdmissionPipelineOptions } from 'src/redux/student/admissions/admission-pipeline-api';
import type { AdmissionApplicationStatus } from 'src/redux/student/admissions/admission-applications-api';

import { useId, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Alert, Stack, Button, Divider, Typography, IconButton } from '@mui/material';

import { PIPELINE_ACTIVE_STATUSES } from './admission-pipeline-state';
import { getAdmissionApplicationStatusLabel } from '../application-status';

export type AdmissionPipelineFilterValues = {
  myCases?: boolean;
  assignedCounsellorId?: string;
  currentStageCode?: string;
  status?: AdmissionApplicationStatus;
};

export type AdmissionPipelineFilterChanges = {
  queue?: 'my' | 'all';
  counsellor?: string;
  stage?: string;
  status?: string;
};

type Props = {
  values: AdmissionPipelineFilterValues;
  options?: AdmissionPipelineOptions;
  isLoading?: boolean;
  isError?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
  onApply: (changes: AdmissionPipelineFilterChanges) => void;
};

type FilterDraft = {
  queue: '' | 'my' | 'all';
  counsellor: string;
  stage: string;
  status: string;
};

const ALL = '__all__';
const EMPTY_FILTERS: AdmissionPipelineFilterChanges = {
  queue: undefined,
  counsellor: undefined,
  stage: undefined,
  status: undefined,
};

const getDraft = (values: AdmissionPipelineFilterValues): FilterDraft => ({
  queue: values.myCases === undefined ? '' : values.myCases ? 'my' : 'all',
  counsellor: values.assignedCounsellorId ?? '',
  stage: values.currentStageCode ?? '',
  status: values.status === undefined ? '' : String(values.status),
});

export function AdmissionPipelineMoreFilters({
  values,
  options,
  isLoading = false,
  isError = false,
  disabled = false,
  onRetry,
  onApply,
}: Props) {
  const popover = usePopover();
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const [draft, setDraft] = useState(() => getDraft(values));
  const activeCount = [
    options && values.myCases !== undefined && values.myCases !== options.defaultMyCases,
    values.assignedCounsellorId,
    values.currentStageCode,
    values.status !== undefined,
  ].filter(Boolean).length;
  const myCases = draft.queue ? draft.queue === 'my' : options?.defaultMyCases;
  const unavailable = disabled || !options || isError;
  const updateDraft = (changes: Partial<FilterDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color={activeCount ? 'primary' : 'inherit'}
        startIcon={<Iconify icon="mdi:filter-variant" width={18} />}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={popover.open}
        aria-controls={popover.open ? dialogId : undefined}
        onClick={(event) => {
          setDraft(getDraft(values));
          popover.onOpen(event);
        }}
      >
        Filters
        {activeCount > 0 && (
          <Label color="primary" variant="soft" sx={{ ml: 0.75 }}>
            {activeCount}
          </Label>
        )}
      </Button>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: {
            role: 'dialog',
            id: dialogId,
            'aria-labelledby': titleId,
            sx: {
              width: 360,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100dvh - 32px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1, flexShrink: 0 }}
        >
          <Typography id={titleId} variant="subtitle1">
            Pipeline filters
          </Typography>
          <IconButton
            aria-label="Close filters"
            onClick={popover.onClose}
            sx={{ width: 44, height: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {isError ? (
              <Alert
                severity="error"
                action={
                  onRetry && (
                    <Button size="small" color="inherit" disabled={disabled} onClick={onRetry}>
                      Retry
                    </Button>
                  )
                }
              >
                Could not load filter options.
              </Alert>
            ) : !options ? (
              <Typography variant="body2" color="text.secondary" role="status">
                {isLoading ? 'Loading filter options...' : 'Filter options are not available yet.'}
              </Typography>
            ) : null}
            <CustomSelect
              fullWidth
              label="Cases"
              value={draft.queue || (myCases === undefined ? '' : myCases ? 'my' : 'all')}
              options={[
                { label: 'My active cases', value: 'my' },
                { label: 'All authorized active cases', value: 'all' },
              ]}
              isLoading={isLoading && !options && !isError}
              disabled={unavailable}
              onChange={(value) =>
                updateDraft({
                  queue: value === 'my' ? 'my' : 'all',
                  ...(value === 'my' ? { counsellor: '' } : {}),
                })
              }
            />
            <CustomSelect
              fullWidth
              label="Counsellor"
              value={draft.counsellor || ALL}
              options={[
                { label: 'All counsellors', value: ALL },
                ...(options?.counsellors ?? []).map((item) => ({
                  label: item.name,
                  value: item.id,
                })),
              ]}
              isSearch
              disabled={unavailable || myCases !== false}
              helperText={myCases ? 'My cases shows only applications assigned to you.' : undefined}
              onChange={(value) => updateDraft({ counsellor: value === ALL ? '' : String(value) })}
            />
            <CustomSelect
              fullWidth
              label="Current step"
              value={draft.stage || ALL}
              options={[
                { label: 'All steps', value: ALL },
                ...(options?.stages ?? []).map((item) => ({ label: item.name, value: item.code })),
              ]}
              isSearch
              disabled={unavailable}
              onChange={(value) => updateDraft({ stage: value === ALL ? '' : String(value) })}
            />
            <CustomSelect
              fullWidth
              label="Status"
              value={draft.status || ALL}
              options={[
                { label: 'All active statuses', value: ALL },
                ...PIPELINE_ACTIVE_STATUSES.map((value) => ({
                  label: getAdmissionApplicationStatusLabel(value),
                  value: String(value),
                })),
              ]}
              disabled={unavailable}
              onChange={(value) => updateDraft({ status: value === ALL ? '' : String(value) })}
            />
          </Stack>
        </Scrollbar>
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:filter-off-outline" />}
            disabled={disabled}
            onClick={() => {
              onApply(EMPTY_FILTERS);
              popover.onClose();
            }}
          >
            Clear
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:check" />}
            disabled={unavailable}
            sx={{ bgcolor: 'text.primary', color: 'background.paper' }}
            onClick={() => {
              onApply({
                queue: draft.queue || undefined,
                counsellor: myCases ? undefined : draft.counsellor || undefined,
                stage: draft.stage || undefined,
                status: draft.status || undefined,
              });
              popover.onClose();
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </CustomPopover>
    </>
  );
}
