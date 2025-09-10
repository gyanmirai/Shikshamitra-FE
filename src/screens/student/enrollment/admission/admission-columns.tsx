import type { Theme, SxProps } from '@mui/material/styles';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import type { IKanbanTask, IKanbanColumn } from 'src/types/kanban';

import { CSS } from '@dnd-kit/utilities';
import ColumnBase from 'src/sections/kanban/column/column-base';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';

import { HeaderToolBar } from './header-toolbar';

// ----------------------------------------------------------------------

type ColumnProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
  tasks: IKanbanTask[];
  column: IKanbanColumn;
  children: React.ReactNode;
};

export function AdmissionColumn({ children, column, tasks, disabled, sx }: ColumnProps) {
  const { attributes, isDragging, listeners, setNodeRef, transition, active, over, transform } =
    useSortable({
      id: column.id,
      data: { type: 'container', children: tasks },
      animateLayoutChanges,
    });

  const tasksIds = tasks.map((task) => task.id);

  const isOverContainer = over
    ? (column.id === over.id && active?.data.current?.type !== 'container') ||
      tasksIds.includes(over.id)
    : false;

  return (
    <ColumnBase
      ref={disabled ? undefined : setNodeRef}
      sx={{ transition, transform: CSS.Translate.toString(transform), ...sx }}
      stateProps={{
        dragging: isDragging,
        hover: isOverContainer,
        handleProps: { ...attributes, ...listeners },
      }}
      slots={{
        header: (
          <HeaderToolBar
            handleProps={{ ...attributes, ...listeners }}
            totalTasks={tasks.length}
            columnName={column.name}
          />
        ),
        main: <>{children}</>,
      }}
    />
  );
}

// ----------------------------------------------------------------------

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });
