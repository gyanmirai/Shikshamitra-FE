import type { FormikProps } from 'formik';
import type {
  RecordsFieldGroup,
  RecordsReturnRoute,
  StudentRecordsPolicy,
} from 'src/redux/student/records/student-records-types';

import { getIn } from 'formik';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { securityPaths } from 'src/constants/security-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Button,
  Switch,
  TextField,
  Accordion,
  Typography,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  actionLabels,
  recordActions,
  recordOutcomes,
  sensitiveGroups,
} from './records-settings-model';

type EditorProps = {
  form: FormikProps<StudentRecordsPolicy>;
  disabled: boolean;
  roles: { value: string; label: string }[];
  rolesUnavailable: boolean;
};
const errorFor = (form: FormikProps<StudentRecordsPolicy>, path: string) =>
  getIn(form.touched, path) ? (getIn(form.errors, path) as string | undefined) : undefined;

function Decision({
  label,
  path,
  choices,
  form,
  disabled,
  onChange,
}: {
  label: string;
  path: string;
  choices: { value: string; title: string; description: string }[];
  form: FormikProps<StudentRecordsPolicy>;
  disabled: boolean;
  onChange?: (value: string) => void;
}) {
  const value = getIn(form.values, path);
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
      <Typography component="legend" variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box
        role="radiogroup"
        aria-label={label}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: `repeat(${Math.min(choices.length, 3)}, minmax(0, 1fr))`,
          },
          gap: 1,
        }}
      >
        {choices.map((choice, index) => (
          <Button
            key={choice.value}
            role="radio"
            aria-checked={value === choice.value}
            tabIndex={
              value === choice.value ||
              (!choices.some((item) => item.value === value) && index === 0)
                ? 0
                : -1
            }
            disabled={disabled}
            variant="outlined"
            color={value === choice.value ? 'primary' : 'inherit'}
            onClick={() => {
              form.setFieldValue(path, choice.value);
              onChange?.(choice.value);
            }}
            onKeyDown={(event) => {
              if (
                !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(
                  event.key
                )
              )
                return;
              event.preventDefault();
              const nextIndex =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? choices.length - 1
                    : (index +
                        (['ArrowRight', 'ArrowDown'].includes(event.key)
                          ? 1
                          : choices.length - 1)) %
                      choices.length;
              form.setFieldValue(path, choices[nextIndex].value);
              onChange?.(choices[nextIndex].value);
              (
                event.currentTarget.parentElement?.children[nextIndex] as HTMLElement | undefined
              )?.focus();
            }}
            sx={{
              p: 1.5,
              minHeight: 80,
              textAlign: 'left',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              borderWidth: value === choice.value ? 2 : 1,
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{choice.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {choice.description}
              </Typography>
            </Stack>
          </Button>
        ))}
      </Box>
    </Box>
  );
}

function Toggle({
  label,
  path,
  form,
  disabled,
}: {
  label: string;
  path: string;
  form: FormikProps<StudentRecordsPolicy>;
  disabled: boolean;
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={Boolean(getIn(form.values, path))}
          disabled={disabled}
          onChange={(_event, checked) => form.setFieldValue(path, checked)}
        />
      }
      label={label}
    />
  );
}

export function ChangesSettings({ form, disabled, roles, rolesUnavailable }: EditorProps) {
  return (
    <Stack spacing={1.5}>
      <StudentFeedback notificationKey="STU-0813" presentation="inline" severity="info">
        The requester cannot approve their own request. Submitted requests keep the rules used when
        they were submitted.
      </StudentFeedback>
      {recordActions.map((action) => {
        const path = `changes.${action}`;
        const rule = form.values.changes[action];
        const mandatory = action === 'LegacyOverride';
        return (
          <Accordion key={action} disableGutters variant="outlined">
            <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
              <Stack>
                <Typography variant="subtitle2">{actionLabels[action]}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {rule.mode === 'Approval'
                    ? `${rule.stages.length} approval stage${rule.stages.length === 1 ? '' : 's'}`
                    : 'Direct edit with history'}
                  {rule.requireReason ? ' · Reason required' : ''}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Decision
                  label="How changes apply"
                  path={`${path}.mode`}
                  form={form}
                  disabled={disabled || mandatory}
                  choices={[
                    {
                      value: 'Direct',
                      title: 'Direct edit',
                      description: 'Authorized staff save changes immediately with history.',
                    },
                    {
                      value: 'Approval',
                      title: 'Require approval',
                      description: 'Changes apply after the final review stage.',
                    },
                  ]}
                  onChange={(value) => {
                    if (value === 'Approval' && !rule.stages.length)
                      form.setFieldValue(`${path}.stages`, [{ roleNames: [] }]);
                  }}
                />
                <Toggle
                  label="Require a reason"
                  path={`${path}.requireReason`}
                  form={form}
                  disabled={disabled || mandatory}
                />
                {mandatory && (
                  <Typography variant="body2" color="text.secondary">
                    Historical entry always requires a reason and approval by another staff member.
                  </Typography>
                )}
                {rule.mode === 'Approval' && (
                  <Stack spacing={1.5}>
                    {rule.stages.map((stage, index) => (
                      <Stack
                        key={index}
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ sm: 'center' }}
                      >
                        <CustomSelect
                          multiple
                          isSearch
                          label={`Stage ${index + 1} approver roles`}
                          value={stage.roleNames}
                          options={roles}
                          disabled={disabled || rolesUnavailable}
                          onChange={(value) =>
                            form.setFieldValue(`${path}.stages.${index}.roleNames`, value)
                          }
                          error={Boolean(errorFor(form, `${path}.stages.${index}.roleNames`))}
                          helperText={errorFor(form, `${path}.stages.${index}.roleNames`)}
                          formControlProps={{ sx: { flex: 1 } }}
                        />
                        <Button
                          disabled={disabled || rule.stages.length <= 1}
                          color="error"
                          onClick={() =>
                            form.setFieldValue(
                              `${path}.stages`,
                              rule.stages.filter((_stage, position) => position !== index)
                            )
                          }
                          aria-label={`Remove stage ${index + 1} for ${actionLabels[action]}`}
                        >
                          Remove stage
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      disabled={disabled || rule.stages.length >= 3}
                      onClick={() =>
                        form.setFieldValue(`${path}.stages`, [...rule.stages, { roleNames: [] }])
                      }
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add approval stage
                    </Button>
                    {!mandatory && (
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Optional conditions</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Require approval when every selected condition matches. Otherwise
                          authorized staff can apply a direct audited change.
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                            gap: 1.5,
                          }}
                        >
                          {(
                            [
                              { key: 'isPastDated', label: 'Past effective date' },
                              { key: 'isFutureDated', label: 'Future effective date' },
                              { key: 'isFormerStudent', label: 'Former student' },
                            ] as const
                          ).map((condition) => (
                            <CustomSelect
                              key={condition.key}
                              label={condition.label}
                              value={
                                rule.condition?.[condition.key] == null
                                  ? 'any'
                                  : rule.condition[condition.key]
                                    ? 'yes'
                                    : 'no'
                              }
                              options={[
                                { value: 'any', label: 'Any' },
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                              ]}
                              disabled={disabled}
                              onChange={(value) => {
                                const next = {
                                  ...rule.condition,
                                  [condition.key]: value === 'any' ? null : value === 'yes',
                                };
                                form.setFieldValue(
                                  `${path}.condition`,
                                  Object.values(next).every((item) => item == null) ? null : next
                                );
                              }}
                            />
                          ))}
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}

export function DocumentsSettings({ form, disabled }: Pick<EditorProps, 'form' | 'disabled'>) {
  return (
    <Stack spacing={1.5}>
      <FormSectionCard
        icon="mdi:certificate-outline"
        title="Certificate availability and numbering"
      >
        <CustomSelect
          multiple
          label="Available certificate types"
          value={form.values.documents.enabledCertificateTypes}
          options={[
            { value: 'Bonafide', label: 'Bonafide' },
            { value: 'Character', label: 'Character' },
            { value: 'Leaving', label: 'Leaving Certificate' },
            { value: 'FirstTrial', label: 'First Trial' },
          ]}
          onChange={(value) => form.setFieldValue('documents.enabledCertificateTypes', value)}
          disabled={disabled}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {(
            [
              { path: 'documents.certificateNumberPrefix', label: 'Certificate number prefix' },
              { path: 'documents.idNumberPrefix', label: 'ID card number prefix' },
            ] as const
          ).map((field) => (
            <TextField
              key={field.path}
              label={field.label}
              value={getIn(form.values, field.path)}
              name={field.path}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={disabled}
              error={Boolean(errorFor(form, field.path))}
              helperText={
                errorFor(form, field.path) ?? 'Up to 30 letters, digits, hyphens, or underscores.'
              }
            />
          ))}
        </Box>
        <StudentFeedback notificationKey="STU-0814" presentation="inline" severity="info">
          Issued documents retain their recorded number and snapshot. Changing a prefix affects new
          issues.
        </StudentFeedback>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:file-certificate-outline"
        title="Leaving Certificate eligibility"
        description="A Leaving Certificate must belong to an approved withdrawal or transfer case."
      >
        <Decision
          label="When staff may issue it"
          path="documents.leavingCertificateStage"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'ApprovedExit',
              title: 'After exit approval',
              description: 'Issue once withdrawal or transfer is approved.',
            },
            {
              value: 'EffectiveExit',
              title: 'On the effective exit date',
              description: 'Wait until the approved exit takes effect.',
            },
          ]}
        />
      </FormSectionCard>
    </Stack>
  );
}

export function TransitionsSettings({ form, disabled }: Pick<EditorProps, 'form' | 'disabled'>) {
  const transition = form.values.transitions;
  return (
    <Stack spacing={1.5}>
      <FormSectionCard
        icon="mdi:clipboard-check-outline"
        title="Required checks by outcome"
        description="Students with an unresolved required check appear as exceptions in the batch preview."
      >
        {recordOutcomes.map((outcome) => (
          <Box key={outcome} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            <Typography variant="subtitle2">{outcome}</Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap">
              {(
                [
                  { key: 'requireAcademicResult', label: 'Academic result' },
                  { key: 'requireFinanceClearance', label: 'Finance clearance' },
                  { key: 'requireLibraryClearance', label: 'Library clearance' },
                  { key: 'requireTransportClearance', label: 'Transport clearance' },
                ] as const
              ).map((check) => (
                <Toggle
                  key={check.key}
                  label={check.label}
                  path={`transitions.outcomeChecks.${outcome}.${check.key}`}
                  form={form}
                  disabled={disabled}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </FormSectionCard>
      <FormSectionCard icon="mdi:calendar-sync-outline" title="Annual renewal and batch exceptions">
        <Decision
          label="Annual renewal"
          path="transitions.annualRenewalMode"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'ShortChecklist',
              title: 'Short renewal checklist',
              description: 'Complete the school renewal checks before next-year enrollment.',
            },
            {
              value: 'DirectEnrollment',
              title: 'Direct next-year enrollment',
              description: 'Approved year-end placement creates the next-year enrollment.',
            },
          ]}
        />
        <Decision
          label="When a batch has exceptions"
          path="transitions.batchExceptionMode"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'ReadyOnly',
              title: 'Process ready students',
              description: 'Apply eligible rows and keep exceptions for follow-up.',
            },
            {
              value: 'HoldAll',
              title: 'Hold the whole batch',
              description: 'Apply only after every selected student is ready.',
            },
          ]}
        />
      </FormSectionCard>
      <FormSectionCard icon="mdi:calendar-outline" title="Effective dates and roster removal">
        <Toggle
          label="Allow past effective dates"
          path="transitions.allowPastDates"
          form={form}
          disabled={disabled}
        />
        <TextField
          type="number"
          name="transitions.maxPastDays"
          label="Maximum days in the past"
          value={transition.maxPastDays}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          disabled={disabled || !transition.allowPastDates}
          error={Boolean(errorFor(form, 'transitions.maxPastDays'))}
          helperText={errorFor(form, 'transitions.maxPastDays')}
          inputProps={{ min: 0, max: 3650 }}
        />
        <Toggle
          label="Allow future effective dates"
          path="transitions.allowFutureDates"
          form={form}
          disabled={disabled}
        />
        <TextField
          type="number"
          name="transitions.maxFutureDays"
          label="Maximum days in the future"
          value={transition.maxFutureDays}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          disabled={disabled || !transition.allowFutureDates}
          error={Boolean(errorFor(form, 'transitions.maxFutureDays'))}
          helperText={errorFor(form, 'transitions.maxFutureDays')}
          inputProps={{ min: 0, max: 3650 }}
        />
        <Decision
          label="Remove an exiting student from active rosters"
          path="transitions.rosterRemovalTiming"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'EffectiveDate',
              title: 'On the effective date',
              description: 'Keep the student on active rosters until the scheduled exit.',
            },
            {
              value: 'Approval',
              title: 'When exit is approved',
              description: 'Remove the student as soon as approval is complete.',
            },
          ]}
        />
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:account-arrow-left-outline"
        title="Returning students"
        description="A permanent profile remains visible while the next enrollment is being prepared."
      >
        <CustomSelect
          multiple
          label="Allowed return routes"
          value={transition.allowedReturnRoutes}
          options={[
            { value: 'ReuseProfile', label: 'Reuse profile with short onboarding' },
            { value: 'FreshApplication', label: 'Start a fresh application' },
            { value: 'ResumeStage', label: 'Resume an eligible remaining stage' },
          ]}
          disabled={disabled}
          error={Boolean(errorFor(form, 'transitions.allowedReturnRoutes'))}
          helperText={errorFor(form, 'transitions.allowedReturnRoutes')}
          onChange={(value) => {
            const routes = value as RecordsReturnRoute[];
            form.setFieldValue('transitions.allowedReturnRoutes', routes);
            if (!routes.includes(transition.defaultReturnRoute))
              form.setFieldValue('transitions.defaultReturnRoute', routes[0] ?? '');
          }}
        />
        <CustomSelect
          label="Default return route"
          value={transition.defaultReturnRoute}
          options={transition.allowedReturnRoutes.map((value) => ({
            value,
            label: {
              ReuseProfile: 'Reuse profile',
              FreshApplication: 'Fresh application',
              ResumeStage: 'Resume eligible stage',
            }[value],
          }))}
          disabled={disabled}
          onChange={(value) => form.setFieldValue('transitions.defaultReturnRoute', value)}
          error={Boolean(errorFor(form, 'transitions.defaultReturnRoute'))}
          helperText={errorFor(form, 'transitions.defaultReturnRoute')}
        />
      </FormSectionCard>
    </Stack>
  );
}

export function AccessSettings({ form, disabled, roles, rolesUnavailable }: EditorProps) {
  const { masks } = form.values.access;
  const setMask = (group: RecordsFieldGroup, enabled: boolean) =>
    form.setFieldValue(
      'access.masks',
      enabled
        ? [...masks, { fieldGroup: group, allowedRoleNames: [] }]
        : masks.filter((mask) => mask.fieldGroup !== group)
    );
  return (
    <Stack spacing={1.5}>
      <FormSectionCard
        icon="mdi:account-lock-outline"
        title="Guardian access after an approved change"
        description="A guardian relationship change creates a portal access review. Choose what happens to the previous access while staff verify it."
      >
        <Decision
          label="Previous guardian access"
          path="guardianAccess.onApprovedChange"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'SuspendUntilReview',
              title: 'Suspend until verified',
              description:
                'Suspend the previous guardian link until an authorized reviewer confirms access.',
            },
            {
              value: 'KeepUntilReview',
              title: 'Keep until reviewed',
              description: 'Keep the existing link active while the review is pending.',
            },
          ]}
        />
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:account-clock-outline"
        title="Access during provisioning"
        description="Daily modules remain available after activation. This setting controls Student Records access before onboarding completes."
      >
        <Decision
          label="Records access"
          path="provisioning.mode"
          form={form}
          disabled={disabled}
          choices={[
            {
              value: 'OnboardingOnly',
              title: 'Onboarding only',
              description: 'Staff work from the onboarding case until completion.',
            },
            {
              value: 'Summary',
              title: 'Read-only summary',
              description: 'Daily modules can open a limited student summary.',
            },
            {
              value: 'Full',
              title: 'Full Records access',
              description: 'Allow record actions under school approval rules.',
            },
          ]}
          onChange={(value) => {
            if (value !== 'Full') form.setFieldValue('provisioning.allowPlacementEdits', false);
          }}
        />
        <Toggle
          label="Allow placement edits during provisioning"
          path="provisioning.allowPlacementEdits"
          form={form}
          disabled={disabled || form.values.provisioning.mode !== 'Full'}
        />
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:shield-lock-outline"
        title="Sensitive field visibility"
        description="Without a restriction, normal Records permissions apply. A restriction permits only the selected Security roles; selecting no roles hides that group from everyone."
      >
        {sensitiveGroups.map((group) => {
          const mask = masks.find((item) => item.fieldGroup === group);
          return (
            <Stack
              key={group}
              spacing={1}
              sx={{ pb: 1.5, borderBottom: 1, borderColor: 'divider' }}
            >
              <FormControlLabel
                label={`Restrict ${actionLabels[group].toLowerCase()}`}
                control={
                  <Switch
                    checked={Boolean(mask)}
                    disabled={disabled}
                    onChange={(_event, checked) => setMask(group, checked)}
                  />
                }
              />
              {mask && (
                <CustomSelect
                  multiple
                  isSearch
                  label={`Roles allowed to see ${actionLabels[group].toLowerCase()}`}
                  value={mask.allowedRoleNames}
                  options={roles}
                  disabled={disabled || rolesUnavailable}
                  onChange={(value) =>
                    form.setFieldValue(
                      'access.masks',
                      masks.map((item) =>
                        item.fieldGroup === group ? { ...item, allowedRoleNames: value } : item
                      )
                    )
                  }
                />
              )}
            </Stack>
          );
        })}
        <Button
          component={RouterLink}
          href={securityPaths.roleAndPermission.role}
          sx={{ alignSelf: 'flex-start' }}
        >
          Manage roles in Security
        </Button>
      </FormSectionCard>
    </Stack>
  );
}
