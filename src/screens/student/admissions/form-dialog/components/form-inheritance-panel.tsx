import type { FormikProps } from 'formik';
import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';
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
  CircularProgress,
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
  const [expanded, setExpanded] = useState(Boolean(inheritance?.enabled));
  const needsRecovery = Boolean(
    inheritance &&
    (inheritance.failed ||
      inheritance.sourceFailed ||
      inheritance.connectionsFailed ||
      (inheritance.preview && !inheritance.preview.isValid))
  );
  useEffect(() => {
    if (inheritance?.enabled || needsRecovery) setExpanded(true);
  }, [inheritance?.enabled, needsRecovery]);
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
  const canCheck = Boolean(
    (inheritance.sourceId || inheritance.connectionsFailed) &&
    !inheritance.loading &&
    !formik.isSubmitting
  );
  const checkedPreview =
    !inheritance.loading && !inheritance.failed ? inheritance.preview : undefined;
  return (
    <FormSectionCard
      title="Reuse Inquiry Questions"
      icon="mdi:link-variant"
      collapsible
      expanded={expanded}
      onExpandedChange={setExpanded}
      iconSize={16}
      iconContainerSize={28}
      titleTypographyProps={{ variant: 'subtitle2' }}
      sx={{ m: 1, p: 1.5, flexShrink: 0, minWidth: 0 }}
      contentSpacing={1}
    >
      <Stack direction="row" alignItems="center">
        <FormControlLabel
          sx={{ m: 0, gap: 0.5, flex: 1, justifyContent: 'space-between' }}
          labelPlacement="start"
          label="Include in Registration"
          control={
            <Switch
              size="small"
              checked={enabled}
              disabled={formik.isSubmitting}
              onChange={(_, checked) => setEnabled(checked)}
              sx={{
                '&& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: 'primary.main',
                },
              }}
            />
          }
        />
        <InfoTooltipIcon
          label="Reuse Inquiry Questions information"
          title="Applicants see questions from their linked Inquiry form. The offering and workflow determine which form is linked."
        />
      </Stack>
      {!enabled && Boolean(formik.values.inheritance?.sources.length) && (
        <Typography variant="caption" color="text.secondary">
          Approved Inquiry versions are kept if you turn reuse back on.
        </Typography>
      )}
      {enabled && (
        <>
          <Stack direction="row" gap={0.5} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <InquirySourcePicker />
            </Box>
            <CustomTooltip title="More Options">
              <IconButton
                size="small"
                aria-label="More Options"
                aria-haspopup="menu"
                aria-expanded={Boolean(menuAnchor)}
                aria-controls={menuAnchor ? 'inquiry-question-options' : undefined}
                disabled={formik.isSubmitting}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                sx={{ flexShrink: 0 }}
              >
                <Iconify icon="mdi:dots-vertical" />
              </IconButton>
            </CustomTooltip>
          </Stack>
          {inheritance.approved && checkedPreview?.isValid && (
            <Chip
              size="small"
              variant="outlined"
              color="success"
              role="status"
              label="Allowed for Registration"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          {!inheritance.initializingSources && !inheritance.canViewSources && (
            <Typography variant="caption" color="text.secondary">
              Form view permission is required to browse Inquiry forms. Saved Inquiry choices remain
              available.
            </Typography>
          )}
          {inheritance.connectionsLoading && !inheritance.hasMoreConnections && (
            <CircularProgress
              size={16}
              aria-label="Loading retained inquiry versions"
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
            />
          )}
          {inheritance.hasMoreConnections && (
            <Button
              size="small"
              variant="outlined"
              loading={inheritance.connectionsLoading}
              disabled={formik.isSubmitting}
              onClick={inheritance.loadMoreConnections}
            >
              Load More Inquiry Versions
            </Button>
          )}
          {inheritance.loading && (
            <CircularProgress
              size={16}
              aria-label="Checking inquiry questions"
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
            />
          )}
          {checkedPreview && (
            <>
              {!checkedPreview.isValid && (
                <Typography variant="caption" color="warning.main" role="status">
                  Review these issues before allowing the questions.
                </Typography>
              )}
              {checkedPreview.issues.map((issue, index) => (
                <Typography key={`${issue.code}-${index}`} variant="caption" color="error.main">
                  {issue.message}
                </Typography>
              ))}
              {!inheritance.approved && (
                <Button
                  size="small"
                  variant="contained"
                  disabled={
                    !checkedPreview.isValid ||
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
  const { closing, closeAfterExit, onExited, reopen } = useStudentDrawerExit();
  const fieldId = inheritance?.selectedField?.id;
  useEffect(() => {
    reopen();
  }, [fieldId, reopen]);

  if (!inheritance) return null;
  const requestClose = () => closeAfterExit(() => inheritance.selectField(null));

  return (
    <Drawer
      open={Boolean(inheritance.selectedField) && !closing}
      anchor="right"
      onClose={requestClose}
      onTransitionExited={onExited}
      sx={{ zIndex: theme.zIndex.modal }}
      slotProps={{
        paper: {
          'aria-labelledby': 'inherited-field-settings-title',
          inert: closing,
          sx: { width: { xs: 1, sm: 440 }, maxWidth: 1 },
        },
      }}
    >
      <Stack sx={{ height: 1, minHeight: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography id="inherited-field-settings-title" component="h2" variant="h6">
              Inquiry Question Settings
            </Typography>
            <InfoTooltipIcon
              label="Inquiry question settings information"
              title="Review this question from the source inquiry and link it to a matching registration question."
            />
          </Stack>
          <IconButton
            aria-label="Close Inherited Field Settings"
            onClick={requestClose}
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
          <Button size="small" variant="contained" onClick={requestClose}>
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
        descriptionTooltip="Inherited questions are managed in the source inquiry. Preview opens separately and preserves this draft."
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
          Open inquiry form
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
        descriptionTooltip="Manage question labels, types, options, requirements, rules and placement in the source inquiry. Applicants can correct prefilled answers during registration."
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
            ? 'The captured inquiry answer is a read-only reference.'
            : required
              ? 'Required by the source inquiry.'
              : 'Optional in the source inquiry.'}
        </Typography>
      </FormSectionCard>
      {!!mappingCandidates.length && (
        <FormSectionCard
          title="Question Mapping"
          icon="mdi:link-variant"
          descriptionTooltip="Choose an existing registration question only when it asks for the same information. Check the question itself before mapping it."
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
        Delete field
      </Button>
      <Typography variant="caption" color="text.secondary">
        Inherited fields are managed in Inquiry.
      </Typography>
    </Stack>
  );
}
