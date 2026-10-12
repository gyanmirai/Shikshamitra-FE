import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type { CertificateType } from 'src/redux/student/records/student-record-documents-api';

import { RouterLink } from 'src/routes/components';
import { Box, Chip, Stack, Paper, Button, MenuItem, TextField, Typography } from '@mui/material';

import RecordsStudentPicker from '../records-student-picker';

const certificateTypes: { value: CertificateType; label: string }[] = [
  { value: 1, label: 'Bonafide' },
  { value: 2, label: 'Character' },
  { value: 3, label: 'Leaving' },
  { value: 4, label: 'First trial' },
];

type Props = {
  kind: 'certificates' | 'ids';
  busy: boolean;
  canIssue: boolean;
  showCertificateTypeSelect?: boolean;
  showCertificateBatch?: boolean;
  selectedStudentId?: string;
  selectedStudentName?: string;
  legacyEntryHref?: string;
  certificateType: CertificateType;
  reason: string;
  transitionId: string;
  exitsLoading: boolean;
  exitOptions: { id: string; label: string }[];
  batch: StudentDirectoryItem[];
  previewDisabled: boolean;
  issueDisabled: boolean;
  onSelect: (student: StudentDirectoryItem | null) => void;
  onCertificateTypeChange: (value: CertificateType) => void;
  onReasonChange: (value: string) => void;
  onTransitionChange: (value: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onFocusStudent?: (studentId: string) => void;
  onPreview: () => void;
  onIssue: () => void;
};

export default function RecordDocumentFilters({
  kind,
  busy,
  onSelect,
  canIssue,
  showCertificateTypeSelect = true,
  showCertificateBatch = false,
  selectedStudentId,
  selectedStudentName,
  legacyEntryHref,
  certificateType,
  onCertificateTypeChange,
  reason,
  onReasonChange,
  transitionId,
  exitsLoading,
  onTransitionChange,
  exitOptions,
  batch,
  onRemoveStudent,
  onFocusStudent,
  previewDisabled,
  onPreview,
  issueDisabled,
  onIssue,
}: Props) {
  const certificates = kind === 'certificates';
  return (
    <Paper sx={{ p: 1, borderRadius: 1.5, flexShrink: 0, '& .MuiInputBase-root': { minHeight: 40 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RecordsStudentPicker key={showCertificateBatch ? batch.length : 'single'}
            size="small" helperText={null} disabled={busy} onSelect={onSelect}
            includeActiveStudentList={certificates} />
        </Box>
        {canIssue && (
          <>
            {certificates ? (
              <>
                {showCertificateTypeSelect && (
                  <TextField select size="small" label="Certificate type" value={certificateType}
                    disabled={busy} onChange={event => onCertificateTypeChange(Number(event.target.value) as CertificateType)}
                    sx={{ width: { xs: 1, md: 180 } }}>
                    {certificateTypes.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                  </TextField>
                )}
                <TextField size="small" label="Purpose / reason" value={reason} disabled={busy}
                  onChange={event => onReasonChange(event.target.value)} inputProps={{ maxLength: 4000 }}
                  sx={{ flex: 1, minWidth: 0 }} />
                {certificateType === 3 && (
                  <TextField select size="small"
                    label={showCertificateBatch && selectedStudentName
                      ? `Exit case for ${selectedStudentName}`
                      : 'Graduation / withdrawal / transfer case'}
                    value={transitionId} disabled={busy || exitsLoading}
                    onChange={event => onTransitionChange(event.target.value)}
                    sx={{ flex: 1, minWidth: 0 }}>
                    <MenuItem value="">Select exit case</MenuItem>
                    {exitOptions.map(exit => <MenuItem key={exit.id} value={exit.id}>{exit.label}</MenuItem>)}
                  </TextField>
                )}
              </>
            ) : (
              <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center" sx={{ flex: 1, minHeight: 40 }}>
                {batch.map(student => (
                  <Chip key={student.studentId} size="small" disabled={busy}
                    label={[student.firstName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity'}
                    onDelete={() => onRemoveStudent(student.studentId)} />
                ))}
                <Typography variant="caption">{batch.length}/100 selected</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0, minHeight: 40 }}>
              <Button size="small" variant="outlined" disabled={previewDisabled} onClick={onPreview}>Preview</Button>
              <Button size="small" variant="contained" disabled={issueDisabled} onClick={onIssue} sx={{ whiteSpace: 'nowrap' }}>
                {certificates ? 'Generate certificate' : 'Issue cards'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
      {showCertificateBatch && canIssue && (
        <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center" sx={{ mt: 1 }}>
          {batch.map(student => (
            <Chip key={student.studentId} size="small" disabled={busy}
              color={student.studentId === selectedStudentId ? 'primary' : 'default'}
              variant={student.studentId === selectedStudentId ? 'filled' : 'outlined'}
              label={[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity'}
              onClick={() => onFocusStudent?.(student.studentId)}
              onDelete={() => onRemoveStudent(student.studentId)} />
          ))}
          <Typography variant="caption" color="text.secondary">
            {batch.length}/100 students selected
            {certificateType === 3 && batch.length > 0 ? ' · Select each name to choose its exit case.' : ''}
          </Typography>
          {legacyEntryHref && (
            <Button size="small" component={RouterLink} href={legacyEntryHref} sx={{ ml: 'auto' }}>
              Former student missing? Review historical entries
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}
