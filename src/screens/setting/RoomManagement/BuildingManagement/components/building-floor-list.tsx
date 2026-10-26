import type { FormikProps } from 'formik';
import type { Modifier, UniqueIdentifier } from '@dnd-kit/core';

import { Box, Typography } from '@mui/material';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import { SortableBuildingFloor } from './sortable-building-floor';

import type { IBuildingFloorValue, IBuildingFormValues } from '../types';

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

type Props = {
  formik: FormikProps<IBuildingFormValues>;
  error?: string;
  onMove: (from: number, to: number) => void;
  onRemove: (floor: IBuildingFloorValue, index: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
};

export function BuildingFloorList({ formik, error, onMove, onRemove, onDraggingChange }: Props) {
  const { floors } = formik.values;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const position = (id: UniqueIdentifier) => floors.findIndex((floor) => floor.rowKey === id);
  const label = (id: UniqueIdentifier) => {
    const index = position(id);
    return floors[index]?.floorName || `Floor ${index + 1}`;
  };
  const move = (from: number, to: number) => {
    if (!formik.isSubmitting && from >= 0 && to >= 0 && to < floors.length && from !== to) {
      onMove(from, to);
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'To reorder a floor, press Space or Enter on its drag handle. Use the up and down arrow keys to move it, then press Space or Enter to drop. Press Escape to cancel.',
        },
        announcements: {
          onDragStart: ({ active }) => `${label(active.id)} picked up.`,
          onDragOver: ({ active, over }) =>
            over ? `${label(active.id)} is at position ${position(over.id) + 1}.` : undefined,
          onDragEnd: ({ active, over }) =>
            over
              ? `${label(active.id)} dropped at position ${position(over.id) + 1}.`
              : `${label(active.id)} was not moved.`,
          onDragCancel: ({ active }) => `${label(active.id)} was not moved.`,
        },
      }}
      onDragStart={() => onDraggingChange?.(true)}
      onDragCancel={() => onDraggingChange?.(false)}
      onDragEnd={({ active, over }) => {
        onDraggingChange?.(false);
        if (over) move(position(active.id), position(over.id));
      }}
    >
      <SortableContext
        items={floors.map((floor) => floor.rowKey)}
        strategy={verticalListSortingStrategy}
      >
        <Box
          role="list"
          aria-label="Building floors"
          aria-describedby={error ? 'building-floors-error' : undefined}
          tabIndex={error ? -1 : undefined}
        >
          {floors.map((floor, index) => (
            <SortableBuildingFloor
              key={floor.rowKey}
              formik={formik}
              index={index}
              onMove={(destination) => move(index, destination)}
              onRemove={() => onRemove(floor, index)}
            />
          ))}
          {!floors.length && (
            <Typography variant="body2" color="text.secondary">
              No floors added. Use Add floor to create the first floor.
            </Typography>
          )}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
