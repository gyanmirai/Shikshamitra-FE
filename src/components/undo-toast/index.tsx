import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

type UndoToastProps = {
  id: string | number;
  duration: number;
  message: string;
  onUndo: () => void;
};

export function UndoToast({ id, duration, message, onUndo }: UndoToastProps) {
  const [seconds, setSeconds] = useState(Math.ceil(duration / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      toast.dismiss(id);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, id]);

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography variant="body2">
        {message} • Undo in {seconds}s
      </Typography>

      <Button
        size="small"
        // color="primary"
        onClick={() => {
          onUndo();
          toast.dismiss(id);
        }}
      >
        UNDO
      </Button>
    </Box>
  );
}
