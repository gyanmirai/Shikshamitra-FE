import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  IssuedIdCard,
  IssuedIdCardQuery,
} from 'src/redux/student/records/student-record-documents-api';

import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';

export const calls: {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  body?: unknown;
}[] = [];
export const options = {
  academicYears: [{ id: 'test-year', name: '2026–2027' }],
  boards: [{ id: 'test-board', name: 'CBSE', parentId: 'test-year' }],
  mediums: [{ id: 'test-medium', name: 'English', parentId: 'test-board' }],
  standards: [
    { id: 'test-class-1', name: 'Class 1', parentId: 'test-medium' },
    { id: 'test-class-2', name: 'Class 2', parentId: 'test-medium' },
  ],
  divisions: [
    { id: 'test-division-a', name: 'A', parentId: 'test-class-1' },
    { id: 'test-division-b', name: 'B', parentId: 'test-class-2' },
  ],
};
const rows: (IssuedIdCard & { standardId: string; divisionId: string })[] = Array.from(
  { length: 27 },
  (_, index) => {
    const number = String(index + 1).padStart(3, '0');
    return {
      id: `test-card-${number}`,
      studentId: `test-student-${number}`,
      studentName:
        index === 0
          ? 'Synthetic Aarav With A Deliberately Long Student Name'
          : `Synthetic Student ${number}`,
      grNumber: `TEST-GR-${number}`,
      standardName: index < 23 ? 'Class 1' : 'Class 2',
      divisionName: index < 23 ? 'A' : 'B',
      standardId: index < 23 ? 'test-class-1' : 'test-class-2',
      divisionId: index < 23 ? 'test-division-a' : 'test-division-b',
      cardNumber: `ID-TEST-${number}`,
      status: index === 1 ? 'Voided' : index === 2 ? 'Cancelled' : 'Issued',
      issuedAt: new Date(Date.UTC(2026, 10, 16, 12, 0, -index)).toISOString(),
    };
  }
);

function syntheticPdf() {
  const stream = 'BT /F1 16 Tf 30 100 Td (SYNTHETIC TEST CARD - NO STUDENT DATA) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

type Request =
  string | { url: string; method?: string; params?: Record<string, unknown>; body?: unknown };
// Deliberately no fetch/axios/proxy: every request terminates inside this fixture.
export const fixtureBaseQuery: BaseQueryFn<Request, unknown, FetchBaseQueryError> = async (
  args
) => {
  const request = typeof args === 'string' ? { url: args } : args;
  const method = request.method ?? 'GET';
  calls.push({ ...request, method });
  window.dispatchEvent(new Event('fixture-request'));
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (request.url === '/students/records/directory/options' && method === 'GET')
    return { data: options };
  if (request.url === '/students/records/ids/history' && method === 'GET') {
    const query = request.params as unknown as IssuedIdCardQuery;
    let selected = rows.filter(
      (row) =>
        (!query.standardId || row.standardId === query.standardId) &&
        (!query.divisionId || row.divisionId === query.divisionId)
    );
    if (query.search)
      selected = selected.filter((row) =>
        `${row.studentName} ${row.grNumber} ${row.cardNumber}`
          .toLowerCase()
          .includes(query.search!.toLowerCase())
      );
    const [field, direction] = (query.sorting ?? 'issuedAt desc').split(' ');
    selected = [...selected].sort(
      (a, b) =>
        String(a[field as keyof IssuedIdCard] ?? '').localeCompare(
          String(b[field as keyof IssuedIdCard] ?? '')
        ) * (direction === 'desc' ? -1 : 1)
    );
    return {
      data: {
        items: selected
          .slice(query.skipCount, query.skipCount + query.maxResultCount)
          .map((row) => ({ ...row })),
        totalCount: selected.length,
      },
    };
  }
  const match = /^\/students\/records\/ids\/(test-card-\d{3})\/(pdf|reprint|void)$/.exec(
    request.url
  );
  const row = rows.find((item) => item.id === match?.[1]);
  if (row && match && row.status === 'Issued') {
    if (match[2] === 'pdf' && method === 'GET') return { data: syntheticPdf() };
    const reason = String((request.body as { reason?: string })?.reason ?? '').trim();
    if (method === 'POST' && reason.length >= 5) {
      if (match[2] === 'reprint') return { data: syntheticPdf() };
      if (match[2] === 'void') {
        row.status = 'Voided';
        return { data: { ...row } };
      }
    }
  }
  return {
    error: {
      status: 400,
      data: { detail: 'Blocked by isolated fixture. No school API was called.' },
    },
  };
};
export const api = createApi({
  reducerPath: 'api',
  tagTypes,
  baseQuery: fixtureBaseQuery,
  endpoints: () => ({}),
});
