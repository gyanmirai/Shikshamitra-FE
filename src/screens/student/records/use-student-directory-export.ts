import type { AppDispatch } from 'src/redux/store';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';
import type {
  StudentDirectoryItem,
  StudentDirectoryInput,
} from 'src/redux/student/records/student-records-types';

import { useDispatch } from 'react-redux';
import { useRef, useEffect, useCallback } from 'react';
import { exportTable } from 'src/components/customizabaleTable/table-export';
import { studentRecordsApi } from 'src/redux/student/records/student-records-api';

const pageSize = 100;
const nonDataColumns = new Set(['actions', 'selection', 'checkbox']);

/** Export the complete server-filtered directory, independently of row selection and paging. */
export function useStudentDirectoryExport(
  input: StudentDirectoryInput,
  context: string[] = []
): (request: TableExportRequest) => Promise<void> {
  const dispatch = useDispatch<AppDispatch>();
  const currentInput = useRef(input);
  currentInput.current = input;
  const currentContext = useRef(context);
  currentContext.current = context;
  const active = useRef(new Set<AbortController>());

  useEffect(() => {
    const requests = active.current;
    return () => requests.forEach((controller) => controller.abort());
  }, []);

  return useCallback(
    async ({ format, columns, signal }: TableExportRequest) => {
      signal?.throwIfAborted();
      const captured = structuredClone(currentInput.current);
      const capturedContext = [...currentContext.current];
      if (!captured.academicYearId) throw new Error('Select an academic year before exporting.');
      const dataColumns = columns.filter(
        (column) => !column.excludeFromExport && !nonDataColumns.has(column.id)
      );
      if (!dataColumns.length) throw new Error('Show at least one data column before exporting.');

      const controller = new AbortController();
      const cancel = () => controller.abort();
      signal?.addEventListener('abort', cancel, { once: true });
      active.current.add(controller);
      const rows: StudentDirectoryItem[] = [];
      const ids = new Set<string>();
      let expectedCount: number | undefined;
      try {
        while (true) {
          controller.signal.throwIfAborted();
          const query = dispatch(
            studentRecordsApi.endpoints.getStudentRecordsDirectory.initiate(
              { ...captured, skipCount: rows.length, maxResultCount: pageSize },
              { subscribe: false, forceRefetch: true }
            )
          );
          const abortQuery = () => query.abort();
          controller.signal.addEventListener('abort', abortQuery, { once: true });
          let page;
          try {
            // Sequential pages validate completeness and cancellation before another request.
            // eslint-disable-next-line no-await-in-loop
            page = await query.unwrap();
          } finally {
            controller.signal.removeEventListener('abort', abortQuery);
            query.unsubscribe();
          }
          controller.signal.throwIfAborted();
          expectedCount ??= page.totalCount;
          if (
            !Number.isInteger(expectedCount) ||
            expectedCount < 0 ||
            page.totalCount !== expectedCount ||
            expectedCount > 500000
          ) {
            throw new Error(
              'Students changed or the export is too large. Refresh or narrow the filters and try again.'
            );
          }
          if (
            format === 'pdf' &&
            (expectedCount > 10000 || expectedCount * dataColumns.length > 200000)
          ) {
            throw new Error(
              'PDF supports up to 10,000 rows and 200,000 cells. Use Excel or narrow the filters.'
            );
          }
          page.items.forEach((student) => {
            if (!student.studentId || ids.has(student.studentId)) {
              throw new Error('Students changed during export. Refresh and try again.');
            }
            ids.add(student.studentId);
            rows.push(student);
          });
          if (rows.length === expectedCount) break;
          if (rows.length > expectedCount || !page.items.length) {
            throw new Error('The complete student export could not be loaded. Please try again.');
          }
        }
        controller.signal.throwIfAborted();
        await exportTable({
          format,
          columns: dataColumns,
          columnVisibility: Object.fromEntries(dataColumns.map((column) => [column.id, true])),
          rows: rows.map((student) => ({
            ...student,
            name:
              [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
              'Restricted identity',
            classDivision:
              [student.standardName, student.divisionName].filter(Boolean).join(' / ') || '—',
          })),
          tableTitle: 'Student List',
          context: [
            ...capturedContext,
            `Population: ${captured.population ?? 'Active'}`,
            captured.search ? `Search: ${captured.search}` : '',
            captured.sorting ? `Sort: ${captured.sorting}` : '',
            captured.columnFilters?.length
              ? `${captured.columnFilters.length} column filters applied`
              : '',
          ].filter(Boolean),
        });
      } finally {
        active.current.delete(controller);
        signal?.removeEventListener('abort', cancel);
      }
    },
    [dispatch]
  );
}
