import type { FormikProps } from 'formik';
import type {
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CSS } from '@dnd-kit/utilities';
import { useRef, useEffect } from 'react';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { useSortable } from '@dnd-kit/sortable';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';

import { getAdmissionLanguageLabel } from './form-languages';
import { hasLockedInquiryFields } from './inquiry-default-fields';
import { FormBuilderSectionHeader } from './components/form-builder-section-header';
import { FormBuilderSectionFields } from './components/form-builder-section-fields';

import type { BuilderNavigationRequest } from './types/builder-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  sectionReorderEnabled?: boolean;
  displaySection?: AdmissionFormSection;
  readOnly?: boolean;
  navigationRequest?: BuilderNavigationRequest;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (fieldId: string) => void;
};

export function FormBuilderSection({
  formik,
  sectionIndex,
  selectedSectionId,
  selectedFieldId,
  sectionReorderEnabled = true,
  displaySection,
  readOnly = false,
  navigationRequest,
  onSelectSection,
  onSelectField,
}: Props) {
  const section = displaySection ?? formik.values.sections[sectionIndex];
  const path = `sections[${sectionIndex}]`;
  const nameMeta = formik.getFieldMeta<string>(`${path}.name`);
  const nameError = !readOnly && nameMeta.touched ? nameMeta.error : undefined;
  const selected = selectedSectionId === section.id;
  const settings = useBoolean();
  const expansion = useBoolean(true);
  const { onTrue: expand } = expansion;
  const { onTrue: openSettings } = settings;
  const settingsOpen = settings.value || Boolean(nameError);
  const expanded =
    expansion.value ||
    settingsOpen ||
    (formik.submitCount > 0 && Boolean(formik.errors.sections?.[sectionIndex]));
  const previousFieldCount = useRef(section.fields.length);
  useEffect(() => {
    if (section.fields.length > previousFieldCount.current) expand();
    previousFieldCount.current = section.fields.length;
  }, [expand, section.fields.length]);
  useEffect(() => {
    const target = navigationRequest?.target;
    if (!target || target.kind === 'form' || target.sectionId !== section.id) return undefined;
    expand();
    const editHeading =
      target.kind === 'section' && target.settingPath?.endsWith('.name') && !readOnly;
    if (editHeading) openSettings();
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(
        target.kind === 'field'
          ? `field-select-${target.fieldId}`
          : editHeading
            ? `section-heading-${section.id}`
            : `section-select-${section.id}`
      );
      element?.scrollIntoView?.({ block: 'nearest' });
      // Field issues focus their actual repair control in the settings drawer.
      if (target.kind === 'section') element?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [navigationRequest, section.id, expand, openSettings, readOnly]);
  const contentId = `section-content-${section.id}`;
  const sortable = useSortable({
    id: `section:${section.id}`,
    disabled: readOnly || !sectionReorderEnabled,
  });
  const deleteDisabled = hasLockedInquiryFields(formik.values.purpose, [section]);
  const removeSection = () => {
    if (deleteDisabled) return;
    formik.setFieldValue(
      'sections',
      formik.values.sections.filter((_, index) => index !== sectionIndex)
    );
  };

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
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
        '& > .MuiAccordion-root, & > .MuiAccordion-root.Mui-expanded': {
          m: 0,
          borderRadius: 'inherit',
          color: 'text.primary',
          boxShadow: 'none',
        },
        '& .MuiAccordionDetails-root': { p: 0 },
      }}
    >
      <CustomAccordion
        title={section.name || `Section ${sectionIndex + 1}`}
        expanded={expanded}
        summary={
          <Box
            id={`section-header-${section.id}`}
            aria-controls={contentId}
            sx={{ borderRadius: 'inherit' }}
          >
            <FormBuilderSectionHeader
              section={section}
              sectionIndex={sectionIndex}
              selected={selected}
              settingsOpen={settingsOpen}
              expanded={expanded}
              contentId={contentId}
              readOnly={readOnly}
              deleteDisabled={deleteDisabled}
              onToggleExpanded={() => {
                if (settingsOpen) settings.onFalse();
                expansion.setValue(!expanded);
              }}
              reorderEnabled={!readOnly && sectionReorderEnabled}
              sortable={sortable}
              onSelect={() => {
                expand();
                onSelectSection(section.id);
              }}
              onToggleSettings={() => {
                expand();
                settings.onToggle();
              }}
              nameError={nameError}
              onNameBlur={() => formik.setFieldTouched(`${path}.name`, true)}
              onNameChange={(value) => {
                settings.onTrue();
                formik.setFieldValue(`${path}.name`, value);
              }}
              onDelete={removeSection}
            />
          </Box>
        }
        content={
          <Box>
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
                        formik.setFieldValue(
                          `${path}.translations.${language}.label`,
                          event.target.value
                        )
                      }
                    />
                  ))}
              </Stack>
            </Collapse>
            <FormBuilderSectionFields
              formik={formik}
              sectionIndex={sectionIndex}
              displaySection={section}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
            />
          </Box>
        }
      />
    </Card>
  );
}
