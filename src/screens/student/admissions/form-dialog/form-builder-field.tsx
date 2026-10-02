import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';

import { FIELD_TYPES } from './form-dialog-model';

function fieldPrompt(fieldType: number, label: string, placeholder?: string | null) {
  if (placeholder) return placeholder;
  if (fieldType === 5) return 'DD / MM / YYYY';
  if ([6, 7].includes(fieldType)) return `Select ${label.toLowerCase()}`;
  if (fieldType === 8) return 'Choose one option';
  if (fieldType === 9) return 'Select if applicable';
  if (fieldType === 10) return 'Choose a file';
  if (fieldType === 11) return 'Enter address details';
  if (fieldType === 12) return 'Information shown to applicants';
  return `Enter ${label.toLowerCase()}`;
}

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
  const compactFourColumnCard = formik.values.fieldsPerRow === 4;
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
        minWidth: 0,
        gridColumn: field.fieldType === 1 ? '1 / -1' : undefined,
        borderRadius: 1.5,
        borderColor: selected ? 'success.main' : 'divider',
        bgcolor: 'background.paper',
        '&:hover': { borderColor: selected ? 'success.main' : 'text.secondary' },
      }}
    >
      <Stack
        direction={{ xs: 'row', lg: compactFourColumnCard ? 'column' : 'row', xl: 'row' }}
        alignItems="flex-start"
        sx={{ p: 0.75, position: 'relative' }}
      >
        <CustomTooltip title="Drag to reorder. With a keyboard, press Space, then arrow keys.">
          <IconButton
            ref={sortable.setActivatorNodeRef}
            {...sortable.attributes}
            {...sortable.listeners}
            aria-label={`Reorder ${name}`}
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              cursor: 'grab',
              touchAction: 'none',
              position: { lg: compactFourColumnCard ? 'absolute' : 'static', xl: 'static' },
              top: 6,
              left: 6,
              zIndex: 1,
            }}
          >
            <Iconify icon="mdi:drag-vertical" width={20} />
          </IconButton>
        </CustomTooltip>
        <ButtonBase
          onClick={onSelect}
          aria-label={`Edit ${name} field`}
          aria-pressed={selected}
          sx={{
            flex: 1,
            minWidth: 0,
            width: { lg: compactFourColumnCard ? 1 : 'auto', xl: 'auto' },
            minHeight: 88,
            textAlign: 'left',
            display: 'block',
            borderRadius: 1,
            p: 0.5,
            pt: { lg: compactFourColumnCard ? 5.5 : 0.5, xl: 0.5 },
            '&:focus-visible': { outline: 2, outlineColor: 'success.main', outlineOffset: 1 },
          }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" component="span" sx={{ overflowWrap: 'anywhere' }}>
              {name}
              {field.required && (
                <Box component="span" sx={{ color: 'error.main', ml: 0.5 }} aria-label="required">
                  *
                </Box>
              )}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{
                minHeight: 42,
                px: 1.25,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                color: 'text.secondary',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="body2" color="inherit" noWrap>
                {fieldPrompt(field.fieldType, name, field.placeholder)}
              </Typography>
              {[5, 6, 7, 8, 9].includes(field.fieldType) && (
                <Iconify
                  icon={
                    field.fieldType === 5
                      ? 'mdi:calendar-month-outline'
                      : field.fieldType === 8
                        ? 'mdi:radiobox-blank'
                        : field.fieldType === 9
                          ? 'mdi:checkbox-blank-outline'
                          : 'mdi:chevron-down'
                  }
                  width={18}
                />
              )}
            </Stack>
            {(field.helpText || selected) && (
              <Typography variant="caption" color={selected ? 'success.main' : 'text.secondary'}>
                {field.helpText || `Selected · ${fieldType} field`}
              </Typography>
            )}
          </Stack>
        </ButtonBase>
        <CustomTooltip title={`Delete ${name}`}>
          <IconButton
            aria-label={`Delete ${name}`}
            onClick={onDelete}
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              color: 'text.secondary',
              position: { lg: compactFourColumnCard ? 'absolute' : 'static', xl: 'static' },
              top: 6,
              right: 6,
              zIndex: 1,
            }}
          >
            <Iconify icon="mdi:delete-outline" width={20} />
          </IconButton>
        </CustomTooltip>
      </Stack>
    </Card>
  );
}
