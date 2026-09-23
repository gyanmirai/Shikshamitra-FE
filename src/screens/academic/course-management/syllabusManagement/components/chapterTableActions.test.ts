import { describe, expect, it, vi } from 'vitest';

import { getChapterTableActions } from './chapterTableActions';

import type { IChapter } from '../type';

const chapter = {
  id: 'chapter-1',
  chapterName: 'Fractions',
} as IChapter;

describe('getChapterTableActions', () => {
  it('keeps the first three chapter actions direct and later actions in order', () => {
    const actions = getChapterTableActions(chapter, {
      canAdd: true,
      canView: true,
      canDelete: true,
      onViewDocuments: vi.fn(),
      onEdit: vi.fn(),
      onCreateQuestion: vi.fn(),
      onViewQuestions: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(actions.map((action) => action.id)).toEqual([
      'view-documents',
      'edit',
      'create-question',
      'view-questions',
      'delete',
    ]);
  });
});
