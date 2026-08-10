'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmInquiryTypeDto,
  AdmissionCrmInquirySourceDto,
  AdmissionCrmInquiryTypeUpsertDto,
  AdmissionCrmInquirySourceUpsertDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Select,
  Tooltip,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  FormControl,
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import { AdmissionInquiryChannel } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmInquiryTypesQuery,
  useGetAdmissionCrmInquirySourcesQuery,
  useCreateAdmissionCrmInquiryTypeMutation,
  useUpdateAdmissionCrmInquiryTypeMutation,
  useCreateAdmissionCrmInquirySourceMutation,
  useUpdateAdmissionCrmInquirySourceMutation,
  useSetAdmissionCrmInquiryTypeStatusMutation,
  useSetAdmissionCrmInquirySourceStatusMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { getAdmissionCrmChannelLabel } from '../admissions-crm/admissions-crm-utils';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

export type CatalogView = 'sources' | 'types';
type CatalogRecord = AdmissionCrmInquirySourceDto | AdmissionCrmInquiryTypeDto;

type CatalogForm = {
  code: string;
  displayName: string;
  description: string;
  displayOrder: number;
  allowedChannels: AdmissionInquiryChannel[];
  isRoutingEligible: boolean;
};

const emptyForm = (): CatalogForm => ({
  code: '',
  displayName: '',
  description: '',
  displayOrder: 10,
  allowedChannels: [AdmissionInquiryChannel.ManualBackOffice],
  isRoutingEligible: true,
});

const channels = Object.values(AdmissionInquiryChannel).filter(
  (value): value is AdmissionInquiryChannel => typeof value === 'number'
);

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message || response.data?.message || 'The catalog could not be saved.'
  );
};

const isSource = (record: CatalogRecord): record is AdmissionCrmInquirySourceDto =>
  'allowedChannels' in record;

export function PipelineCatalogSettings({
  academicYearId,
  view,
}: {
  academicYearId: string;
  view: CatalogView;
}) {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editing, setEditing] = useState<CatalogRecord | null>(null);
  const [form, setForm] = useState<CatalogForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sourcesQuery = useGetAdmissionCrmInquirySourcesQuery(
    { academicYearId, includeInactive },
    { skip: view !== 'sources' }
  );
  const typesQuery = useGetAdmissionCrmInquiryTypesQuery(
    { academicYearId, includeInactive },
    { skip: view !== 'types' }
  );
  const [createSource, createSourceState] = useCreateAdmissionCrmInquirySourceMutation();
  const [updateSource, updateSourceState] = useUpdateAdmissionCrmInquirySourceMutation();
  const [setSourceStatus, sourceStatusState] = useSetAdmissionCrmInquirySourceStatusMutation();
  const [createType, createTypeState] = useCreateAdmissionCrmInquiryTypeMutation();
  const [updateType, updateTypeState] = useUpdateAdmissionCrmInquiryTypeMutation();
  const [setTypeStatus, typeStatusState] = useSetAdmissionCrmInquiryTypeStatusMutation();

  const query = view === 'sources' ? sourcesQuery : typesQuery;
  const records = query.data?.items || [];
  const isSaving =
    createSourceState.isLoading ||
    updateSourceState.isLoading ||
    createTypeState.isLoading ||
    updateTypeState.isLoading;
  const isChangingStatus = sourceStatusState.isLoading || typeStatusState.isLoading;

  const openEditor = (record?: CatalogRecord) => {
    setEditing(record || null);
    setForm(
      record
        ? {
            code: record.code,
            displayName: record.displayName,
            description: record.description || '',
            displayOrder: record.displayOrder,
            allowedChannels: isSource(record)
              ? [...record.allowedChannels]
              : [AdmissionInquiryChannel.ManualBackOffice],
            isRoutingEligible: isSource(record) ? record.isRoutingEligible : true,
          }
        : {
            ...emptyForm(),
            displayOrder: (records.length + 1) * 10,
          }
    );
    setDialogOpen(true);
  };

  const save = async () => {
    const code = form.code.trim().toUpperCase();
    const displayName = form.displayName.trim();
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      shikshaMitraToast.error({
        message: 'Code can use letters, numbers, hyphens, and underscores only.',
      });
      return;
    }
    if (!displayName) {
      shikshaMitraToast.error({ message: 'Enter a school-facing name.' });
      return;
    }
    if (view === 'sources' && form.allowedChannels.length === 0) {
      shikshaMitraToast.error({ message: 'Select at least one inquiry channel.' });
      return;
    }

    try {
      if (view === 'sources') {
        const body: AdmissionCrmInquirySourceUpsertDto = {
          code,
          displayName,
          description: form.description.trim() || null,
          displayOrder: Number(form.displayOrder) || 0,
          allowedChannels: form.allowedChannels,
          isRoutingEligible: form.isRoutingEligible,
        };
        if (editing) {
          await updateSource({ sourceId: editing.id, body }).unwrap();
        } else {
          await createSource({ academicYearId, body }).unwrap();
        }
      } else {
        const body: AdmissionCrmInquiryTypeUpsertDto = {
          code,
          displayName,
          description: form.description.trim() || null,
          displayOrder: Number(form.displayOrder) || 0,
        };
        if (editing) {
          await updateType({ inquiryTypeId: editing.id, body }).unwrap();
        } else {
          await createType({ academicYearId, body }).unwrap();
        }
      }
      setDialogOpen(false);
      shikshaMitraToast.success({
        message: `${view === 'sources' ? 'Inquiry source' : 'Inquiry type'} saved.`,
      });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const toggleStatus = async (record: CatalogRecord) => {
    const nextActive = !record.isActive;
    const body = {
      isActive: nextActive,
      reason: nextActive ? null : 'Disabled in Pipeline Settings.',
    };
    try {
      if (isSource(record)) {
        await setSourceStatus({ sourceId: record.id, body }).unwrap();
      } else {
        await setTypeStatus({ inquiryTypeId: record.id, body }).unwrap();
      }
      shikshaMitraToast.success({
        message: `${record.displayName} ${nextActive ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const columns: IColumn[] = (() => {
    const result: IColumn[] = [
      {
        id: 'displayName',
        label: view === 'sources' ? 'Inquiry source' : 'Inquiry type',
        minWidth: 190,
        isSort: true,
        render: (value, row) => (
          <Stack spacing={0.1}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {value}
            </Box>
            {(row as CatalogRecord).description ? (
              <Box component="span" sx={{ color: 'text.secondary', fontSize: 12 }}>
                {(row as CatalogRecord).description}
              </Box>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'code',
        label: 'Code',
        minWidth: 130,
        isSort: true,
      },
    ];
    if (view === 'sources') {
      result.push({
        id: 'allowedChannels',
        label: 'Used for',
        minWidth: 260,
        render: (value) => (
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {(value as AdmissionInquiryChannel[]).map((channel) => (
              <Chip
                key={channel}
                size="small"
                variant="outlined"
                label={getAdmissionCrmChannelLabel(channel)}
              />
            ))}
          </Stack>
        ),
      });
    }
    result.push(
      {
        id: 'displayOrder',
        label: 'Order',
        minWidth: 90,
        align: 'right',
        isSort: true,
        filterType: 'number',
      },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 110,
        isFilter: true,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' },
        ],
        render: (value) => (
          <Chip
            size="small"
            variant="outlined"
            color={value ? 'success' : 'default'}
            label={value ? 'Active' : 'Inactive'}
          />
        ),
      },
      {
        id: 'actions',
        label: '',
        minWidth: 100,
        align: 'right',
        excludeFromExport: true,
        render: (_value, row) => {
          const record = row as CatalogRecord;
          return (
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip title={`Edit ${record.displayName}`}>
                <IconButton
                  size="small"
                  onClick={() => openEditor(record)}
                  aria-label={`Edit ${record.displayName}`}
                >
                  <Iconify icon="mdi:pencil-outline" />
                </IconButton>
              </Tooltip>
              <Tooltip title={`${record.isActive ? 'Disable' : 'Enable'} ${record.displayName}`}>
                <span>
                  <IconButton
                    size="small"
                    disabled={isChangingStatus}
                    onClick={() => toggleStatus(record)}
                    aria-label={`${record.isActive ? 'Disable' : 'Enable'} ${record.displayName}`}
                  >
                    <Iconify
                      icon={
                        record.isActive ? 'mdi:pause-circle-outline' : 'mdi:play-circle-outline'
                      }
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      }
    );
    return result;
  })();

  return (
    <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography component="h2" variant="subtitle1">
            {view === 'sources' ? 'Inquiry Sources' : 'Inquiry Types'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {view === 'sources'
              ? 'Sources answer where an inquiry came from and can participate in owner routing.'
              : 'Types answer why a family contacted the school and stay independent of the intake channel.'}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" gap={1}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeInactive}
                onChange={(event) => setIncludeInactive(event.target.checked)}
              />
            }
            label="Show inactive"
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => openEditor()}
          >
            Add {view === 'sources' ? 'source' : 'type'}
          </Button>
        </Stack>
      </Stack>

      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Pipeline catalog could not be loaded.
        </Alert>
      ) : (
        <>
          {query.isFetching && !query.isLoading ? (
            <LinearProgress aria-label="Refreshing Pipeline catalog" />
          ) : null}
          <CustomizableTable
            key={view}
            tableId={`student-enrollment-pipeline-catalog-${view}`}
            tableTitle={view === 'sources' ? 'Inquiry sources' : 'Inquiry types'}
            columns={columns}
            data={records}
            isLoading={query.isLoading}
            isPagination={false}
            noDataText={
              <EnrollmentTableEmptyState
                title={`No inquiry ${view}`}
                description={`Add the first inquiry ${view === 'sources' ? 'source' : 'type'} for this admission year.`}
              />
            }
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !isSaving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? 'Edit' : 'Add'} inquiry {view === 'sources' ? 'source' : 'type'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              size="small"
              label="Code"
              value={form.code}
              disabled={Boolean(editing)}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              inputProps={{ maxLength: 40 }}
            />
            <TextField
              size="small"
              label="School-facing name"
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
              inputProps={{ maxLength: 120 }}
            />
            <TextField
              size="small"
              label="Description"
              value={form.description}
              multiline
              minRows={2}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              inputProps={{ maxLength: 500 }}
            />
            {view === 'sources' ? (
              <>
                <FormControl size="small">
                  <InputLabel id="pipeline-source-channels-label">Used for</InputLabel>
                  <Select
                    multiple
                    labelId="pipeline-source-channels-label"
                    label="Used for"
                    value={form.allowedChannels}
                    onChange={(event) => {
                      const { value } = event.target;
                      setForm((current) => ({
                        ...current,
                        allowedChannels:
                          typeof value === 'string'
                            ? (value.split(',').map(Number) as AdmissionInquiryChannel[])
                            : (value as AdmissionInquiryChannel[]),
                      }));
                    }}
                    renderValue={(selected) =>
                      selected.map((channel) => getAdmissionCrmChannelLabel(channel)).join(', ')
                    }
                  >
                    {channels.map((channel) => (
                      <MenuItem key={channel} value={channel}>
                        <Checkbox checked={form.allowedChannels.includes(channel)} />
                        {getAdmissionCrmChannelLabel(channel)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isRoutingEligible}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isRoutingEligible: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="Can be used in owner assignment rules"
                />
              </>
            ) : null}
            <TextField
              size="small"
              type="number"
              label="Display order"
              value={form.displayOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayOrder: Number(event.target.value),
                }))
              }
              inputProps={{ min: 0, max: 10000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isSaving} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={isSaving} onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
