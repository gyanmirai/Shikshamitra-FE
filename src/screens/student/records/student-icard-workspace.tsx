'use client';

import { useSearchParams } from 'next/navigation';

import StudentICardTemplates from './student-icard-templates';
import StudentRecordDocuments from './student-record-documents';

export default function StudentICardWorkspace() {
  const params = useSearchParams();

  return params.get('view') === 'issued' ? (
    <StudentRecordDocuments fixedKind="ids" />
  ) : (
    <StudentICardTemplates />
  );
}
