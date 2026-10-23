import { useMemo, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';

import { buildChapterTableRows } from './chapterTableRows';
import { getChapterTableActions } from './chapterTableActions';
import { getChapterTableColumns } from './chapterTableColumns';

import type { IChapter, IChapterTableProps } from '../type';

const ChapterTable = ({
  addChapterDialog,
  isLoading,
  onDelete,
  setEditData,
  data,
  actions,
  handleEyeClick,
  onViewDocuments,
  onCreateQuestion,
  onViewQuestions,
  subjectId,
  standardId,
  canAdd = true,
  canView = true,
  canDelete = true,
}: IChapterTableProps) => {
  /**
   * Memoization Justification:
   * - Chapter row preparation formats dates and derives progress for every table record.
   * - Recomputing only when API data changes avoids repeating that work during local UI updates.
   */
  const tableData = useMemo(() => buildChapterTableRows(data || []), [data]);

  /**
   * Memoization Justification:
   * - The callback is consumed by the memoized column configuration below.
   * - A stable reference prevents the table from receiving a new actions renderer every render.
   */
  const getRowActions = useCallback(
    (chapter: IChapter) =>
      getChapterTableActions(chapter, {
        canAdd,
        canView,
        canDelete,
        onViewDocuments,
        onEdit: (row) => {
          setEditData(row);
          addChapterDialog.onTrue();
        },
        onCreateQuestion,
        onViewQuestions,
        onDelete,
      }),
    [
      addChapterDialog,
      canAdd,
      canDelete,
      canView,
      onCreateQuestion,
      onDelete,
      onViewDocuments,
      onViewQuestions,
      setEditData,
    ]
  );

  /**
   * Memoization Justification:
   * - CustomizableTable relies on stable column definitions for persisted visibility and sorting.
   * - Rebuilding columns only when action behavior changes avoids unnecessary table work.
   */
  const columns = useMemo(() => getChapterTableColumns(getRowActions), [getRowActions]);
  return (
    <CustomizableTable
      tableTitle="Syllabus Chapters"
      tableId="chapterTable"
      isLoading={isLoading}
      noDataText={<>Chapters Data Not Found </>}
      columns={columns}
      data={tableData}
    />
  );
};

export default ChapterTable;
