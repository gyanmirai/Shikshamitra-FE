import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, IconButton, Typography } from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

export type AcademicOrderItem = { id: string; name: string };

export function AcademicOrderRow({
  item,
  index,
  count,
  disabled,
  onMove,
}: {
  item: AcademicOrderItem;
  index: number;
  count: number;
  disabled: boolean;
  onMove: (from: number, to: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });
  return (
    <Box
      component="li"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        borderBottom: 1,
        borderColor: 'divider',
        opacity: isDragging ? 0.5 : 1,
        '&:last-child': { borderBottom: 0 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none !important' },
      }}
    >
      <CustomTooltip title="Drag to reorder. With a keyboard, press Space, then use arrow keys.">
        <span>
          <IconButton
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag ${item.name}`}
            disabled={disabled}
            sx={{ width: 44, height: 44, touchAction: 'none', cursor: 'grab' }}
          >
            <DragIndicator fontSize="small" />
          </IconButton>
        </span>
      </CustomTooltip>
      <Typography component="span" variant="caption" color="text.secondary" sx={{ minWidth: 24 }}>
        {index + 1}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
        {item.name}
      </Typography>
      <CustomTooltip title={`Move ${item.name} up`}>
        <span>
          <IconButton
            aria-label={`Move ${item.name} up`}
            disabled={disabled || index === 0}
            onClick={() => onMove(index, index - 1)}
            sx={{ width: 44, height: 44 }}
          >
            <ArrowUpward fontSize="small" />
          </IconButton>
        </span>
      </CustomTooltip>
      <CustomTooltip title={`Move ${item.name} down`}>
        <span>
          <IconButton
            aria-label={`Move ${item.name} down`}
            disabled={disabled || index === count - 1}
            onClick={() => onMove(index, index + 1)}
            sx={{ width: 44, height: 44 }}
          >
            <ArrowDownward fontSize="small" />
          </IconButton>
        </span>
      </CustomTooltip>
    </Box>
  );
}
