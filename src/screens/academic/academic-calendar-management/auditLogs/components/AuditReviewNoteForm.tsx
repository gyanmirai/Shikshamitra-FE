'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, TextField } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import {
  AUDIT_REVIEW_NOTE_MAX_LENGTH,
  AUDIT_REVIEW_NOTE_MAX_LENGTH_MESSAGE,
} from '../constants/auditLogs.constants';

interface Props {
  onAdd: (note: string) => Promise<void> | void;
}

const getReviewNoteErrorMessage = (error: unknown) => {
  const { detail } = parseApiProblemDetail(error);
  const normalizedDetail = detail.toLowerCase();

  if (
    normalizedDetail.includes('note') &&
    normalizedDetail.includes('maximum length') &&
    normalizedDetail.includes(String(AUDIT_REVIEW_NOTE_MAX_LENGTH))
  ) {
    return AUDIT_REVIEW_NOTE_MAX_LENGTH_MESSAGE;
  }

  return detail === 'Something went wrong'
    ? 'Review note could not be added. Please try again.'
    : detail;
};

/** Bounded review-note form with inline and toast feedback for rejected submissions. */
const AuditReviewNoteForm = ({ onAdd }: Props) => {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleAdd = async () => {
    const note = draft.trim();
    if (!note) return;

    setSaving(true);
    setSubmissionError('');
    try {
      await onAdd(note);
      setDraft('');
    } catch (error) {
      const message = getReviewNoteErrorMessage(error);
      setSubmissionError(message);
      shikshaMitraToast.error({ message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <TextField
        id="audit-review-note"
        fullWidth
        size="small"
        multiline
        rows={2}
        label="Review note"
        placeholder="Add a review note for this audit log..."
        value={draft}
        error={Boolean(submissionError)}
        helperText={
          <Stack component="span" direction="row" justifyContent="space-between" gap={1}>
            <Box component="span" role={submissionError ? 'alert' : undefined}>
              {submissionError || `Maximum ${AUDIT_REVIEW_NOTE_MAX_LENGTH} characters`}
            </Box>
            <Box component="span" sx={{ flexShrink: 0 }}>
              {draft.length} / {AUDIT_REVIEW_NOTE_MAX_LENGTH}
            </Box>
          </Stack>
        }
        onChange={(event) => {
          setDraft(event.target.value.slice(0, AUDIT_REVIEW_NOTE_MAX_LENGTH));
          setSubmissionError('');
        }}
        slotProps={{
          htmlInput: { maxLength: AUDIT_REVIEW_NOTE_MAX_LENGTH },
        }}
        sx={{ mb: 1 }}
      />
      <Stack direction="row" justifyContent="flex-end">
        <LoadingButton
          size="small"
          variant="contained"
          color="info"
          loading={saving}
          disabled={!draft.trim()}
          onClick={handleAdd}
          startIcon={<Iconify icon="mdi:comment-plus-outline" width={16} />}
        >
          Add Note
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default AuditReviewNoteForm;
