import { useState } from 'react';
import { Stack, Button, Typography } from '@mui/material';

import type { StudentSetupView } from './student-setup-view';
import type { StudentPendingTask } from './student-setup-summary';

export default function StudentPendingTasks({
  studentName,
  tasks,
  emptyText,
  disabled = false,
  onOpenTask,
}: {
  studentName: string;
  tasks: StudentPendingTask[];
  emptyText: string;
  disabled?: boolean;
  onOpenTask: (view: StudentSetupView) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!tasks.length) return <Typography variant="body2">{emptyText}</Typography>;

  return (
    <Stack alignItems="flex-start" spacing={0.25}>
      {(expanded ? tasks : tasks.slice(0, 1)).map((task) => (
        <Button
          key={task.key}
          size="small"
          color="inherit"
          disabled={disabled}
          aria-label={`${task.label} for ${studentName}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenTask(task.view);
          }}
          sx={{
            px: 0,
            py: 0.25,
            minWidth: 0,
            height: 'auto',
            typography: 'body2',
            textAlign: 'left',
            justifyContent: 'flex-start',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
          }}
        >
          {task.label}
        </Button>
      ))}
      {tasks.length > 1 && (
        <Button
          size="small"
          color="inherit"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Show less pending work' : 'Show all pending work'} for ${studentName}`}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          sx={{
            px: 0,
            minWidth: 0,
            height: 'auto',
            typography: 'caption',
            color: 'text.secondary',
          }}
        >
          {expanded ? 'Show less' : `+${tasks.length - 1} more`}
        </Button>
      )}
    </Stack>
  );
}
