import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CSS } from '@dnd-kit/utilities';
import Switch from '@mui/material/Switch';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { useSortable } from '@dnd-kit/sortable';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getAdmissionLanguageLabel } from './form-languages';
import { FormBuilderUnitSettings } from './components/form-builder-unit-settings';
import { FormBuilderSectionHeader } from './components/form-builder-section-header';
import { FormBuilderSectionFields } from './components/form-builder-section-fields';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  sectionReorderEnabled?: boolean;
  showInlineAddField?: boolean;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSection({
  formik,
  sectionIndex,
  selectedSectionId,
  selectedFieldId,
  sectionReorderEnabled = true,
  showInlineAddField = true,
  onSelectSection,
  onSelectField,
}: Props) {
  const section = formik.values.sections[sectionIndex];
  const path = `sections[${sectionIndex}]`;
  const nameMeta = formik.getFieldMeta<string>(`${path}.name`);
  const codeMeta = formik.getFieldMeta<string>(`${path}.code`);
  const nameError = nameMeta.touched ? nameMeta.error : undefined;
  const codeError = codeMeta.touched ? codeMeta.error : undefined;
  const selected = selectedSectionId === section.id;
  const settings = useBoolean();
  const settingsOpen = settings.value || Boolean(nameError || codeError);
  const updateValue = (key: 'name' | 'code' | 'visibilityRuleJson', value: string | undefined) => {
    settings.onTrue();
    formik.setFieldValue(`${path}.${key}`, value);
  };
  const sortable = useSortable({ id: `section:${section.id}`, disabled: !sectionReorderEnabled });
  const removeSection = () =>
    formik.setFieldValue(
      'sections',
      formik.values.sections.filter((_, index) => index !== sectionIndex)
    );

  return (
    <Card
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.65 : 1,
      }}
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        overflow: 'visible',
        borderColor: selected ? 'text.primary' : 'divider',
      }}
    >
      <FormBuilderSectionHeader
        section={section}
        sectionIndex={sectionIndex}
        selected={selected}
        settingsOpen={settingsOpen}
        reorderEnabled={sectionReorderEnabled}
        sortable={sortable}
        onSelect={() => onSelectSection(section.id)}
        onToggleSettings={settings.onToggle}
        onDelete={removeSection}
      />
      <Collapse in={settingsOpen}>
        <FormBuilderUnitSettings
          id={`section-settings-${section.id}`}
          unit="Section"
          name={section.name}
          code={section.code}
          visibilityRule={section.visibilityRuleJson}
          nameError={nameError}
          codeError={codeError}
          onNameBlur={() => formik.setFieldTouched(`${path}.name`, true)}
          onCodeBlur={() => formik.setFieldTouched(`${path}.code`, true)}
          onNameChange={(value) => updateValue('name', value)}
          onCodeChange={(value) => updateValue('code', value)}
          onVisibilityChange={(value) => updateValue('visibilityRuleJson', value || undefined)}
        />
        <Stack spacing={1.5} sx={{ px: 1.5, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <FormControlLabel
            labelPlacement="start"
            sx={{ m: 0, justifyContent: 'space-between', gap: 1 }}
            control={
              <Switch
                size="small"
                checked={Boolean(section.isRepeatable)}
                onChange={(event) => {
                  formik.setFieldValue(`${path}.isRepeatable`, event.target.checked);
                  if (!event.target.checked) {
                    formik.setFieldValue(`${path}.minEntries`, 1);
                    formik.setFieldValue(`${path}.maxEntries`, 1);
                  }
                }}
              />
            }
            label={
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  Allow multiple entries
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Useful for siblings, guardians, previous schools, or medical records.
                </Typography>
              </Stack>
            }
          />
          {section.isRepeatable && (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Minimum entries"
                  value={section.minEntries ?? 0}
                  slotProps={{ htmlInput: { min: 0, max: 25 } }}
                  onChange={(event) =>
                    formik.setFieldValue(`${path}.minEntries`, Number(event.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Maximum entries"
                  value={section.maxEntries ?? 1}
                  slotProps={{ htmlInput: { min: 1, max: 25 } }}
                  onChange={(event) =>
                    formik.setFieldValue(`${path}.maxEntries`, Number(event.target.value))
                  }
                />
              </Stack>
              <TextField
                fullWidth
                size="small"
                label="Entry label"
                placeholder="e.g. Sibling"
                value={section.entryLabel ?? ''}
                helperText="Applicants see Add sibling, Sibling 1, Sibling 2, and so on."
                onChange={(event) =>
                  formik.setFieldValue(`${path}.entryLabel`, event.target.value || undefined)
                }
              />
            </>
          )}
          {formik.values.supportedLanguages
            .filter((language) => language !== formik.values.defaultLanguage)
            .map((language) => (
              <TextField
                key={language}
                fullWidth
                size="small"
                label={`${getAdmissionLanguageLabel(language)} section name`}
                value={section.translations?.[language]?.label ?? ''}
                onChange={(event) =>
                  formik.setFieldValue(`${path}.translations.${language}.label`, event.target.value)
                }
              />
            ))}
        </Stack>
      </Collapse>
      <FormBuilderSectionFields
        formik={formik}
        sectionIndex={sectionIndex}
        selectedFieldId={selectedFieldId}
        showInlineAddField={showInlineAddField}
        onSelectField={onSelectField}
      />
    </Card>
  );
}
