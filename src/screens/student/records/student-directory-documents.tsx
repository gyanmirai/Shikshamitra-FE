'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import StudentICardBuilder from './student-icard-builder';
import CertificateGenerationDrawer from './components/certificate-generation-drawer';
import StudentAssignmentDrawer from '../onboarding/student-setup/student-assignment-drawer';

import type { StudentICardAcademicScope } from './student-icard-builder';

export type DirectoryDocumentRequest = {
  kind: 'id-card' | 'certificate';
  students: StudentDirectoryItem[];
  academicYearId: string;
  academicScope?: StudentICardAcademicScope;
  lockAcademicScope?: boolean;
};

export default function StudentDirectoryDocuments({
  request,
  onClose,
}: {
  request: DirectoryDocumentRequest | null;
  onClose: () => void;
}) {
  return request ? (
    <DirectoryDocuments
      key={`${request.kind}:${request.academicYearId}:${request.students.map((student) => student.studentId).join(',')}`}
      request={request}
      onClose={onClose}
    />
  ) : null;
}

function DirectoryDocuments({
  request,
  onClose,
}: {
  request: DirectoryDocumentRequest;
  onClose: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const [openedYear] = useState(currentYear);
  const [busy, setBusy] = useState(false);
  const feature = request.kind === 'id-card' ? 'StudentICard' : 'Certificates';
  const canIssue =
    hasGrantedPermission(permissions, `Students.Records.${feature}.View`) &&
    hasGrantedPermission(permissions, `Students.Records.${feature}.Add`);
  const validStudents =
    request.students.length >= 1 &&
    request.students.length <= 100 &&
    request.students.every(
      (student) =>
        student.studentId &&
        !student.maskedFields.includes('Identity') &&
        (!student.academicYearId || student.academicYearId === request.academicYearId)
    ) &&
    new Set(request.students.map((student) => student.studentId)).size === request.students.length;
  const initialYearMismatch = !request.academicYearId || openedYear !== request.academicYearId;
  const contextInvalid = currentYear !== request.academicYearId;
  const restriction = !canIssue
    ? 'You do not have permission to issue these documents.'
    : !validStudents
      ? 'Select between 1 and 100 students with available identity details.'
      : initialYearMismatch
        ? 'The academic year changed. Close this workspace and select students again.'
        : '';
  if (restriction)
    return (
      <CustomDialog
        open
        handleClose={onClose}
        title="Student Documents"
        hasForm={false}
        titleInfo="Document actions retain the selected students and academic year."
        hasUnsavedChanges={false}
      >
        <DialogScrollContent>
          <Typography role="alert" variant="body2">
            {restriction}
          </Typography>
        </DialogScrollContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    );
  if (request.kind === 'id-card')
    return (
      <StudentAssignmentDrawer
        title="Print I-Cards"
        titleInfo="Select students, review their cards, then download a print PDF or issue numbered cards into student history."
        contentLayout="workspace"
        wide
        busy={busy}
        onClose={() => {
          if (!busy) onClose();
        }}
        actions={null}
      >
        <StudentICardBuilder
          initialStudents={request.students}
          initialAcademicScope={request.academicScope}
          lockAcademicScope={request.lockAcademicScope}
          academicYearId={request.academicYearId}
          contextInvalid={contextInvalid}
          onBusyChange={setBusy}
          onClose={onClose}
        />
      </StudentAssignmentDrawer>
    );
  return <DirectoryCertificateFlow request={request} onClose={onClose} />;
}

function DirectoryCertificateFlow({
  request,
  onClose,
}: {
  request: DirectoryDocumentRequest;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <CertificateGenerationDrawer
      students={request.students}
      academicYearId={request.academicYearId}
      onClose={onClose}
      onViewHistory={(studentId) => {
        onClose();
        const params = new URLSearchParams({ student: studentId, year: request.academicYearId });
        router.push(`${studentPaths.records.certificates}?${params.toString()}`);
      }}
    />
  );
}
