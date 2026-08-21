import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import { Card, Chip, Stack, IconButton, Typography } from '@mui/material';

import { FIELD_TYPES, fieldTypeIcon } from './form-dialog-model';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  fieldIndex: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function FormBuilderField({
  formik,
  sectionIndex,
  fieldIndex,
  selected,
  onSelect,
  onDelete,
}: Props) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const fieldType = FIELD_TYPES.find(([, value]) => value === field.fieldType)?.[0] ?? 'Field';
  const sortable = useSortable({
    id: `field:${formik.values.sections[sectionIndex].id}:${field.id}`,
  });
  return (
    <Card
      ref={sortable.setNodeRef}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.65 : 1,
      }}
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        cursor: 'pointer',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        '&:hover': { borderColor: 'primary.main' },
        '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          size="small"
          aria-label={`Reorder ${field.label || 'field'}`}
          {...sortable.attributes}
          {...sortable.listeners}
          onClick={(event) => event.stopPropagation()}
        >
          <Iconify icon="mdi:drag-vertical" />
        </IconButton>
        <Iconify
          icon={fieldTypeIcon(field.fieldType)}
          width={22}
          sx={{ color: selected ? 'primary.main' : 'text.secondary', flexShrink: 0 }}
        />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {field.label || `Field ${fieldIndex + 1}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {field.code} · {fieldType} · {field.required ? 'Required' : 'Optional'}
          </Typography>
        </Stack>
        <Chip
          size="small"
          variant="outlined"
          label={field.bindingType === 0 ? 'Student' : 'Custom'}
        />
        {selected && <Iconify icon="mdi:check-circle" width={20} sx={{ color: 'primary.main' }} />}
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${field.label || 'field'}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Iconify icon="mdi:delete-outline" />
        </IconButton>
      </Stack>
    </Card>
  );
}
