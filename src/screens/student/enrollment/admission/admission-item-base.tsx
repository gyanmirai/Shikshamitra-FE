import type { IKanbanTask } from 'src/types/kanban';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useSortable } from '@dnd-kit/sortable';
import { imageClasses } from 'src/components/image';
import { useState, useEffect, forwardRef } from 'react';

import AdmissionItem from './admission-item';

// ----------------------------------------------------------------------

type TaskItemProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
  task: IKanbanTask;
  columnId: UniqueIdentifier;
  openDetails: UseBooleanReturn;
};

export const AdmissionItemBase = forwardRef<{ current: Element }, TaskItemProps>(
  ({ task, disabled, columnId, sx, openDetails }, ref) => {
    const { setNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
      id: task?.id,
    });

    const mounted = useMountStatus();

    const mountedWhileDragging = isDragging && !mounted;
    return (
      <AdmissionItem
        ref={disabled ? undefined : setNodeRef}
        task={task}
        onClick={() => {
          openDetails.onTrue();
        }}
        stateProps={{
          transform,
          listeners,
          transition,
          sorting: isSorting,
          dragging: isDragging,
          fadeIn: mountedWhileDragging,
        }}
        sx={{
          ...(openDetails.value && { [`& .${imageClasses.root}`]: { opacity: 0.8 } }),
          ...sx,
        }}
      />
    );
  }
);

// ----------------------------------------------------------------------

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
