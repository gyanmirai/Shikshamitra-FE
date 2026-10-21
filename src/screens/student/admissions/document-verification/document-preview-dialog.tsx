import type { AdmissionDocumentEvidence } from 'src/redux/student/admissions/admission-document-types';

import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { DocumentPreviewContent } from './document-preview-content';

export function DocumentPreviewDialog({
  evidence,
  name,
  onClose,
}: {
  evidence: AdmissionDocumentEvidence;
  name: string;
  onClose: () => void;
}) {
  return (
    <CustomDialog
      open
      title={`${name} · Document Preview`}
      handleClose={onClose}
      maxWidth="lg"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { height: '85dvh' } }}
    >
      <DialogScrollContent
        scrollBarProps={{
          fillContent: true,
          sx: { flex: 1, minHeight: 0 },
          slotProps: { content: { height: 1, minHeight: 0 } },
        }}
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <DocumentPreviewContent evidence={evidence} name={name} />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
