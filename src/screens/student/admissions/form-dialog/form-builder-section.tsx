import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Card from '@mui/material/Card';
import { CSS } from '@dnd-kit/utilities';
import Collapse from '@mui/material/Collapse';
import { useSortable } from '@dnd-kit/sortable';
import { useBoolean } from 'src/hooks/use-boolean';

import { FormBuilderUnitSettings } from './components/form-builder-unit-settings';
import { FormBuilderSectionHeader } from './components/form-builder-section-header';
import { FormBuilderSectionFields } from './components/form-builder-section-fields';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  canDelete?: boolean;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSection({
  formik,
  sectionIndex,
  selectedSectionId,
  selectedFieldId,
  canDelete = formik.values.sections.length > 1,
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
  const sortable = useSortable({ id: `section:${section.id}` });
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
        borderColor: selected ? 'primary.main' : 'divider',
      }}
    >
      <FormBuilderSectionHeader
        section={section}
        sectionIndex={sectionIndex}
        selected={selected}
        canDelete={canDelete}
        settingsOpen={settingsOpen}
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
          onVisibilityChange={(value) =>
            updateValue('visibilityRuleJson', value || undefined)
          }
        />
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
