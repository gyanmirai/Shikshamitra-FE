import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CSS } from '@dnd-kit/utilities';
import Tooltip from '@mui/material/Tooltip';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

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
  const name = field.label || `Field ${fieldIndex + 1}`;
  const sortable = useSortable({
    id: `field:${formik.values.sections[sectionIndex].id}:${field.id}`,
  });
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
        borderRadius: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ p: 0.5 }}>
        <Tooltip title="Drag to reorder. With a keyboard, press Space, then arrow keys.">
          <IconButton
            ref={sortable.setActivatorNodeRef}
            {...sortable.attributes}
            {...sortable.listeners}
            aria-label={`Reorder ${name}`}
            sx={{ width: 44, height: 44, flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
          >
            <Iconify icon="mdi:drag-vertical" width={20} />
          </IconButton>
        </Tooltip>
        <ButtonBase
          onClick={onSelect}
          aria-label={`Edit ${name} field`}
          aria-pressed={selected}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 52,
            textAlign: 'left',
            justifyContent: 'flex-start',
            borderRadius: 1,
            gap: 1,
            '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 1 },
          }}
        >
          <Iconify
            icon={fieldTypeIcon(field.fieldType)}
            width={20}
            sx={{ flexShrink: 0, color: selected ? 'primary.main' : 'text.secondary' }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {name}
              {field.required && (
                <Box component="span" sx={{ color: 'error.main', ml: 0.5 }} aria-label="required">
                  *
                </Box>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fieldType} · {field.bindingType === 0 ? 'Student field' : 'Custom field'}
              {selected ? ' · Editing' : ''}
            </Typography>
          </Box>
          <Iconify
            icon={selected ? 'mdi:pencil-outline' : 'mdi:chevron-right'}
            width={18}
            sx={{ flexShrink: 0, color: selected ? 'primary.main' : 'text.disabled' }}
          />
        </ButtonBase>
        <Tooltip title={`Delete ${name}`}>
          <IconButton
            aria-label={`Delete ${name}`}
            onClick={onDelete}
            sx={{ width: 44, height: 44, flexShrink: 0, color: 'text.secondary' }}
          >
            <Iconify icon="mdi:delete-outline" width={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}
