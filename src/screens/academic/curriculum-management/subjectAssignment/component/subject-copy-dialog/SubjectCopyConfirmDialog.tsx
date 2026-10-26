import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { FormSectionCard } from 'src/components/form-section-card';
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
      <Typography variant="body2" textAlign="right" sx={{ overflowWrap: 'anywhere' }}>
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
      title="Review Copy"
      titleInfo="Review the source, destination and copy settings before creating draft allocations."
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={isLoading}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <FormSectionCard
            icon={GlobalIcons.copy}
            title="Copy Summary"
            descriptionTooltip="Check the selected classes, subjects and supporting data. The existing-subject choice controls whether matching allocations are kept or replaced."
          >
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
                value={
                  conflictStrategy === 'SKIP' ? 'Keep destination settings' : 'Replace settings'
                }
              />
            </Box>
          </FormSectionCard>

          <Alert severity="warning" variant="outlined">
            Copied allocations are saved as drafts so they can be reviewed before publishing.
          </Alert>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          disabled={isLoading}
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
        >
          Back
        </Button>
        <SubmitButton
          buttonText="Copy allocations"
          type="button"
          loading={isLoading}
          startIcon={<Iconify icon={GlobalIcons.copy} />}
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
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          From
        </Typography>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {source || '—'}
        </Typography>
      </Box>
      <Iconify icon="solar:arrow-right-outline" width={20} color="text.disabled" />
      <Box textAlign="right">
        <Typography variant="caption" color="text.secondary">
          To
        </Typography>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {target || '—'}
        </Typography>
      </Box>
    </Box>
  );
}
