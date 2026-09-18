'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Card, Paper, Stack, Button, TextField, Typography, CardContent } from '@mui/material';
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
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Team notes</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep internal context for the next counselor or admissions staff member.
            </Typography>
          </Box>
          <TextField
            multiline
            minRows={2}
            maxRows={6}
            label={editingId ? 'Edit note' : 'Add note'}
            placeholder="Add useful family context, preferences, or an agreed follow-up…"
            value={text}
            onChange={(event) => setText(event.target.value)}
            fullWidth
            inputProps={{ maxLength: 2000 }}
            helperText={`${text.length}/2000 characters`}
          />
          <Stack direction="row" spacing={1}>
            <LoadingButton
              loading={isSaving}
              variant="contained"
              onClick={save}
              disabled={!text.trim()}
              startIcon={
                <Iconify icon={editingId ? 'mdi:content-save-outline' : 'mdi:note-plus-outline'} />
              }
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
            <Stack spacing={1.5}>
              {notes.map((note) => (
                <Paper key={note.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {note.text}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {fDateTime(note.creationTime) || 'Time not recorded'}
                      {note.lastEditedAt ? ` · edited ${fDateTime(note.lastEditedAt)}` : ''}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mdi:pencil-outline" />}
                      onClick={() => {
                        setEditingId(note.id);
                        setText(note.text);
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <EmptyContent
              filled
              title="No team notes yet"
              description="Add only context that helps staff support this family’s admission journey."
              sx={{ minHeight: 190 }}
              slotProps={{ img: { maxWidth: 80 } }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
