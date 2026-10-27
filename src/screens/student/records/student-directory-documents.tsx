'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type { CertificateType } from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import StudentICardBuilder from './student-icard-builder';
import StudentCertificateForm from './student-certificate-form';
import StudentAssignmentDrawer from '../onboarding/student-setup/student-assignment-drawer';

import type { StudentICardAcademicScope } from './student-icard-builder';

export type DirectoryDocumentRequest = {
  kind: 'id-card' | 'certificate';
  students: StudentDirectoryItem[];
  academicYearId: string;
  academicScope?: StudentICardAcademicScope;
  lockAcademicScope?: boolean;
};

const certificateChoices: { type: CertificateType; label: string; icon: string }[] = [
  { type: 1, label: 'Bonafide', icon: 'tdesign:certificate' },
  { type: 4, label: 'First Trial', icon: 'ph:certificate-light' },
  { type: 3, label: 'Leaving', icon: 'streamline-cyber:wedding-certificate' },
  { type: 2, label: 'Character', icon: 'la:certificate' },
];

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
  const [certificate, setCertificate] = useState<(typeof certificateChoices)[number] | null>(null);
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
        title="Print Student I-Cards"
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
  if (certificate)
    return (
      <StudentCertificateForm
        certificateType={certificate.type}
        certificateLabel={certificate.label}
        initialStudents={request.students}
        academicYearId={request.academicYearId}
        onClose={onClose}
        onGenerated={() => {}}
      />
    );
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Generate Certificates"
      hasForm={false}
      titleInfo="Choose a certificate type, then preview it for the selected students before generating."
      hasUnsavedChanges={false}
      maxWidth="xs"
    >
      <DialogScrollContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {request.students.length} student{request.students.length === 1 ? '' : 's'} selected
          </Typography>
          {contextInvalid ? (
            <Typography role="alert" variant="body2" color="warning.main">
              The academic year changed. Close this workspace and select students again.
            </Typography>
          ) : (
            certificateChoices.map((choice) => (
              <Button
                key={choice.type}
                variant="outlined"
                color="inherit"
                fullWidth
                startIcon={<Iconify icon={choice.icon} width={18} />}
                onClick={() => setCertificate(choice)}
              >
                {choice.label}
              </Button>
            ))
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
