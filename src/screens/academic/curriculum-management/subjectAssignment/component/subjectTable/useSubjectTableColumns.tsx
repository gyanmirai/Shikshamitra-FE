import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';

import { getSubjectTableBaseColumns } from './subjectTableBaseColumns';
import { getSubjectTableStatusColumns } from './subjectTableStatusColumns';

import type { ISubjectFormValues, ISubjectTableProps } from '../type';

type Options = Pick<
  ISubjectTableProps,
  'onView' | 'onEdit' | 'onDelete' | 'onArchive' | 'onRestore' | 'onToggleStatus'
> & {
  canAdd: boolean;
  canView: boolean;
  canDelete: boolean;
  onViewSchedule: (row: ISubjectFormValues) => void;
};

export function useSubjectTableColumns(options: Options): IColumn[] {
  const {
    canAdd,
    canView,
    canDelete,
    onView,
    onEdit,
    onDelete,
    onArchive,
    onRestore,
    onToggleStatus,
    onViewSchedule,
  } = options;

  /**
   * Memoization Justification:
   * CustomizableTable treats columns as configuration state; a stable array prevents its
   * column setup from being rebuilt when only the selected schedule row changes.
   */
  return useMemo(
    () => [
      ...getSubjectTableBaseColumns(onViewSchedule),
      ...getSubjectTableStatusColumns({
        canAdd,
        canView,
        canDelete,
        onView,
        onEdit,
        onDelete,
        onArchive,
        onRestore,
        onToggleStatus,
      }),
    ],
    [
      canAdd,
      canDelete,
      canView,
      onArchive,
      onDelete,
      onEdit,
      onRestore,
      onToggleStatus,
      onView,
      onViewSchedule,
    ]
  );
}
