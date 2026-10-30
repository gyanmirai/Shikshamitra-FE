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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Box,
  Chip,
  Stack,
  Button,
  Drawer,
  Switch,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { FIELD_TYPES } from '../form-dialog-model';
import { FormBuilderField } from '../form-builder-field';
import { useFormInheritance } from '../hooks/use-form-inheritance';
import { AdmissionDefinitionSelect } from '../../admission-definition-select';
import {
  getInheritedFields,
  setInheritedFieldLayout,
  setInheritedFieldMapping,
  setInheritedFieldRequired,
  resetInheritedSourceOverrides,
} from '../form-inheritance-model';

export function FormInheritancePanel() {
  const inheritance = useFormInheritance();
  const [resetSourceId, setResetSourceId] = useState<string | null>(null);
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
  return (
    <FormSectionCard
      title="Connected Inquiry Forms"
      icon="mdi:link-variant"
      descriptionTooltip="Inquiry fields follow the applicant's linked form. Offering and workflow setup control the actual connections."
      sx={{ m: 1, flexShrink: 0 }}
      contentSpacing={1.5}
    >
      <FormControlLabel
        sx={{ m: 0, justifyContent: 'space-between', gap: 1 }}
        labelPlacement="start"
        label="Include source Inquiry fields"
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
          {inheritance.canViewSources ? (
            <AdmissionDefinitionSelect
              label="Preview source Inquiry"
              valueId={inheritance.sourceId}
              initialOption={
                inheritance.source
                  ? {
                      id: inheritance.source.id,
                      name: inheritance.source.name,
                      version: inheritance.source.version,
                    }
                  : null
              }
              fetchOptions={inheritance.fetchSources}
              onChange={inheritance.selectSource}
              disabled={formik.isSubmitting || inheritance.sourceLoading}
              error={inheritance.sourceFailed}
              noOptionsText="No published Inquiry forms found"
              helperText={
                inheritance.sourceFailed
                  ? 'Source information is unavailable. Existing draft settings are preserved.'
                  : undefined
              }
            />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary">
                Viewing Inquiry definitions and connection details requires form view permission.
                Saved source configuration remains available for review.
              </Typography>
              {!!formik.values.inheritance?.sources.length && (
                <CustomSelect
                  label="Saved Inquiry source"
                  size="small"
                  value={inheritance.sourceId ?? ''}
                  options={formik.values.inheritance.sources.map((source, index) => ({
                    value: source.inquiryFormDefinitionId,
                    label: `Saved Inquiry ${index + 1}`,
                  }))}
                  onChange={(value) => inheritance.selectSource(String(value))}
                />
              )}
            </>
          )}
          {inheritance.connected.slice(0, 3).map((source) => (
            <Stack key={source.inquiryFormDefinitionId} spacing={0.25}>
              <Button
                size="small"
                color="inherit"
                onClick={() => inheritance.selectSource(source.inquiryFormDefinitionId)}
                sx={{ justifyContent: 'flex-start', p: 0 }}
                aria-label={`Preview ${source.name} version ${source.version}`}
              >
                {source.name} · v{source.version}
              </Button>
              {!!source.connections.length && (
                <Typography variant="caption" color="text.secondary">
                  {source.connections.map((connection) => connection.offeringName).join(', ')}
                </Typography>
              )}
            </Stack>
          ))}
          {inheritance.connected.length > 3 && (
            <CustomSelect
              size="small"
              label="Connected Inquiry version"
              value={
                inheritance.connected.some(
                  (source) => source.inquiryFormDefinitionId === inheritance.sourceId
                )
                  ? (inheritance.sourceId ?? '')
                  : ''
              }
              options={[
                { value: '', label: 'Choose a connected version' },
                ...inheritance.connected.map((source) => ({
                  value: source.inquiryFormDefinitionId,
                  label: `${source.name} · v${source.version}`,
                })),
              ]}
              onChange={(value) => {
                if (value) inheritance.selectSource(String(value));
              }}
              disabled={formik.isSubmitting}
            />
          )}
          {inheritance.connectionsLoading && (
            <LinearProgress aria-label="Loading connected Inquiry versions" />
          )}
          {inheritance.hasMoreConnections && (
            <Button
              size="small"
              variant="outlined"
              disabled={inheritance.connectionsLoading || formik.isSubmitting}
              onClick={inheritance.loadMoreConnections}
            >
              Load more connected forms
            </Button>
          )}
          {!inheritance.sourceId && (
            <Typography variant="caption" color="text.secondary">
              Choose a published Inquiry to review its fields. This preview does not change
              admission routing.
            </Typography>
          )}
          {inheritance.loading && (
            <LinearProgress aria-label="Checking Inquiry field compatibility" />
          )}
          {inheritance.preview && (
            <>
              <Typography
                variant="caption"
                color={inheritance.preview.isValid ? 'text.secondary' : 'warning.main'}
                role="status"
              >
                {inheritance.preview.isValid
                  ? `${getInheritedFields(inheritance.preview.definition).length} inherited fields · Source labels preserved`
                  : 'Resolve the field compatibility issues before approving this source.'}
              </Typography>
              {inheritance.preview.issues.map((issue, index) => (
                <Typography key={`${issue.code}-${index}`} variant="caption" color="error.main">
                  {issue.message}
                </Typography>
              ))}
              {!inheritance.approved && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={
                    !inheritance.preview.isValid ||
                    inheritance.loading ||
                    inheritance.failed ||
                    inheritance.sourceFailed ||
                    formik.isSubmitting
                  }
                  onClick={inheritance.approve}
                >
                  Approve source version
                </Button>
              )}
              {inheritance.approved && inheritance.preview.isValid && (
                <Chip
                  size="small"
                  variant="outlined"
                  label="Source version approved"
                  sx={{ alignSelf: 'flex-start' }}
                />
              )}
            </>
          )}
          <Button
            size="small"
            variant="outlined"
            disabled={!inheritance.sourceId || inheritance.loading || formik.isSubmitting}
            onClick={inheritance.refresh}
          >
            Review compatibility
          </Button>
          {selectedPolicy && (
            <Button
              size="small"
              variant="outlined"
              disabled={!hasOverrides || formik.isSubmitting}
              onClick={() => setResetSourceId(selectedPolicy.inquiryFormDefinitionId)}
            >
              Reset source overrides
            </Button>
          )}
          <ConfirmDialog
            open={Boolean(resetSourceId)}
            onClose={() => setResetSourceId(null)}
            title="Reset Source Overrides"
            content="Remove this source’s Registration-specific question mappings, placement and extra required settings? The source approval, Inquiry fields, other sources and base Registration questions are preserved."
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
                Reset overrides
              </Button>
            }
          />
        </>
      )}
    </FormSectionCard>
  );
}

export function InheritedFieldsCanvas() {
  const inheritance = useFormInheritance();
  const fields = getInheritedFields(inheritance?.preview?.definition);
  if (!inheritance?.enabled || !fields.length) return null;
  // Existing base slots are rendered in the normal canvas, decorated with the same source identity.
  const fieldsWithoutBaseSlot = fields.filter(
    (field) =>
      !inheritance.formik.values.sections.some((section) =>
        section.fields.some(
          (base) =>
            (base.bindingType === 0 &&
              field.bindingType === 0 &&
              Boolean(base.bindingKey) &&
              base.bindingKey?.toLowerCase() === field.bindingKey?.toLowerCase()) ||
            Boolean(base.fieldIdentity && base.fieldIdentity === field.fieldIdentity)
        )
      )
  );
  if (!fieldsWithoutBaseSlot.length) return null;
  const previewFormik = {
    ...inheritance.formik,
    values: {
      ...inheritance.formik.values,
      sections: [
        {
          id: 'inherited-preview',
          code: 'INHERITED_PREVIEW',
          name: 'Inherited Inquiry Fields',
          displayOrder: 0,
          fields: fieldsWithoutBaseSlot,
        },
      ],
    },
  };
  return (
    <FormSectionCard
      title="Inherited Inquiry Fields"
      icon="mdi:link-variant"
      descriptionTooltip="These fields use the applicant's source Inquiry labels, types and options. Only Registration requiredness and compatible placement can be adjusted."
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {fieldsWithoutBaseSlot.map((field, fieldIndex) => (
          <FormBuilderField
            key={field.code}
            formik={previewFormik}
            sectionIndex={0}
            fieldIndex={fieldIndex}
            selected={
              inheritance.selectedField?.inheritedFrom?.fieldIdentity ===
              field.inheritedFrom?.fieldIdentity
            }
            onSelect={() => inheritance.selectField(field)}
            onDelete={() => undefined}
            reorderEnabled={false}
          />
        ))}
      </Box>
    </FormSectionCard>
  );
}

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
            Inherited Field Settings
          </Typography>
          <IconButton
            aria-label="Close inherited field settings"
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
  const layout = policy?.layouts.find((item) => item.fieldIdentity === origin.fieldIdentity);
  const mappedTo =
    policy?.fieldMappings.find((item) => item.sourceFieldCode === origin.sourceFieldCode)
      ?.registrationFieldCode ?? '';
  const baseFields = formik.values.sections.flatMap((section) => section.fields);
  const baseSlot = baseFields.find((candidate) =>
    Boolean(
      (field.bindingType === 0 &&
        candidate.bindingType === 0 &&
        field.bindingKey &&
        candidate.bindingKey?.toLowerCase() === field.bindingKey.toLowerCase()) ||
      (field.fieldIdentity && candidate.fieldIdentity === field.fieldIdentity) ||
      (mappedTo && candidate.code === mappedTo)
    )
  );
  const baseRequired = Boolean(baseSlot?.required);
  const required = Boolean(
    origin.sourceRequired ||
    baseRequired ||
    policy?.requiredFieldIdentities.includes(origin.fieldIdentity)
  );
  const mappingCandidates =
    field.bindingType === 1
      ? formik.values.sections
          .flatMap((section) => section.fields)
          .filter(
            (candidate) => candidate.bindingType === 1 && candidate.fieldType === field.fieldType
          )
      : [];
  const updateRequired = (checked: boolean) => {
    if (policy)
      formik.setFieldValue(
        'inheritance',
        setInheritedFieldRequired(
          formik.values,
          origin.inquiryFormDefinitionId,
          origin.fieldIdentity,
          checked
        ).inheritance
      );
  };
  const updateLayout = (value: { targetSectionCode?: string; displayOrder?: number }) => {
    if (policy)
      formik.setFieldValue(
        'inheritance',
        setInheritedFieldLayout(
          formik.values,
          origin.inquiryFormDefinitionId,
          origin.fieldIdentity,
          value
        ).inheritance
      );
  };
  return (
    <Stack spacing={2}>
      {!policy && (
        <Typography variant="caption" color="text.secondary">
          Approve this source version before changing Registration settings.
        </Typography>
      )}
      <FormSectionCard
        title="Source"
        icon="mdi:link-variant"
        descriptionTooltip="Inherited definitions are managed in the source Inquiry. Preview opens separately and preserves this draft."
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
          Open Inquiry form
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
        descriptionTooltip="Keep the source label, type and answer options. Registration may strengthen an optional requirement."
      >
        <TextField label="Field label" value={field.label} disabled fullWidth size="small" />
        <TextField
          label="Field type"
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
          label="Required during Registration"
          control={
            <Switch
              size="small"
              checked={required}
              disabled={
                formik.isSubmitting ||
                !policy ||
                origin.sourceRequired ||
                baseRequired ||
                origin.sourceReadOnly
              }
              onChange={(_, checked) => updateRequired(checked)}
            />
          }
        />
        <Typography variant="caption" color="text.secondary">
          {origin.sourceRequired
            ? 'Required by the source Inquiry.'
            : baseRequired
              ? 'Required by the Registration definition.'
              : origin.sourceReadOnly
                ? 'This source field is read-only.'
                : field.requiredRuleJson
                  ? 'Existing conditional requirements remain in effect.'
                  : 'Optional in Inquiry. Registration can require an answer.'}
        </Typography>
      </FormSectionCard>
      {!!mappingCandidates.length && (
        <FormSectionCard
          title="Question Mapping"
          icon="mdi:link-variant"
          descriptionTooltip="Choose an existing Registration question only when it asks for the same information. Names alone do not establish a match."
        >
          <CustomSelect
            label="Same question in Registration"
            size="small"
            value={mappedTo}
            disabled={formik.isSubmitting}
            options={[
              { value: '', label: 'Keep as a distinct source question' },
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
      <FormSectionCard
        title="Layout"
        icon="mdi:view-grid-outline"
        descriptionTooltip="Choose compatible placement for this source. Visibility and repeatable structure remain controlled by Inquiry."
      >
        <CustomSelect
          label="Section"
          size="small"
          value={layout?.targetSectionCode ?? ''}
          disabled={formik.isSubmitting || !policy}
          options={[
            { value: '', label: 'Keep source section' },
            ...formik.values.sections.map((section) => ({
              value: section.code,
              label: section.name,
            })),
          ]}
          onChange={(value) =>
            updateLayout({
              targetSectionCode: String(value) || undefined,
              displayOrder: layout?.displayOrder ?? undefined,
            })
          }
        />
        <TextField
          label="Field order"
          type="number"
          size="small"
          value={layout?.displayOrder ?? field.displayOrder}
          disabled={formik.isSubmitting || !policy}
          inputProps={{ min: 0, step: 1 }}
          onChange={(event) => {
            const order = Number(event.target.value);
            if (event.target.value !== '' && Number.isInteger(order) && order >= 0)
              updateLayout({
                targetSectionCode: layout?.targetSectionCode ?? undefined,
                displayOrder: order,
              });
          }}
        />
      </FormSectionCard>
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
