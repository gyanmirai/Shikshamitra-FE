'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Button, Stack, TextField, Typography, DialogActions } from '@mui/material';
import { Label } from 'src/components/label';

import { getStudentName } from '../types';
import type { Academic360StudentRow, Academic360Alert } from '../types';

type NotifyParentDialogProps = {
  open: boolean;
  student: Academic360StudentRow | null;
  alerts?: Academic360Alert[];
  onClose: () => void;
};

const buildDefaultMessage = (student: Academic360StudentRow, alerts: Academic360Alert[]) => {
  const name = getStudentName(student) || 'your ward';
  const cls = student.standardName ?? student.standard ?? '';
  const div = student.divisionName ?? student.division ?? '';
  const classPart = cls ? ` of ${cls}${div ? ` ${div}` : ''}` : '';

  const alertSummary =
    alerts.length > 0
      ? `\n\nAcademic concern(s) noted:\n${alerts.map((a, i) => `${i + 1}. ${a.title}: ${a.message}`).join('\n')}`
      : '';

  return `Dear Parent,\n\nThis is an important update regarding ${name}${classPart}.${alertSummary}\n\nPlease reach out to us at your earliest convenience to discuss the student's academic progress.\n\nRegards,\nShikshaMitra Team`;
};

export function NotifyParentDialog({ open, student, alerts = [], onClose }: NotifyParentDialogProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reset message when dialog opens with a new student
  React.useEffect(() => {
    if (open && student) {
      setMessage(buildDefaultMessage(student, alerts));
    }
  }, [open, student, alerts]);

  const handleSend = async () => {
    if (!message.trim()) {
      shikshaMitraToast.warning({ message: 'Please enter a message before sending.' });
      return;
    }
    setIsSending(true);
    try {
      // Placeholder — integrate with parent-communication API in follow-up
      await new Promise((resolve) => setTimeout(resolve, 800));
      shikshaMitraToast.success({ message: 'Notification sent to parent successfully.' });
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to send notification. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const studentName = student ? getStudentName(student) : '';

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="sm"
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            Notify Parent
          </Box>
          {studentName && (
            <Label color="info" variant="soft">{studentName}</Label>
          )}
        </Box>
      }
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {alerts.length > 0 && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.light' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:alert-circle-outline" width={16} sx={{ color: 'warning.main', flexShrink: 0 }} />
                <Typography variant="caption" color="warning.dark">
                  {alerts.length} academic alert{alerts.length > 1 ? 's' : ''} detected — pre-filled below.
                </Typography>
              </Stack>
            </Box>
          )}

          <TextField
            label="Message"
            multiline
            minRows={6}
            maxRows={14}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            size="small"
            helperText="This message will be sent to the student's registered parent / guardian."
          />
        </Stack>

        <DialogActions sx={{ p: 0, pt: 2, boxShadow: 'none' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={isSending}
            startIcon={<Iconify icon={isSending ? 'mdi:loading' : 'mdi:send'} />}
            onClick={handleSend}
          >
            {isSending ? 'Sending…' : 'Send Notification'}
          </Button>
        </DialogActions>
      </DialogScrollContent>
    </CustomDialog>
  );
}
