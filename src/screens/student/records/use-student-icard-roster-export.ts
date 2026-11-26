import type { AppDispatch } from 'src/redux/store';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type {
  ICardAssignmentStudent,
  ICardAssignmentRosterRequest,
} from 'src/redux/student/records/student-icard-assignment-api';

import { useDispatch } from 'react-redux';
import { exportTable } from 'src/components/customizabaleTable/table-export';
import { studentICardAssignmentApi } from 'src/redux/student/records/student-icard-assignment-api';

import { criteriaFromRosterTable } from './student-icard-roster-filters';

type RosterScope = Pick<
  ICardAssignmentRosterRequest,
  'academicYearId' | 'standardId' | 'divisionId'
>;

export function useStudentICardRosterExport(
  scope: RosterScope,
  tableTitle: string,
  templateName: string
) {
  const dispatch = useDispatch<AppDispatch>();

  return async ({ format, columns, searchTerm, filters, signal }: TableExportRequest) => {
    if (!columns.length) throw new Error('Show at least one data column before exporting.');

    const columnFilters = criteriaFromRosterTable(filters);
    const criteria = {
      ...scope,
      search: searchTerm.slice(0, 150) || undefined,
      columnFilters: columnFilters.length ? columnFilters : undefined,
    };
    const rows: (ICardAssignmentStudent & { templateName: string })[] = [];
    const studentIds = new Set<string>();
    let expectedCount: number | undefined;

    do {
      signal?.throwIfAborted();
      const query = dispatch(
        studentICardAssignmentApi.endpoints.getICardAssignmentRoster.initiate(
          { ...criteria, skipCount: rows.length, maxResultCount: 100 },
          { subscribe: false, forceRefetch: true }
        )
      );
      const abortQuery = () => query.abort();
      signal?.addEventListener('abort', abortQuery, { once: true });
      let page;
      try {
        // Later offsets depend on the number of records the server actually returned.
        // eslint-disable-next-line no-await-in-loop
        page = await query.unwrap();
      } finally {
        signal?.removeEventListener('abort', abortQuery);
        query.unsubscribe();
      }
      signal?.throwIfAborted();
      expectedCount ??= page.totalCount;
      if (
        !Number.isInteger(expectedCount) ||
        expectedCount < 0 ||
        page.totalCount !== expectedCount ||
        rows.length + page.items.length > expectedCount ||
        (!page.items.length && rows.length < expectedCount)
      ) {
        throw new Error('The class roster changed during export. Refresh and try again.');
      }
      if (expectedCount > 500000) {
        throw new Error('The table exceeds 500,000 rows. Narrow its filters.');
      }
      if (format === 'pdf' && (expectedCount > 10000 || expectedCount * columns.length > 200000)) {
        throw new Error(
          'PDF supports up to 10,000 rows and 200,000 cells. Use Excel or narrow the filters.'
        );
      }
      page.items.forEach((student) => {
        if (!student.studentId || studentIds.has(student.studentId)) {
          throw new Error('The class roster changed during export. Refresh and try again.');
        }
        studentIds.add(student.studentId);
        rows.push({ ...student, templateName });
      });
    } while (rows.length < expectedCount);

    await exportTable({
      format,
      columns,
      columnVisibility: Object.fromEntries(columns.map((column) => [column.id, true])),
      rows,
      tableTitle,
      beforeDownload: () => signal?.throwIfAborted(),
    });
  };
}
