import type { FormikProps } from 'formik';
import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Chip,
  Menu,
  Stack,
  Button,
  Drawer,
  Switch,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { FIELD_TYPES } from '../form-dialog-model';
import { InquirySourcePicker } from './inquiry-source-picker';
import { useFormInheritance } from '../hooks/use-form-inheritance';
import { setInheritedFieldMapping, resetInheritedSourceOverrides } from '../form-inheritance-model';

export function FormInheritancePanel() {
  const inheritance = useFormInheritance();
  const [resetSourceId, setResetSourceId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  if (!inheritance || inheritance.formik.values.purpose !== 1) return null;
  const { formik, enabled, setEnabled } = inheritance;
  const selectedPolicy = formik.values.inheritance?.sources.find(
    (source) => source.inquiryFormDefinitionId === inheritance.sourceId
  );
  const hasOverrides = Boolean(
    selectedPolicy &&
    (selectedPolicy.fieldMappings.length ||
      selectedPolicy.layouts.length ||
      selectedPolicy.requiredFieldIdentities.length)
  );
  const needsRecovery =
    inheritance.failed ||
    inheritance.sourceFailed ||
    inheritance.connectionsFailed ||
    Boolean(inheritance.preview && !inheritance.preview.isValid);
  const canCheck = Boolean(
    (inheritance.sourceId || inheritance.connectionsFailed) &&
    !inheritance.loading &&
    !formik.isSubmitting
  );
  return (
    <FormSectionCard
      title="Reuse Inquiry Questions"
      icon="mdi:link-variant"
      descriptionTooltip="Questions Follow Each Applicant's Linked Inquiry Form. Offering and Workflow Setup Control the Connections."
      sx={{ m: 1, flexShrink: 0, minWidth: 0 }}
      contentSpacing={1.5}
      action={
        enabled && (
          <CustomTooltip title="More Options">
            <IconButton
              size="small"
              aria-label="More Options"
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor)}
              aria-controls={menuAnchor ? 'inquiry-question-options' : undefined}
              disabled={formik.isSubmitting}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <Iconify icon="mdi:dots-vertical" />
            </IconButton>
          </CustomTooltip>
        )
      }
    >
      <FormControlLabel
        sx={{ m: 0, justifyContent: 'space-between', gap: 1 }}
        labelPlacement="start"
        label="Include Inquiry Questions in Registration"
        control={
          <Switch
            size="small"
            checked={enabled}
            disabled={formik.isSubmitting || Boolean(formik.values.inheritance?.sources.length)}
            onChange={(_, checked) => setEnabled(checked)}
          />
        }
      />
      {enabled && (
        <>
          <InquirySourcePicker />
          {!inheritance.initializingSources && !inheritance.canViewSources && (
            <Typography variant="caption" color="text.secondary">
              Form view permission is required to browse Inquiry forms. Saved Inquiry choices remain
              available.
            </Typography>
          )}
          {inheritance.connectionsLoading && (
            <LinearProgress aria-label="Loading Retained Inquiry Versions" />
          )}
          {inheritance.hasMoreConnections && (
            <Button
              size="small"
              variant="outlined"
              disabled={inheritance.connectionsLoading || formik.isSubmitting}
              onClick={inheritance.loadMoreConnections}
            >
              Load More Inquiry Versions
            </Button>
          )}
          {inheritance.loading && <LinearProgress aria-label="Checking Inquiry Questions" />}
          {inheritance.preview && !inheritance.loading && !inheritance.failed && (
            <>
              <Typography
                variant="caption"
                color={inheritance.preview.isValid ? 'success.main' : 'warning.main'}
                role="status"
              >
                {inheritance.preview.isValid
                  ? 'Questions Ready to Use'
                  : 'Review the Question Issues Before Allowing These Questions.'}
              </Typography>
              {inheritance.preview.issues.map((issue, index) => (
                <Typography key={`${issue.code}-${index}`} variant="caption" color="error.main">
                  {issue.message}
                </Typography>
              ))}
              {!inheritance.approved && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={
                    !inheritance.preview.isValid ||
                    inheritance.loading ||
                    inheritance.failed ||
                    inheritance.sourceFailed ||
                    formik.isSubmitting
                  }
                  onClick={inheritance.approve}
                >
                  Allow These Questions
                </Button>
              )}
              {inheritance.approved && inheritance.preview.isValid && (
                <Chip
                  size="small"
                  variant="outlined"
                  label="Allowed for Registration"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
            </>
          )}
          {needsRecovery && (
            <Stack spacing={1}>
              {inheritance.connectionsFailed && (
                <Typography variant="caption" color="error.main" role="alert">
                  Inquiry versions could not be loaded. Your saved choices are preserved.
                </Typography>
              )}
              {(inheritance.failed || inheritance.sourceFailed) && (
                <Typography variant="caption" color="error.main" role="alert">
                  Inquiry questions could not be checked. Your question adjustments are preserved.
                </Typography>
              )}
              <Button
                size="small"
                variant="outlined"
                disabled={!canCheck}
                onClick={inheritance.refresh}
              >
                Check Again
              </Button>
            </Stack>
          )}
          <Menu
            id="inquiry-question-options"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              disabled={!canCheck}
              onClick={() => {
                setMenuAnchor(null);
                inheritance.refresh();
              }}
            >
              Check Again
            </MenuItem>
            <MenuItem
              disabled={!selectedPolicy || !hasOverrides || formik.isSubmitting}
              onClick={() => {
                setMenuAnchor(null);
                setResetSourceId(selectedPolicy!.inquiryFormDefinitionId);
              }}
            >
              Reset Question Adjustments
            </MenuItem>
          </Menu>
          <ConfirmDialog
            open={Boolean(resetSourceId)}
            onClose={() => setResetSourceId(null)}
            title="Reset Question Adjustments"
            content="Remove this Inquiry form's Registration question matches and saved adjustments? Allowed forms, Inquiry questions, other forms and additional Registration questions are preserved."
            action={
              <Button
                size="small"
                variant="contained"
                disabled={formik.isSubmitting}
                onClick={() => {
                  if (resetSourceId)
                    formik.setFieldValue(
                      'inheritance',
                      resetInheritedSourceOverrides(formik.values, resetSourceId).inheritance
                    );
                  setResetSourceId(null);
                }}
              >
                Reset Adjustments
              </Button>
            }
          />
        </>
      )}
    </FormSectionCard>
  );
}
export { InheritedFormSections as InheritedFieldsCanvas } from './inherited-form-sections';

export function InheritedFieldDrawer() {
  const inheritance = useFormInheritance();
  const theme = useTheme();
  if (!inheritance) return null;
  return (
    <Drawer
      open={Boolean(inheritance.selectedField)}
      anchor="right"
      onClose={() => inheritance.selectField(null)}
      aria-labelledby="inherited-field-settings-title"
      sx={{ zIndex: theme.zIndex.modal }}
      slotProps={{ paper: { sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 } } }}
    >
      <Stack sx={{ height: 1, minHeight: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}>
          <Typography id="inherited-field-settings-title" variant="subtitle1">
            Inquiry Question Settings
          </Typography>
          <IconButton
            aria-label="Close Inherited Field Settings"
            onClick={() => inheritance.selectField(null)}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: 1.5 }}>
            {inheritance.selectedField && (
              <InheritedFieldSettings
                formik={inheritance.formik}
                field={inheritance.selectedField}
                sourceName={
                  inheritance.source
                    ? `${inheritance.source.name} · v${inheritance.source.version}`
                    : 'Source Inquiry'
                }
              />
            )}
          </Box>
        </Scrollbar>
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}
        >
          <Button size="small" variant="contained" onClick={() => inheritance.selectField(null)}>
            Done
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export function InheritedFieldSettings({
  formik,
  field,
  sourceName,
}: {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  field: AdmissionFormField;
  sourceName: string;
}) {
  const inheritance = useFormInheritance();
  const origin = field.inheritedFrom;
  if (!origin) return null;
  const policy = formik.values.inheritance?.sources.find(
    (source) => source.inquiryFormDefinitionId === origin.inquiryFormDefinitionId
  );
  const mappedTo =
    policy?.fieldMappings.find((item) => item.sourceFieldCode === origin.sourceFieldCode)
      ?.registrationFieldCode ?? '';
  const { required } = field;
  const capturedReference = field.readOnly && !origin.sourceReadOnly;
  const mappingCandidates =
    field.bindingType === 1
      ? formik.values.sections
          .flatMap((section) => section.fields)
          .filter(
            (candidate) => candidate.bindingType === 1 && candidate.fieldType === field.fieldType
          )
      : [];
  return (
    <Stack spacing={2}>
      {!policy && (
        <Typography variant="caption" color="text.secondary">
          Allow these questions before confirming a matching Registration question.
        </Typography>
      )}
      <FormSectionCard
        title="Source"
        icon="mdi:link-variant"
        descriptionTooltip="Inherited Definitions Are Managed in the Source Inquiry. Preview Opens Separately and Preserves This Draft."
      >
        <Typography variant="body2">{sourceName}</Typography>
        <Button
          component="a"
          href={`${studentPaths.enrollment.settings.forms}/${encodeURIComponent(origin.inquiryFormDefinitionId)}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          disabled={inheritance ? !inheritance.canViewSources : false}
          size="small"
          variant="outlined"
          endIcon={<Iconify icon="mdi:open-in-new" />}
        >
          Open Inquiry Form
        </Button>
        {inheritance && !inheritance.canViewSources && (
          <Typography variant="caption" color="text.secondary">
            Form view permission is required to open the source Inquiry.
          </Typography>
        )}
      </FormSectionCard>
      <FormSectionCard
        title="Basic Settings"
        icon="mdi:form-textbox"
        descriptionTooltip="Question Labels, Types, Options, Requirements, Rules and Placement Are Managed in Inquiry. Registration Applicants Can Correct Their Prefilled Answers."
      >
        <TextField label="Field Label" value={field.label} disabled fullWidth size="small" />
        <TextField
          label="Field Type"
          value={FIELD_TYPES.find(([, type]) => type === field.fieldType)?.[0] ?? 'Field'}
          disabled
          fullWidth
          size="small"
        />
        {!!field.optionsJson && (
          <Typography variant="caption" color="text.secondary">
            Answer options follow the source Inquiry.
          </Typography>
        )}
        <FormControlLabel
          labelPlacement="start"
          sx={{ m: 0, justifyContent: 'space-between', gap: 1 }}
          label="Required During Registration"
          control={<Switch size="small" checked={required} disabled />}
        />
        <Typography variant="caption" color="text.secondary">
          {capturedReference
            ? 'The Captured Inquiry Answer Is a Read-only Reference.'
            : required
              ? 'Required by the Source Inquiry.'
              : 'Optional in the Source Inquiry.'}
        </Typography>
      </FormSectionCard>
      {!!mappingCandidates.length && (
        <FormSectionCard
          title="Question Mapping"
          icon="mdi:link-variant"
          descriptionTooltip="Choose an Existing Registration Question Only When It Asks for the Same Information. Names Alone Do Not Establish a Match."
        >
          <CustomSelect
            label="Same Question in Registration"
            size="small"
            value={mappedTo}
            disabled={formik.isSubmitting || !policy}
            options={[
              { value: '', label: 'Keep as a Distinct Source Question' },
              ...mappingCandidates.map((candidate) => ({
                value: candidate.code,
                label: candidate.label,
              })),
            ]}
            onChange={(value) =>
              formik.setFieldValue(
                'inheritance',
                setInheritedFieldMapping(
                  formik.values,
                  origin.inquiryFormDefinitionId,
                  origin.sourceFieldCode,
                  String(value) || undefined,
                  origin.sourceFieldIdentity ?? origin.fieldIdentity
                ).inheritance
              )
            }
          />
        </FormSectionCard>
      )}
      <Button
        size="small"
        variant="outlined"
        disabled
        startIcon={<Iconify icon="mdi:lock-outline" />}
      >
        Delete Field
      </Button>
      <Typography variant="caption" color="text.secondary">
        Inherited fields are managed in Inquiry.
      </Typography>
    </Stack>
  );
}
