import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, Divider, Typography, DialogActions } from '@mui/material';

import type { CopySubjectItem, CopySelectionMode, CopyConflictStrategy } from './types';

type Props = {
  open: boolean;
  isLoading: boolean;
  sourceClassName?: string;
  targetClassName?: string;
  selectionMode: CopySelectionMode;
  selectedSubjects: CopySubjectItem[];
  includeDocuments: boolean;
  includeTeachers: boolean;
  conflictStrategy: CopyConflictStrategy;
  onClose: () => void;
  onConfirm: () => void;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export function SubjectCopyConfirmDialog(props: Props) {
  const {
    open,
    isLoading,
    sourceClassName,
    targetClassName,
    selectionMode,
    selectedSubjects,
    includeDocuments,
    includeTeachers,
    conflictStrategy,
    onClose,
    onConfirm,
  } = props;
  const included = [includeDocuments && 'Documents', includeTeachers && 'Teachers']
    .filter(Boolean)
    .join(', ');

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="xs"
      title="Review and confirm"
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Check the details below before creating draft allocations in the destination class.
          </Typography>

          <PaperPath source={sourceClassName} target={targetClassName} />

          <Box>
            <SummaryRow
              label="Subjects"
              value={
                selectionMode === 'ALL' ? 'All subjects' : `${selectedSubjects.length} selected`
              }
            />
            <Divider />
            <SummaryRow label="Supporting data" value={included || 'None'} />
            <Divider />
            <SummaryRow
              label="Existing subjects"
              value={conflictStrategy === 'SKIP' ? 'Keep destination settings' : 'Replace settings'}
            />
          </Box>

          <Alert severity="warning" variant="outlined">
            Copied allocations are saved as drafts so they can be reviewed before publishing.
          </Alert>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="text" color="inherit" size="small" disabled={isLoading} onClick={onClose}>
          Back
        </Button>
        <SubmitButton
          buttonText="Copy allocations"
          loading={isLoading}
          startIcon={<Iconify icon="solar:copy-outline" />}
          onClick={onConfirm}
        />
      </DialogActions>
    </CustomDialog>
  );
}

function PaperPath({ source, target }: { source?: string; target?: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        gap: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          From
        </Typography>
        <Typography variant="subtitle2" noWrap>
          {source || '—'}
        </Typography>
      </Box>
      <Iconify icon="solar:arrow-right-outline" width={20} color="text.disabled" />
      <Box textAlign="right">
        <Typography variant="caption" color="text.secondary">
          To
        </Typography>
        <Typography variant="subtitle2" noWrap>
          {target || '—'}
        </Typography>
      </Box>
    </Box>
  );
}
