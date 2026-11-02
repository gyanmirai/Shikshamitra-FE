import { GlobalIcons } from 'src/utils/icons';
import { Grid, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import SubmissionAttachmentCard from './submissionAttachmentCard';

import type { TStudentGrade, SubmissionAttachment } from '../homeworkCreation/type';

export default function StudentSubmissionAttachments({
  student,
}: {
  student?: TStudentGrade | null;
}) {
  const files: SubmissionAttachment[] =
    student?.submissionAttachments ??
    (student?.submittedDocumentUrl
      ? [
          {
            name: student.originalFileName || 'Submitted document',
            url: `/api/files/${encodeURIComponent(student.submittedDocumentUrl.split('/').pop() || '')}`,
          },
        ]
      : []);
  return (
    <FormSectionCard
      title="Student Submission Attachments"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Files uploaded by this student. Preview or download them before evaluating the submission."
      collapsible
    >
      {files.length ? (
        <Grid container spacing={2}>
          {files.map((file) => (
            <Grid key={file.id || file.url} size={{ xs: 12, sm: 6, md: 4 }}>
              <SubmissionAttachmentCard file={file} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No student attachments submitted.
        </Typography>
      )}
    </FormSectionCard>
  );
}
