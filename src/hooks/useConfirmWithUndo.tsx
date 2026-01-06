import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UndoToast } from 'src/components/UndoToast';
import { shikshaMitraToast } from 'src/components/toast';

type UndoConfig<T> = {
  item: T;
  duration?: number;
  message?: string;

  // RTK Query cache handlers
  onOptimisticRemove: (dispatch: any, setDeleteIndex: (index: number) => void) => void;
  onUndoRestore: (dispatch: any, deleteIndex: number) => void;

  // Backend delete (delayed)
  onCommit: () => Promise<void>;
};

export function useConfirmWithUndo<T>() {
  const dispatch = useDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);

  const confirmWithUndo = ({
    duration = 5000,
    message = 'Deleted successfully',
    onOptimisticRemove,
    onUndoRestore,
    onCommit,
  }: UndoConfig<T>) => {
    onOptimisticRemove(dispatch, setDeleteIndex);

    timerRef.current = setTimeout(async () => {
      await onCommit();
      toast.dismiss(id);
      setDeleteIndex(-1);
    }, duration);

    const id = shikshaMitraToast.info({
      message: '',
      alertProps: (t) => ({
        action: (
          <UndoToast
            id={t}
            duration={duration}
            message={message}
            onUndo={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              onUndoRestore(dispatch, deleteIndex);
              setDeleteIndex(-1);
              toast.dismiss(t);
            }}
          />
        ),
      }),
    });
  };

  return { confirmWithUndo };
}
