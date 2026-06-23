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
  onCommit: () => Promise<any>;
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
    let localDeleteIndex = -1;
    const customSetDeleteIndex = (index: number) => {
      localDeleteIndex = index;
      setDeleteIndex(index);
    };

    onOptimisticRemove(dispatch, customSetDeleteIndex);

    timerRef.current = setTimeout(async () => {
      try {
        const response = (await onCommit()) as any;
        if (response && response.error) {
          onUndoRestore(dispatch, localDeleteIndex);
        }
      } catch (error) {
        onUndoRestore(dispatch, localDeleteIndex);
      } finally {
        toast.dismiss(id);
        setDeleteIndex(-1);
      }
    }, duration);

    const id = shikshaMitraToast.info({
      message: (t) => (
        <UndoToast
          id={t}
          duration={duration}
          message={message}
          onUndo={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onUndoRestore(dispatch, localDeleteIndex);
            setDeleteIndex(-1);
            toast.dismiss(t);
          }}
        />
      ),
    });
  };

  return { confirmWithUndo };
}
