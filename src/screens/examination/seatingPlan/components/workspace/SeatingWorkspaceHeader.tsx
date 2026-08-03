import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Box, Chip, Button, Divider, Tooltip, MenuList, MenuItem, Typography, IconButton } from '@mui/material';

interface Props {
  examName?: string;
  examTypeName?: string;
  standardName?: string;
  isDirty?: boolean;
  isSaving?: boolean;
  isReadOnly?: boolean;
  canAutoAllocate: boolean;
  canFinalize: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onAutoAllocate: () => void;
  onReview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function SeatingWorkspaceHeader({
  examName,
  examTypeName,
  standardName,
  isDirty,
  isSaving,
  isReadOnly,
  canAutoAllocate,
  canFinalize,
  onBack,
  onSaveDraft,
  onAutoAllocate,
  onReview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const morePopover = usePopover();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <IconButton size="small" onClick={onBack}>
          <Iconify icon="mdi:arrow-left" width={18} />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          {examName ?? 'Seating Plan'}
        </Typography>
        {examTypeName && <Chip size="small" variant="outlined" label={examTypeName} />}
        {standardName && <Chip size="small" color="primary" variant="soft" label={standardName} />}
        <Chip
          size="small"
          variant="outlined"
          color={isDirty ? 'warning' : 'success'}
          icon={<Iconify icon={isDirty ? 'mdi:content-save-alert-outline' : 'mdi:check-circle-outline'} width={14} />}
          label={isDirty ? 'Unsaved changes' : 'Saved'}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton size="small" disabled={!canUndo} onClick={onUndo}>
              <Iconify icon="mdi:undo" width={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <span>
            <IconButton size="small" disabled={!canRedo} onClick={onRedo}>
              <Iconify icon="mdi:redo" width={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
          onClick={onSaveDraft}
          disabled={isSaving || isReadOnly}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={!canAutoAllocate}
          startIcon={<Iconify icon="mdi:auto-fix" width={16} />}
          onClick={onAutoAllocate}
        >
          Auto Allocate
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={!canFinalize}
          startIcon={<Iconify icon="mdi:clipboard-check-outline" width={16} />}
          onClick={onReview}
        >
          Review
        </Button>
        <IconButton size="small" onClick={morePopover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" width={18} />
        </IconButton>
        <CustomPopover open={morePopover.open} anchorEl={morePopover.anchorEl} onClose={morePopover.onClose}>
          <MenuList sx={{ minWidth: 200 }}>
            <MenuItem disabled>
              <Iconify icon="mdi:file-export-outline" width={16} style={{ marginRight: 8 }} />
              Export
            </MenuItem>
          </MenuList>
        </CustomPopover>
      </Box>
    </Box>
  );
}
