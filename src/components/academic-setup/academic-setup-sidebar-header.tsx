import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';

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
      p: 1.25,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 44 }}>
      <Iconify icon="solar:tree-bold-duotone" width={22} color="primary.main" aria-hidden />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Hierarchy navigator
        </Typography>
      </Box>
      {hasExpandedNodes ? (
        <Button
          type="button"
          size="small"
          color="inherit"
          onClick={onCollapseAll}
          startIcon={<Iconify icon="eva:arrow-ios-upward-fill" aria-hidden />}
          sx={{ minHeight: 32, px: 1, flexShrink: 0 }}
        >
          Collapse
        </Button>
      ) : null}
    </Box>
    <Typography variant="caption" color="text.secondary">
      Open a branch to move from board to division
    </Typography>
  </Box>
);
