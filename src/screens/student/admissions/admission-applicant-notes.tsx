'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Alert, Stack, Button, TextField, Typography, CardContent } from '@mui/material';
import {
  useCreateAdmissionApplicantNoteMutation,
  useUpdateAdmissionApplicantNoteMutation,
} from 'src/redux/student/admissions/admission-applicants-api';

type Note = { id: string; text: string; creationTime: string; lastEditedAt?: string | null };
type Props = { applicantId: string; notes: Note[] };

export default function AdmissionApplicantNotes({ applicantId, notes }: Props) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createNote, createState] = useCreateAdmissionApplicantNoteMutation();
  const [updateNote, updateState] = useUpdateAdmissionApplicantNoteMutation();
  const isSaving = createState.isLoading || updateState.isLoading;
  const save = async () => {
    if (!text.trim()) return;
    try {
      if (editingId)
        await updateNote({ applicantId, noteId: editingId, text: text.trim() }).unwrap();
      else await createNote({ applicantId, text: text.trim() }).unwrap();
      setText('');
      setEditingId(null);
      shikshaMitraToast.success({ message: editingId ? 'Note updated' : 'Note added' });
    } catch (error) {
      shikshaMitraToast.error({
        message: (error as { data?: { detail?: string } })?.data?.detail || 'Unable to save note',
      });
    }
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notes
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            multiline
            minRows={3}
            label={editingId ? 'Edit note' : 'Add note'}
            value={text}
            onChange={(event) => setText(event.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <LoadingButton
              loading={isSaving}
              variant="contained"
              onClick={save}
              disabled={!text.trim()}
            >
              {editingId ? 'Update note' : 'Add note'}
            </LoadingButton>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setText('');
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          {notes.length ? (
            notes.map((note) => (
              <Box key={note.id} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{note.text}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.creationTime).toLocaleString()}
                    {note.lastEditedAt
                      ? ` · edited ${new Date(note.lastEditedAt).toLocaleString()}`
                      : ''}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingId(note.id);
                      setText(note.text);
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Box>
            ))
          ) : (
            <Alert severity="info">No notes yet.</Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
