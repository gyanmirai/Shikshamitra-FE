import { Box } from '@mui/material';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { AcademicOrderRow } from './academic-order-row';

import type { AcademicOrderItem } from './academic-order-row';

export function AcademicOrderList({
  items,
  disabled,
  onChange,
}: {
  items: AcademicOrderItem[];
  disabled: boolean;
  onChange: (items: AcademicOrderItem[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const move = (from: number, to: number) => {
    if (!disabled && from >= 0 && to >= 0 && to < items.length && from !== to) {
      onChange(arrayMove(items, from, to));
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over)
          move(
            items.findIndex((item) => item.id === active.id),
            items.findIndex((item) => item.id === over.id)
          );
      }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <Box component="ol" aria-label="Display order" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {items.map((item, index) => (
            <AcademicOrderRow
              key={item.id}
              item={item}
              index={index}
              count={items.length}
              disabled={disabled}
              onMove={move}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
