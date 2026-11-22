'use client';

import { useSearchParams } from 'next/navigation';

import StudentICardAssignment from './student-icard-assignment';
import StudentRecordDocuments from './student-record-documents';

export default function StudentICardWorkspace() {
  const params = useSearchParams();

  return params.get('view') === 'issued' ? (
    <StudentRecordDocuments fixedKind="ids" />
  ) : (
    <StudentICardAssignment />
  );
}
