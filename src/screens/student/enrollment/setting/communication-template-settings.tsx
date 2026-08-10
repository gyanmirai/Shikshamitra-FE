'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmMessageTemplateDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { useState, useEffect } from 'react';
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
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmMessageChannel,
  AdmissionCrmMessageTemplateStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useGetAdmissionCrmMessageTemplatesQuery,
  useCreateAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmMessageTemplateStatusMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { getAdmissionCrmMessageChannelLabel } from '../admissions-crm/admissions-crm-utils';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

type TemplateForm = {
  templateName: string;
  channel: AdmissionCrmMessageChannel;
  purpose: string;
  subject: string;
  body: string;
  variables: string;
};

const moments = [
  'Inquiry captured',
  'Exam invitation',
  'Exam reminder',
  'Result eligible',
  'Result ineligible',
  'Retest required',
  'Exam absent follow-up',
  'Registration incomplete',
  'Registration verified',
  'Finance pending',
  'Activation approved',
];

const channels = Object.values(AdmissionCrmMessageChannel).filter(
  (value): value is AdmissionCrmMessageChannel => typeof value === 'number'
);

const statusLabels: Record<AdmissionCrmMessageTemplateStatus, string> = {
  [AdmissionCrmMessageTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmMessageTemplateStatus.Approved]: 'Approved',
  [AdmissionCrmMessageTemplateStatus.Retired]: 'Retired',
};

const emptyForm = (): TemplateForm => ({
  templateName: '',
  channel: AdmissionCrmMessageChannel.Sms,
  purpose: moments[0],
  subject: '',
  body: '',
  variables: 'applicantName, guardianName, standardName, schoolName, schoolContact',
});

const toForm = (template: AdmissionCrmMessageTemplateDto): TemplateForm => ({
  templateName: template.templateName,
  channel: template.channel,
  purpose: template.purpose,
  subject: template.subject || '',
  body: template.body,
  variables: template.variables.join(', '),
});

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message ||
    response.data?.message ||
    'Message template could not be saved.'
  );
};

export function CommunicationTemplateSettings({ academicYearId }: { academicYearId: string }) {
  const [editing, setEditing] = useState<AdmissionCrmMessageTemplateDto | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRetirement, setPendingRetirement] = useState<AdmissionCrmMessageTemplateDto | null>(
    null
  );
  const query = useGetAdmissionCrmMessageTemplatesQuery({
    academicYearId,
    skipCount: 0,
    maxResultCount: 200,
  });
  const [createTemplate, createState] = useCreateAdmissionCrmMessageTemplateMutation();
  const [updateTemplate, updateState] = useUpdateAdmissionCrmMessageTemplateMutation();
  const [updateStatus, statusState] = useUpdateAdmissionCrmMessageTemplateStatusMutation();
  const isSaving = createState.isLoading || updateState.isLoading;
  const isInteractionBlocked =
    query.isLoading || query.isFetching || query.isError || isSaving || statusState.isLoading;

  useEffect(() => {
    if (!query.isFetching) return;
    setDialogOpen(false);
    setPendingRetirement(null);
  }, [query.isFetching]);

  const openEditor = (template?: AdmissionCrmMessageTemplateDto) => {
    if (isInteractionBlocked) return;
    setEditing(template || null);
    setForm(template ? toForm(template) : emptyForm());
    setDialogOpen(true);
  };

  const save = async () => {
    if (isInteractionBlocked) return;
    const templateName = form.templateName.trim();
    const bodyText = form.body.trim();
    if (!templateName || !form.purpose.trim() || !bodyText) {
      shikshaMitraToast.error({
        message: 'Template name, admission moment, and message are required.',
      });
      return;
    }
    const body = {
      templateName,
      channel: form.channel,
      purpose: form.purpose.trim(),
      subject: form.subject.trim() || null,
      body: bodyText,
      variables: form.variables
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        await updateTemplate({ templateId: editing.id, body }).unwrap();
      } else {
        await createTemplate({ academicYearId, body }).unwrap();
      }
      setDialogOpen(false);
      shikshaMitraToast.success({ message: 'Message template saved as a draft.' });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const changeStatus = async (template: AdmissionCrmMessageTemplateDto) => {
    if (isInteractionBlocked) return;
    const approve = template.status !== AdmissionCrmMessageTemplateStatus.Approved;
    try {
      await updateStatus({
        templateId: template.id,
        body: {
          status: approve
            ? AdmissionCrmMessageTemplateStatus.Approved
            : AdmissionCrmMessageTemplateStatus.Retired,
          isActive: approve,
        },
      }).unwrap();
      shikshaMitraToast.success({
        message: `${template.templateName} ${approve ? 'approved' : 'retired'}.`,
      });
      if (!approve) setPendingRetirement(null);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'templateName',
      label: 'Template',
      minWidth: 210,
      isSort: true,
    },
    {
      id: 'purpose',
      label: 'Admission moment',
      minWidth: 190,
      isSort: true,
    },
    {
      id: 'channel',
      label: 'Channel',
      minWidth: 120,
      isFilter: true,
      filterType: 'enum',
      enumOptions: channels.map((channel) => ({
        value: channel,
        label: getAdmissionCrmMessageChannelLabel(channel),
      })),
      render: (value) => getAdmissionCrmMessageChannelLabel(value),
    },
    {
      id: 'body',
      label: 'Message',
      minWidth: 320,
      render: (value) => (
        <Box
          component="span"
          sx={{
            display: 'block',
            maxWidth: 420,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 115,
      isFilter: true,
      filterType: 'enum',
      enumOptions: Object.entries(statusLabels).map(([value, label]) => ({
        value: Number(value),
        label,
      })),
      render: (value) => (
        <Chip
          size="small"
          variant="outlined"
          color={
            value === AdmissionCrmMessageTemplateStatus.Approved
              ? 'success'
              : value === AdmissionCrmMessageTemplateStatus.Draft
                ? 'warning'
                : 'default'
          }
          label={statusLabels[value as AdmissionCrmMessageTemplateStatus]}
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
        const template = row as AdmissionCrmMessageTemplateDto;
        return (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="Edit">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    isInteractionBlocked ||
                    template.status === AdmissionCrmMessageTemplateStatus.Retired
                  }
                  onClick={() => openEditor(template)}
                  aria-label={`Edit ${template.templateName}`}
                >
                  <Iconify icon="mdi:pencil-outline" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip
              title={
                template.status === AdmissionCrmMessageTemplateStatus.Approved
                  ? 'Retire'
                  : 'Approve'
              }
            >
              <span>
                <IconButton
                  size="small"
                  disabled={isInteractionBlocked}
                  onClick={() => {
                    if (template.status === AdmissionCrmMessageTemplateStatus.Approved) {
                      setPendingRetirement(template);
                    } else {
                      changeStatus(template);
                    }
                  }}
                  aria-label={
                    template.status === AdmissionCrmMessageTemplateStatus.Approved
                      ? `Retire ${template.templateName}`
                      : `Approve ${template.templateName}`
                  }
                >
                  <Iconify
                    icon={
                      template.status === AdmissionCrmMessageTemplateStatus.Approved
                        ? 'mdi:archive-outline'
                        : 'mdi:check-circle-outline'
                    }
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:plus" />}
          disabled={isInteractionBlocked}
          onClick={() => openEditor()}
        >
          Add template
        </Button>
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
          Message templates could not be loaded.
        </Alert>
      ) : (
        <>
          {query.isFetching && !query.isLoading ? (
            <LinearProgress aria-label="Refreshing admission message templates" />
          ) : null}
          <CustomizableTable
            tableId="student-enrollment-message-templates"
            tableTitle="Admission message templates"
            columns={columns}
            data={query.data?.items || []}
            isLoading={query.isLoading}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            noDataText={
              <EnrollmentTableEmptyState
                title="No admission message templates"
                description="Add an approved template before sending automated or manual messages."
              />
            }
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
        </>
      )}

      <Dialog
        open={Boolean(pendingRetirement)}
        onClose={() => !isInteractionBlocked && setPendingRetirement(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Retire message template?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Retiring {pendingRetirement?.templateName || 'this template'} prevents it from being
            selected for future messages. The server will block retirement while any enabled
            automation in the school still uses it.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingRetirement(null)} disabled={isInteractionBlocked}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!pendingRetirement || isInteractionBlocked}
            onClick={() => pendingRetirement && changeStatus(pendingRetirement)}
          >
            Retire template
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => !isInteractionBlocked && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editing ? 'Edit message template' : 'Add message template'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Template name"
                value={form.templateName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, templateName: event.target.value }))
                }
                inputProps={{ maxLength: 160 }}
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Channel"
                value={form.channel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    channel: Number(event.target.value) as AdmissionCrmMessageChannel,
                  }))
                }
              >
                {channels.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {getAdmissionCrmMessageChannelLabel(channel)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              select
              fullWidth
              size="small"
              label="Admission moment"
              value={form.purpose}
              onChange={(event) =>
                setForm((current) => ({ ...current, purpose: event.target.value }))
              }
            >
              {moments.map((moment) => (
                <MenuItem key={moment} value={moment}>
                  {moment}
                </MenuItem>
              ))}
            </TextField>
            {form.channel === AdmissionCrmMessageChannel.Email ? (
              <TextField
                fullWidth
                size="small"
                label="Email subject"
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subject: event.target.value }))
                }
                inputProps={{ maxLength: 240 }}
              />
            ) : null}
            <TextField
              fullWidth
              multiline
              minRows={5}
              label="Message"
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              inputProps={{ maxLength: 4000 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Allowed variables"
              value={form.variables}
              onChange={(event) =>
                setForm((current) => ({ ...current, variables: event.target.value }))
              }
              helperText="Comma-separated variable names used in {{variableName}} placeholders."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isInteractionBlocked} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={isInteractionBlocked} onClick={save}>
            Save draft
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
