import type { FormikProps } from 'formik';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Box, Tooltip, IconButton } from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';

import { BuildingFloorRow } from './building-floor-row';

import type { IBuildingFormValues } from '../types';

type Props = {
  formik: FormikProps<IBuildingFormValues>;
  index: number;
  onMove: (destination: number) => void;
  onRemove: () => void;
};

export function SortableBuildingFloor({ formik, index, onMove, onRemove }: Props) {
  const floor = formik.values.floors[index];
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: floor.rowKey, disabled: formik.isSubmitting });
  return (
    <Box
      ref={setNodeRef}
      role="listitem"
      aria-label={`Floor ${index + 1}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        bgcolor: 'background.paper',
        opacity: isDragging ? 0.7 : 1,
        py: 2,
        '& + &': { borderTop: 1, borderColor: 'divider' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none !important' },
      }}
    >
      <BuildingFloorRow
        formik={formik}
        index={index}
        onMove={onMove}
        onRemove={onRemove}
        dragHandle={
          <Tooltip title="Drag to reorder. With a keyboard, press Space, then use arrow keys.">
            <span>
              <IconButton
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                type="button"
                size="small"
                aria-label={`Drag floor ${index + 1} to reorder`}
                disabled={formik.isSubmitting}
                sx={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <DragIndicator fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        }
      />
    </Box>
  );
}
