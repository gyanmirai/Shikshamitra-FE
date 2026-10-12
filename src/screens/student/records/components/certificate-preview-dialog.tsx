import type { CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import { useState } from 'react';
import { fDate } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Paper, Alert, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

export default function CertificatePreviewDialog({ open, title, certificates, busy, progress, error, onClose, onGenerate }: {
  open: boolean; title: string; certificates: CertificateResponse[]; busy?: boolean; progress?: string;
  error?: string; onClose: () => void; onGenerate?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const certificate = certificates[Math.min(index, Math.max(certificates.length - 1, 0))];
  const number = certificate?.certificateId ? certificate.certificateNo : 'Assigned on generation';
  const header = certificate ? (certificate.certificateId ? certificate.template.renderedHeaderContent : certificate.template.renderedHeaderContent.replaceAll(certificate.certificateNo, number)) : '';
  const showNumber = !header.includes(number);
  const showDate = certificate && !header.includes(certificate.certificateData.IssueDate || certificate.issueDate.slice(0, 10)) && !header.includes(fDate(certificate.issueDate));
  return (
    <CustomDialog open={open} handleClose={onClose} title={title} maxWidth="md" hasForm={false} disableClose={busy} hasUnsavedChanges={false}>
      <DialogScrollContent>
        <Stack spacing={2}>
          {busy && <Box role="status"><LinearProgress /><Typography variant="body2" sx={{ mt: 1 }}>{progress || 'Preparing certificates…'}</Typography></Box>}
          {error && <Alert severity="error">{error}</Alert>}
          {certificates.length > 1 && <CustomSelect label="Student preview" value={String(Math.min(index, certificates.length - 1))}
            options={certificates.map((item, i) => ({ id: String(i), name: item.student.studentName }))}
            labelKey="name" valueKey="id" isSearch onChange={value => setIndex(Number(value))} disabled={busy} />}
          {certificate && (
            <Paper variant="outlined" aria-label={`Certificate preview for ${certificate.student.studentName}`}
              sx={{ p: { xs: 2, sm: 5 }, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Stack spacing={3}>
                <Typography variant="h6" align="center" sx={{ whiteSpace: 'pre-line' }}>{header}</Typography>
                {(showNumber || showDate) && <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
                  {showNumber && <Typography variant="body2">Certificate number: {number}</Typography>}
                  {showDate && <Typography variant="body2">Issue date: {fDate(certificate.issueDate)}</Typography>}
                </Stack>}
                <Typography variant="body1" sx={{ lineHeight: 2 }}>Student: <strong>{certificate.student.studentName}</strong><br />
                  GR number: {certificate.student.grNo || certificate.certificateData.GRNo || '—'}<br />
                  Class: {certificate.student.className || '—'} · Division: {certificate.student.divisionName || '—'}<br />
                  Academic year: {certificate.certificateData.AcademicYear || '—'}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', pt: 3 }}>{certificate.template.renderedFooterContent}</Typography>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Close</Button>
        {onGenerate && <Button variant="contained" onClick={onGenerate} loading={busy}
          disabled={busy || !certificates.length}>Generate certificates ({certificates.length})</Button>}
      </DialogActions>
    </CustomDialog>
  );
}
