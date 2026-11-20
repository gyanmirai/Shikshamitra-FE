import type { CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

import CertificateDocumentPreview from './certificate-document-preview';

export default function CertificatePreviewDialog({
  open,
  title,
  certificates,
  busy,
  closeLocked = false,
  progress,
  error,
  onClose,
  onGenerate,
}: {
  open: boolean;
  title: string;
  certificates: CertificateResponse[];
  busy?: boolean;
  closeLocked?: boolean;
  progress?: string;
  error?: string;
  onClose: () => void;
  onGenerate?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const certificate = certificates[Math.min(index, Math.max(certificates.length - 1, 0))];
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={title}
      titleInfo={
        onGenerate
          ? 'Review each selected student’s certificate before generating the batch. Certificate numbers are assigned during generation.'
          : 'Review the issued certificate and its student details.'
      }
      maxWidth="md"
      hasForm={false}
      disableClose={closeLocked}
      hasUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {busy && (
            <Box role="status">
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {progress || 'Preparing certificates…'}
              </Typography>
            </Box>
          )}
          {error && (
            <StudentFeedback notificationKey="STU-0793" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          {certificates.length > 1 && (
            <CustomSelect
              size="small"
              label="Student preview"
              value={String(Math.min(index, certificates.length - 1))}
              options={certificates.map((item, i) => ({
                id: String(i),
                name: item.student.studentName,
              }))}
              labelKey="name"
              valueKey="id"
              isSearch
              onChange={(value) => setIndex(Number(value))}
              disabled={busy}
            />
          )}
          {certificate && <CertificateDocumentPreview certificate={certificate} />}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mingcute:close-line" />}
          onClick={onClose}
          disabled={closeLocked}
        >
          Close
        </Button>
        {onGenerate && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="solar:document-add-bold" />}
            onClick={onGenerate}
            loading={busy}
            disabled={busy || !certificates.length}
          >
            Generate certificates ({certificates.length})
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
