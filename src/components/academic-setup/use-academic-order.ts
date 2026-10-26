import { useRef, useState } from 'react';
import { useRouter } from 'src/routes/hooks/use-router';
import { shikshaMitraToast } from 'src/components/toast';
import { useReorderClassesMutation } from 'src/redux/class/classApi';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useReorderDivisionsMutation } from 'src/redux/division/divisionApi';
import { useReorderStagesMutation } from 'src/redux/oraganization/oraganization';

import { academicOrderLabels } from './academic-order-model';

import type { AcademicOrderItem } from './academic-order-row';
import type { AcademicOrderKind } from './academic-order-model';

export type AcademicOrderProps = {
  parentId: string;
  parentName: string;
  kind: AcademicOrderKind;
  items: AcademicOrderItem[];
  onClose: () => void;
};

export function useAcademicOrder({ parentId, kind, items, onClose }: AcademicOrderProps) {
  const router = useRouter();
  const [initialItems] = useState(() => items);
  const [draft, setDraft] = useState(() => items);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const [reorderClasses, classState] = useReorderClassesMutation();
  const [reorderDivisions, divisionState] = useReorderDivisionsMutation();
  const [reorderStages, stageState] = useReorderStagesMutation();
  const isSaving = stageState.isLoading || classState.isLoading || divisionState.isLoading;
  const isDirty = draft.some((item, index) => item.id !== initialItems[index]?.id);
  const listChanged =
    items.length !== initialItems.length ||
    items.some((item, index) => item.id !== initialItems[index]?.id);
  const { requestNavigation, confirmation } = useUnsavedNavigation(isDirty, {
    title: 'Discard Order Changes?',
    blockNavigation: isSaving,
    push: (href) => {
      onClose();
      router.push(href);
    },
    description: 'Your order has not been saved. Keep editing, or discard these changes.',
  });
  const close = () => {
    if (!saving.current) requestNavigation(onClose);
  };
  const save = async () => {
    if (saving.current || !isDirty || listChanged) return;
    saving.current = true;
    setError('');
    const ids = draft.map((item) => item.id);
    try {
      await (
        kind === 'stage'
          ? reorderStages({ mediumId: parentId, ids })
          : kind === 'class'
            ? reorderClasses({ stageId: parentId, ids })
            : reorderDivisions({ standardId: parentId, ids })
      ).unwrap();
      shikshaMitraToast.success({
        message: `${academicOrderLabels[kind].singular} order saved`,
      });
      onClose();
    } catch {
      setError(
        'Could not save the order. Try again, or close and reopen this list to load the latest records.'
      );
    } finally {
      saving.current = false;
    }
  };
  return { draft, setDraft, error, isSaving, isDirty, listChanged, close, save, confirmation };
}
