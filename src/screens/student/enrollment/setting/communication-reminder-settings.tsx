'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmMessageTemplateDto,
  AdmissionCrmConfigurationImpactPreviewDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

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
  Switch,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmJourneyTrigger,
  AdmissionCrmMessageTemplateStatus,
  useGetAdmissionCrmMessageTemplatesQuery,
  useGetAdmissionCrmCycleConfigurationQuery,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  usePreviewAdmissionCrmConfigurationImpactMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { buildAdmissionCrmCycleUpdate } from './admission-crm-cycle-update';
import { attachAdmissionCrmImpactFingerprint } from './admissions-crm-configuration-utils';
import { getAdmissionCrmMessageChannelLabel } from '../admissions-crm/admissions-crm-utils';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

import type { AdmissionCrmCycleUpdate } from './admission-crm-cycle-update';

const reminderPrefix = 'Admission reminder: ';

const triggerLabels: Partial<Record<AdmissionCrmJourneyTrigger, string>> = {
  [AdmissionCrmJourneyTrigger.LeadCreated]: 'Inquiry captured',
  [AdmissionCrmJourneyTrigger.ExamScheduled]: 'Exam scheduled',
  [AdmissionCrmJourneyTrigger.EligibilityDecided]: 'Eligibility decided',
  [AdmissionCrmJourneyTrigger.RegistrationIssued]: 'Registration invited',
  [AdmissionCrmJourneyTrigger.RegistrationIncomplete]: 'Registration remains incomplete',
  [AdmissionCrmJourneyTrigger.RegistrationCorrectionRequested]: 'Registration correction requested',
  [AdmissionCrmJourneyTrigger.RegistrationVerified]: 'Registration verified',
  [AdmissionCrmJourneyTrigger.FeeFollowUp]: 'Finance remains pending',
  [AdmissionCrmJourneyTrigger.ExamNoShow]: 'Exam marked absent',
  [AdmissionCrmJourneyTrigger.ActivationWelcome]: 'Activation completed',
};

const triggers = Object.keys(triggerLabels).map(Number) as AdmissionCrmJourneyTrigger[];

const delayedReminderTriggers = new Set<AdmissionCrmJourneyTrigger>([
  AdmissionCrmJourneyTrigger.RegistrationIssued,
  AdmissionCrmJourneyTrigger.RegistrationIncomplete,
  AdmissionCrmJourneyTrigger.RegistrationCorrectionRequested,
  AdmissionCrmJourneyTrigger.RegistrationVerified,
  AdmissionCrmJourneyTrigger.FeeFollowUp,
  AdmissionCrmJourneyTrigger.ExamNoShow,
  AdmissionCrmJourneyTrigger.ActivationWelcome,
]);

export const admissionReminderSupportsIdleDelay = (trigger: AdmissionCrmJourneyTrigger) =>
  delayedReminderTriggers.has(trigger);

type ReminderForm = {
  name: string;
  trigger: AdmissionCrmJourneyTrigger;
  messageTemplateId: string;
  minimumIdleDays: number;
  createTask: boolean;
  taskTitle: string;
  taskDueOffsetHours: number;
  isEnabled: boolean;
};

const emptyForm = (): ReminderForm => ({
  name: '',
  trigger: AdmissionCrmJourneyTrigger.LeadCreated,
  messageTemplateId: '',
  minimumIdleDays: 0,
  createTask: false,
  taskTitle: '',
  taskDueOffsetHours: 24,
  isEnabled: true,
});

const toForm = (rule: AdmissionCrmJourneyRuleDto): ReminderForm => ({
  name: rule.ruleName.slice(reminderPrefix.length),
  trigger: rule.trigger,
  messageTemplateId: rule.messageTemplateId || '',
  minimumIdleDays: admissionReminderSupportsIdleDelay(rule.trigger)
    ? rule.daysSinceLastActivity || 0
    : 0,
  createTask: rule.createTask,
  taskTitle: rule.taskTitle || '',
  taskDueOffsetHours: rule.taskDueOffsetHours,
  isEnabled: rule.isEnabled,
});

const toRule = (form: ReminderForm, priority: number): AdmissionCrmJourneyRuleDto => ({
  ruleName: `${reminderPrefix}${form.name.trim()}`,
  isEnabled: form.isEnabled,
  priority,
  trigger: form.trigger,
  stage: null,
  channel: null,
  inquirySourceId: null,
  campaignContains: null,
  leadStage: null,
  leadPriority: null,
  ownerUserId: null,
  targetStandardId: null,
  desiredClassContains: null,
  campusBranchContains: null,
  preferredLanguageContains: null,
  minimumLeadScore: null,
  maximumLeadScore: null,
  daysSinceLastActivity:
    admissionReminderSupportsIdleDelay(form.trigger) && form.minimumIdleDays > 0
      ? form.minimumIdleDays
      : null,
  daysSinceCreation: null,
  createTask: form.createTask,
  taskTitle: form.createTask ? form.taskTitle.trim() : null,
  taskDueOffsetHours: form.createTask ? form.taskDueOffsetHours : 0,
  taskNotes: form.createTask ? 'Created by an admission reminder rule.' : null,
  sendMessage: true,
  messageTemplateId: form.messageTemplateId,
});

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message ||
    response.data?.message ||
    'Reminder settings could not be saved.'
  );
};

export function CommunicationReminderSettings({ academicYearId }: { academicYearId: string }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pendingRemovalIndex, setPendingRemovalIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ReminderForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    body: AdmissionCrmCycleUpdate;
    preview: AdmissionCrmConfigurationImpactPreviewDto;
  } | null>(null);
  const configurationQuery = useGetAdmissionCrmCycleConfigurationQuery({ academicYearId });
  const templatesQuery = useGetAdmissionCrmMessageTemplatesQuery({
    academicYearId,
    status: AdmissionCrmMessageTemplateStatus.Approved,
    isActive: true,
    skipCount: 0,
    maxResultCount: 200,
  });
  const [updateConfiguration, updateState] = useUpdateAdmissionCrmCycleConfigurationMutation();
  const [previewImpact, previewState] = usePreviewAdmissionCrmConfigurationImpactMutation();
  const configuration = configurationQuery.data;
  const reminders =
    configuration?.journeyRules.filter((rule) => rule.ruleName.startsWith(reminderPrefix)) || [];
  const approvedTemplates = templatesQuery.data?.items || [];
  const templateById = new Map(approvedTemplates.map((template) => [template.id, template]));
  const hasDependencyError = configurationQuery.isError || templatesQuery.isError;
  const isDependencyRefreshing = configurationQuery.isFetching || templatesQuery.isFetching;
  const isMutationBusy = updateState.isLoading || previewState.isLoading;
  const isInteractionBlocked = hasDependencyError || isDependencyRefreshing || isMutationBusy;
  const pendingRemoval = pendingRemovalIndex == null ? undefined : reminders[pendingRemovalIndex];

  useEffect(() => {
    if (!isDependencyRefreshing) return;
    setDialogOpen(false);
    setPendingRemovalIndex(null);
    setPendingUpdate(null);
  }, [isDependencyRefreshing]);

  const openEditor = (rule?: AdmissionCrmJourneyRuleDto, index?: number) => {
    if (isInteractionBlocked) return;
    setEditingIndex(index ?? null);
    setForm(rule ? toForm(rule) : emptyForm());
    setDialogOpen(true);
  };

  const commit = async (body: AdmissionCrmCycleUpdate, fingerprint: string) => {
    await updateConfiguration({
      academicYearId,
      body: attachAdmissionCrmImpactFingerprint(body, fingerprint),
    }).unwrap();
    setDialogOpen(false);
    setPendingUpdate(null);
    setPendingRemovalIndex(null);
    shikshaMitraToast.success({ message: 'Reminder settings saved.' });
  };

  const prepareUpdate = (nextReminders: AdmissionCrmJourneyRuleDto[]) => {
    if (!configuration) return null;
    const advancedRules = configuration.journeyRules.filter(
      (rule) => !rule.ruleName.startsWith(reminderPrefix)
    );
    return buildAdmissionCrmCycleUpdate(configuration, {
      journeyRules: [...advancedRules, ...nextReminders],
    });
  };

  const previewAndSave = async (body: AdmissionCrmCycleUpdate) => {
    const preview = await previewImpact({
      academicYearId,
      body: { proposedCycleConfiguration: body },
    }).unwrap();
    if (
      preview.affectedApplicantCount ||
      preview.configurationReferenceCount ||
      preview.warnings.length
    ) {
      setPendingUpdate({ body, preview });
      return;
    }
    await commit(body, preview.fingerprint);
  };

  const save = async () => {
    if (isInteractionBlocked) return;
    if (!form.name.trim() || !form.messageTemplateId) {
      shikshaMitraToast.error({
        message: 'Reminder name and an approved message template are required.',
      });
      return;
    }
    const supportsIdleDelay = admissionReminderSupportsIdleDelay(form.trigger);
    if (
      supportsIdleDelay &&
      (!Number.isInteger(form.minimumIdleDays) ||
        form.minimumIdleDays < 0 ||
        form.minimumIdleDays > 365)
    ) {
      shikshaMitraToast.error({ message: 'Idle days must be a whole number from 0 to 365.' });
      return;
    }
    if (
      form.createTask &&
      (!form.taskTitle.trim() ||
        !Number.isInteger(form.taskDueOffsetHours) ||
        form.taskDueOffsetHours < 0 ||
        form.taskDueOffsetHours > 720)
    ) {
      shikshaMitraToast.error({
        message: 'Enter a task title and a due offset from 0 to 720 hours.',
      });
      return;
    }

    const priority =
      editingIndex == null
        ? (reminders.at(-1)?.priority || 0) + 10
        : reminders[editingIndex].priority;
    const nextRule = toRule(form, priority);
    const nextReminders =
      editingIndex == null
        ? [...reminders, nextRule]
        : reminders.map((rule, index) => (index === editingIndex ? nextRule : rule));
    const body = prepareUpdate(nextReminders);
    if (!body) return;
    try {
      await previewAndSave(body);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const confirmRemoval = async () => {
    if (pendingRemovalIndex == null || isInteractionBlocked) return;
    const body = prepareUpdate(
      reminders.filter((_rule, ruleIndex) => ruleIndex !== pendingRemovalIndex)
    );
    if (!body) {
      setPendingRemovalIndex(null);
      return;
    }
    try {
      await previewAndSave(body);
      setPendingRemovalIndex(null);
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'ruleName',
      label: 'Reminder',
      minWidth: 200,
      isSort: true,
      render: (value) => String(value).slice(reminderPrefix.length),
    },
    {
      id: 'trigger',
      label: 'Admission moment',
      minWidth: 220,
      isFilter: true,
      filterType: 'enum',
      enumOptions: triggers.map((trigger) => ({
        value: trigger,
        label: triggerLabels[trigger] || 'Other',
      })),
      render: (value) => triggerLabels[value as AdmissionCrmJourneyTrigger] || 'Other',
    },
    {
      id: 'messageTemplateId',
      label: 'Template',
      minWidth: 220,
      render: (value) => {
        const template = templateById.get(value as string);
        return template
          ? `${template.templateName} (${getAdmissionCrmMessageChannelLabel(template.channel)})`
          : 'Template unavailable';
      },
    },
    {
      id: 'daysSinceLastActivity',
      label: 'Minimum idle',
      minWidth: 120,
      align: 'right',
      render: (value) => `${value || 0} day${value === 1 ? '' : 's'}`,
    },
    {
      id: 'createTask',
      label: 'Staff follow-up',
      minWidth: 125,
      render: (value) => (value ? 'Created' : 'Not created'),
    },
    {
      id: 'isEnabled',
      label: 'Status',
      minWidth: 105,
      render: (value) => (
        <Chip
          size="small"
          variant="outlined"
          color={value ? 'success' : 'default'}
          label={value ? 'Enabled' : 'Disabled'}
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
        const reminder = row as AdmissionCrmJourneyRuleDto;
        const index = reminders.indexOf(reminder);
        const reminderName = reminder.ruleName.slice(reminderPrefix.length);
        return (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="Edit">
              <IconButton
                size="small"
                disabled={isInteractionBlocked}
                onClick={() => openEditor(reminder, index)}
                aria-label={`Edit ${reminderName}`}
              >
                <Iconify icon="mdi:pencil-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isInteractionBlocked}
                  onClick={() => setPendingRemovalIndex(index)}
                  aria-label={`Remove ${reminderName}`}
                >
                  <Iconify icon="mdi:delete-outline" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  if (hasDependencyError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              if (configurationQuery.isError) configurationQuery.refetch();
              if (templatesQuery.isError) templatesQuery.refetch();
            }}
          >
            Retry
          </Button>
        }
      >
        Reminder settings could not be loaded.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        gap={1}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Rules use approved templates, respect opt-outs, and suppress duplicate sends.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:plus" />}
          disabled={!approvedTemplates.length || isInteractionBlocked}
          onClick={() => openEditor()}
        >
          Add reminder
        </Button>
      </Stack>

      {!approvedTemplates.length && !templatesQuery.isLoading ? (
        <Alert severity="info">
          Approve at least one message template before adding a reminder.
        </Alert>
      ) : null}

      {(configurationQuery.isFetching && !configurationQuery.isLoading) ||
      (templatesQuery.isFetching && !templatesQuery.isLoading) ? (
        <LinearProgress aria-label="Refreshing admission reminder settings" />
      ) : null}

      <CustomizableTable
        tableId="student-enrollment-communication-reminders"
        tableTitle="Admission reminders"
        columns={columns}
        data={reminders}
        isLoading={configurationQuery.isLoading || templatesQuery.isLoading}
        isPagination={false}
        noDataText={
          <EnrollmentTableEmptyState
            title="No admission reminders"
            description="Add only the reminders the school will actively use."
          />
        }
        wrapperProps={{ sx: enrollmentTableWrapperSx }}
        tableContainerProps={{ sx: enrollmentTableContainerSx }}
      />

      <Dialog
        open={pendingRemovalIndex != null}
        onClose={() => !isMutationBusy && setPendingRemovalIndex(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Remove reminder?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Remove{' '}
            <strong>
              {pendingRemoval?.ruleName.slice(reminderPrefix.length) || 'this reminder'}
            </strong>
            ? This change cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={isMutationBusy} onClick={() => setPendingRemovalIndex(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isInteractionBlocked}
            onClick={confirmRemoval}
          >
            Remove reminder
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => !isMutationBusy && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingIndex == null ? 'Add reminder' : 'Edit reminder'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              size="small"
              label="Reminder name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              inputProps={{ maxLength: 120 }}
            />
            <TextField
              select
              size="small"
              label="Admission moment"
              value={form.trigger}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trigger: Number(event.target.value) as AdmissionCrmJourneyTrigger,
                  minimumIdleDays: 0,
                }))
              }
            >
              {triggers.map((trigger) => (
                <MenuItem key={trigger} value={trigger}>
                  {triggerLabels[trigger]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Approved message template"
              value={form.messageTemplateId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  messageTemplateId: event.target.value,
                }))
              }
            >
              {approvedTemplates.map((template: AdmissionCrmMessageTemplateDto) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.templateName} - {getAdmissionCrmMessageChannelLabel(template.channel)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="number"
              label="Minimum idle days"
              value={form.minimumIdleDays}
              disabled={!admissionReminderSupportsIdleDelay(form.trigger)}
              helperText={
                admissionReminderSupportsIdleDelay(form.trigger)
                  ? 'The hourly enrollment worker sends this reminder after the applicant has been idle for this many days.'
                  : 'This message is sent when the admission moment happens.'
              }
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  minimumIdleDays: Number(event.target.value),
                }))
              }
              inputProps={{ min: 0, max: 365, step: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.createTask}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, createTask: event.target.checked }))
                  }
                />
              }
              label="Also create a staff follow-up"
            />
            {form.createTask ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="Follow-up title"
                  value={form.taskTitle}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, taskTitle: event.target.value }))
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  label="Due in hours"
                  value={form.taskDueOffsetHours}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      taskDueOffsetHours: Number(event.target.value),
                    }))
                  }
                  inputProps={{ min: 0, max: 720, step: 1 }}
                />
              </Stack>
            ) : null}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isEnabled}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isEnabled: event.target.checked }))
                  }
                />
              }
              label="Enabled"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isMutationBusy} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={isInteractionBlocked} onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(pendingUpdate)}
        onClose={() => !updateState.isLoading && setPendingUpdate(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Apply reminder change?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This configuration is referenced by {pendingUpdate?.preview.affectedApplicantCount || 0}{' '}
            applicant records.
          </Typography>
          {(pendingUpdate?.preview.warnings || []).map((warning) => (
            <Alert key={warning} severity="warning" sx={{ mt: 1 }}>
              {warning}
            </Alert>
          ))}
        </DialogContent>
        <DialogActions>
          <Button disabled={updateState.isLoading} onClick={() => setPendingUpdate(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={updateState.isLoading}
            onClick={async () => {
              if (!pendingUpdate) return;
              try {
                await commit(pendingUpdate.body, pendingUpdate.preview.fingerprint);
              } catch (error) {
                shikshaMitraToast.error({ message: getErrorMessage(error) });
              }
            }}
          >
            Apply change
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
