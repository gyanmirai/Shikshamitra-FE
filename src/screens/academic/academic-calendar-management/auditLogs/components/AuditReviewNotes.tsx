'use client';

import dayjs from 'dayjs';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Stack, Paper, Avatar, Typography } from '@mui/material';

import AuditReviewNoteForm from './AuditReviewNoteForm';
import { getUserInitials } from '../utils/auditFormatters';

import type { AuditReviewNote } from '../types/auditLogs.types';

interface Props {
  notes?: AuditReviewNote[];
  canAddNote?: boolean;
  onAdd?: (note: string) => Promise<void> | void;
}

/** List of review notes with an optional add form. */
const AuditReviewNotes = ({ notes = [], canAddNote = true, onAdd }: Props) => {
  const theme = useTheme();

  return (
    <Stack spacing={1}>
      {notes.length === 0 && !canAddNote && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            No review notes added.
          </Typography>
        </Paper>
      )}

      {notes.map((note) => (
        <Paper
          key={note.id}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            borderColor: alpha(theme.palette.info.main, 0.2),
            backgroundColor: alpha(theme.palette.info.main, 0.02),
          }}
        >
          <Stack direction="row" alignItems="flex-start" gap={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: alpha(theme.palette.info.main, 0.12),
                color: 'info.main',
              }}
            >
              {getUserInitials(note.createdBy)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="caption" fontWeight={700}>
                  {note.createdBy}
                </Typography>
                {note.createdByRole && (
                  <Typography variant="caption" color="text.secondary">
                    · {note.createdByRole}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  · {dayjs(note.createdAt).format('DD-MM-YYYY, hh:mm A')}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {note.note}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}

      {canAddNote && onAdd && <AuditReviewNoteForm onAdd={onAdd} />}
    </Stack>
  );
};

export default AuditReviewNotes;
