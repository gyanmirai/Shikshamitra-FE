import { Iconify } from 'src/components/iconify';
import { Box, Tooltip, IconButton } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

export const AcademicSetupSidebarHeader = ({
  hasExpandedNodes,
  onCollapseAll,
}: {
  hasExpandedNodes: boolean;
  onCollapseAll: () => void;
}) => (
  <Box
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 1,
      p: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <FormSectionHeader
      icon="mdi:file-tree-outline"
      iconSize={16}
      title="Hierarchy"
      descriptionTooltip="Open a branch to move from board to division. Select a record to view its details."
      action={
        hasExpandedNodes ? (
          <Tooltip title="Collapse all branches">
            <IconButton
              type="button"
              size="small"
              aria-label="Collapse all branches"
              onClick={onCollapseAll}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                color: 'text.secondary',
                bgcolor: 'background.neutral',
              }}
            >
              <Iconify icon="mdi:unfold-less-horizontal" width={16} aria-hidden />
            </IconButton>
          </Tooltip>
        ) : null
      }
    />
  </Box>
);
