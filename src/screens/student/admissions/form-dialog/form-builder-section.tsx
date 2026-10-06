import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CSS } from '@dnd-kit/utilities';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { useSortable } from '@dnd-kit/sortable';
import { useBoolean } from 'src/hooks/use-boolean';

import { getAdmissionLanguageLabel } from './form-languages';
import { FormBuilderSectionHeader } from './components/form-builder-section-header';
import { FormBuilderSectionFields } from './components/form-builder-section-fields';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  sectionReorderEnabled?: boolean;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSection({
  formik,
  sectionIndex,
  selectedSectionId,
  selectedFieldId,
  sectionReorderEnabled = true,
  onSelectSection,
  onSelectField,
}: Props) {
  const section = formik.values.sections[sectionIndex];
  const path = `sections[${sectionIndex}]`;
  const nameMeta = formik.getFieldMeta<string>(`${path}.name`);
  const nameError = nameMeta.touched ? nameMeta.error : undefined;
  const selected = selectedSectionId === section.id;
  const settings = useBoolean();
  const settingsOpen = settings.value || Boolean(nameError);
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
      sx={{ borderRadius: 2, overflow: 'visible', borderColor: 'divider' }}
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
        nameError={nameError}
        onNameBlur={() => formik.setFieldTouched(`${path}.name`, true)}
        onNameChange={(value) => {
          settings.onTrue();
          formik.setFieldValue(`${path}.name`, value);
        }}
        onDelete={removeSection}
      />
      <Collapse in={settingsOpen}>
        <Stack spacing={1} sx={{ px: 2, pb: 1 }}>
          {formik.values.supportedLanguages
            .filter((language) => language !== formik.values.defaultLanguage)
            .map((language) => (
              <TextField
                key={language}
                fullWidth
                size="small"
                label={`${getAdmissionLanguageLabel(language)} section heading`}
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
        onSelectField={onSelectField}
      />
    </Card>
  );
}
