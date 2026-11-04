import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Stack, Avatar, Typography } from '@mui/material';

import type { TStudentGrade } from '../../../homeworkCreation/type';

export default function AssignmentSubmissionContext({ data }: { data?: TStudentGrade | null }) {
  const rawSubmissionType = data?.submissionType;
  const numSubmissionType = Number(rawSubmissionType);
  const normalizedSubmissionType = String(rawSubmissionType || '').toLowerCase();
  const isInPersonSubmission =
    numSubmissionType === 2 ||
    normalizedSubmissionType.includes('inperson') ||
    normalizedSubmissionType.includes('in person');
  const isNoSubmissionRequired =
    numSubmissionType === 3 || normalizedSubmissionType.includes('no submission');
  const isOnlineTextSubmission =
    numSubmissionType === 0 ||
    normalizedSubmissionType.includes('text') ||
    Boolean(data?.submittedContent?.trim() && !data?.submittedDocumentUrl);

  const submittedFileUrl = data?.submittedDocumentUrl;
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
        <FormSectionCard
          title="Student Details"
          icon={GlobalIcons.assigned}
          descriptionTooltip="The student and roll number for this assignment submission."
          sx={{ height: 1, minWidth: 0 }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <Avatar
                alt={data?.studentName || 'Student'}
                sx={{ bgcolor: 'background.neutral', color: 'text.primary', flexShrink: 0 }}
              >
                {data?.studentName?.charAt(0)?.toUpperCase() || 'S'}
              </Avatar>
              <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                <Typography variant="body2">{data?.studentName || 'Not available'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Roll no: {data?.rollNumber || 'Not available'}
                  {data?.assignments ? ` • ${data.assignments}` : ''}
                </Typography>
              </Box>
            </Stack>
            {data?.submissionDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Submitted on
                </Typography>
                <Typography variant="body2">{fDateTime(data.submissionDate)}</Typography>
              </Box>
            )}
          </Stack>
        </FormSectionCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
        <FormSectionCard
          title="Student Submission"
          icon={GlobalIcons.documentIcon}
          descriptionTooltip="The submission method and any text provided by the student. Uploaded files appear in Student Submission Attachments."
          sx={{ height: 1, minWidth: 0 }}
        >
          <Box sx={{ overflowWrap: 'anywhere' }}>
            {isInPersonSubmission ? (
              <>
                <Typography variant="body2">In-person submission</Typography>
                <Typography variant="body2" color="text.secondary">
                  Submission is handled in person.
                </Typography>
              </>
            ) : isNoSubmissionRequired ? (
              <>
                <Typography variant="body2">No submission required</Typography>
                <Typography variant="body2" color="text.secondary">
                  Task assigned for practice.
                </Typography>
              </>
            ) : isOnlineTextSubmission && data?.submittedContent?.trim() ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {data.submittedContent}
              </Typography>
            ) : submittedFileUrl ? (
              <Typography variant="body2">File submission</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No submission file or text submitted.
              </Typography>
            )}
          </Box>
        </FormSectionCard>
      </Grid>
    </>
  );
}
