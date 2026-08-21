import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { CSS } from '@dnd-kit/utilities';
import { Iconify } from 'src/components/iconify';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Accordion,
  TextField,
  IconButton,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { FormBuilderField } from './form-builder-field';
import { newField, nextFieldOrder } from './form-dialog-model';

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
  const selected = selectedSectionId === section.id;
  const unitLabel = 'Section';
  const sortable = useSortable({ id: `section:${section.id}` });
  const sectionStyle = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.65 : 1,
  };
  const removeSection = () =>
    formik.setFieldValue(
      'sections',
      formik.values.sections.filter((_, index) => index !== sectionIndex)
    );
  const removeField = (fieldIndex: number) =>
    formik.setFieldValue(
      `sections[${sectionIndex}].fields`,
      section.fields.filter((_, index) => index !== fieldIndex)
    );
  const addField = () => {
    const field = newField(section.id, nextFieldOrder(formik.values.sections));
    formik.setFieldValue(`sections[${sectionIndex}].fields`, [...section.fields, field]);
    onSelectField(field.id);
  };

  return (
    <Card
      ref={sortable.setNodeRef}
      style={sectionStyle}
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'visible',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          px: 1.25,
          py: 1,
          bgcolor: 'background.neutral',
          borderBottom: 1,
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
        }}
        onClick={() => onSelectSection(section.id)}
      >
        <IconButton
          size="small"
          aria-label={`Reorder ${section.name}`}
          {...sortable.attributes}
          {...sortable.listeners}
          onClick={(event) => event.stopPropagation()}
        >
          <Iconify icon="mdi:drag-vertical" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {section.name || `${unitLabel} ${sectionIndex + 1}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unitLabel} {sectionIndex + 1}
          </Typography>
        </Box>
        <Chip
          size="small"
          variant="outlined"
          label={`${section.fields.length} ${section.fields.length === 1 ? 'field' : 'fields'}`}
        />
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${section.name}`}
          disabled={!canDelete}
          onClick={(event) => {
            event.stopPropagation();
            removeSection();
          }}
        >
          <Iconify icon="mdi:delete-outline" />
        </IconButton>
      </Stack>
      <Stack spacing={1.25} sx={{ p: 1.5 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label={`${unitLabel} code *`}
              value={section.code}
              onChange={(event) =>
                formik.setFieldValue(
                  `sections[${sectionIndex}].code`,
                  event.target.value.toUpperCase()
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              label={`${unitLabel} name *`}
              value={section.name}
              onChange={(event) =>
                formik.setFieldValue(`sections[${sectionIndex}].name`, event.target.value)
              }
            />
          </Grid>
        </Grid>
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '8px !important',
            '&::before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="mdi:chevron-down" />}
            aria-controls={`section-rules-${section.id}`}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {unitLabel} visibility
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Optional rule for showing this entire {unitLabel.toLowerCase()}.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails id={`section-rules-${section.id}`}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Visibility rule JSON"
              value={section.visibilityRuleJson ?? ''}
              placeholder='{"operator":"ALL","conditions":[]}'
              helperText="Leave empty to always show this section."
              onChange={(event) =>
                formik.setFieldValue(
                  `sections[${sectionIndex}].visibilityRuleJson`,
                  event.target.value || undefined
                )
              }
            />
          </AccordionDetails>
        </Accordion>
        <SortableContext
          items={section.fields.map((field) => `field:${section.id}:${field.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {section.fields.map((field, fieldIndex) => (
            <FormBuilderField
              key={field.id}
              formik={formik}
              sectionIndex={sectionIndex}
              fieldIndex={fieldIndex}
              selected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onDelete={() => removeField(fieldIndex)}
            />
          ))}
        </SortableContext>
        {!section.fields.length && (
          <Box
            sx={{
              py: 3,
              px: 2,
              textAlign: 'center',
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              This {unitLabel.toLowerCase()} has no fields yet.
            </Typography>
          </Box>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={addField}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add custom field
        </Button>
      </Stack>
    </Card>
  );
}
