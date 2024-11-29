import type { Theme, SxProps } from '@mui/material/styles';
import type { DropAnimation, UniqueIdentifier } from '@dnd-kit/core';
import type { IKanban, IKanbanTask, IKanbanColumn } from 'src/types/kanban';

import { DragOverlay as DndDragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';

import Portal from '@mui/material/Portal';

import ColumnBase from 'src/sections/kanban/column/column-base';

import AdmissionItem from './admission-item';
import { HeaderToolBar } from './header-toolbar';

// ----------------------------------------------------------------------

type KanbanDragOverlayProps = Pick<IKanban, 'tasks' | 'columns'> & {
  activeId: UniqueIdentifier | null;
  sx?: SxProps<Theme>;
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
};

export function AdmissionOverlay({ columns, tasks, activeId, sx }: KanbanDragOverlayProps) {
  const columnIds = columns.map((column) => column.id);

  const activeColumn = columns.find((column) => column.id === activeId) as IKanbanColumn;

  const allTasks = Object.values(tasks).flat();

  const activeTask = allTasks.find((task) => task.id === activeId) as IKanbanTask;

  return (
    <Portal>
      <DndDragOverlay adjustScale={false} dropAnimation={dropAnimation}>
        {activeId ? (
          <>
            {columnIds.includes(activeId) ? (
              <ColumnOverlay column={activeColumn} tasks={tasks[activeId]} sx={sx} />
            ) : (
              <TaskItemOverlay task={activeTask} sx={sx} />
            )}
          </>
        ) : null}
      </DndDragOverlay>
    </Portal>
  );
}

// ----------------------------------------------------------------------

type ColumnOverlayProps = {
  column: IKanbanColumn;
  tasks: IKanbanTask[];
  sx?: SxProps<Theme>;
};

export function ColumnOverlay({ column, tasks, sx }: ColumnOverlayProps) {
  return (
    <ColumnBase
      slots={{
        header: <HeaderToolBar columnName={column.name} totalTasks={tasks.length} />,
        main: tasks.map((task) => <AdmissionItem key={task.id} task={task} />),
      }}
      stateProps={{ dragOverlay: true }}
      sx={sx}
    />
  );
}

// ----------------------------------------------------------------------

type TaskItemOverlayProps = {
  task: IKanbanTask;
  sx?: SxProps<Theme>;
};

export function TaskItemOverlay({ task, sx }: TaskItemOverlayProps) {
  return <AdmissionItem task={task} sx={sx} stateProps={{ dragOverlay: true }} />;
}
