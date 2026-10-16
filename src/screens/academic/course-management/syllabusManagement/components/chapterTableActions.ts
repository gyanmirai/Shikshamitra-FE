import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

import type { IChapter } from '../type';

type ChapterTableActionOptions = {
  canAdd: boolean;
  canView: boolean;
  canDelete: boolean;
  onViewDocuments: (chapter: IChapter) => void;
  onEdit: (chapter: IChapter) => void;
  onCreateQuestion?: (chapter: IChapter) => void;
  onViewQuestions?: (chapter: IChapter) => void;
  onDelete: (chapter: IChapter) => void;
};

export function getChapterTableActions(
  chapter: IChapter,
  options: ChapterTableActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.canView) {
    actions.push({
      id: 'view-documents',
      label: 'View documents',
      icon: 'solar:document-text-linear',
      onClick: () => options.onViewDocuments(chapter),
    });
  }

  if (options.canAdd) {
    actions.push({
      id: 'edit',
      label: 'Edit chapter',
      icon: GlobalIcons.edit,
      onClick: () => options.onEdit(chapter),
    });
  }
  if (options.canDelete) {
    actions.push({
      id: 'delete',
      label: 'Delete chapter',
      icon: GlobalIcons.delete,
      color: 'error.main',
      onClick: () => options.onDelete(chapter),
    });
  }

  if (options.onCreateQuestion) {
    actions.push({
      id: 'create-question',
      label: 'Create question',
      icon: 'mingcute:question-line',
      onClick: () => options.onCreateQuestion?.(chapter),
    });
  }
  if (options.onViewQuestions) {
    actions.push({
      id: 'view-questions',
      label: 'View questions',
      icon: 'mingcute:list-check-line',
      onClick: () => options.onViewQuestions?.(chapter),
    });
  }

  return actions;
}
