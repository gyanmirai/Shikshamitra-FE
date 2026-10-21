import type { LabelColor } from 'src/components/label';

import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Checkbox, Typography } from '@mui/material';

import type { SelectionStatus, AcademicSelectionNode } from './academic-selection-model';

const colors: Record<AcademicSelectionNode['type'], LabelColor> = {
  boards: 'primary',
  mediums: 'secondary',
  organizations: 'info',
  standards: 'warning',
  divisions: 'default',
};

export function AcademicSelectionRow({
  node,
  status,
  expanded,
  onExpand,
  onToggle,
}: {
  node: AcademicSelectionNode;
  status: SelectionStatus;
  expanded: boolean;
  onExpand: () => void;
  onToggle: (node: AcademicSelectionNode) => void;
}) {
  const checkboxId = useId();
  const hasChildren = Boolean(node.children?.length);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 0.5,
        position: 'relative',
        zIndex: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Box
        component="button"
        type="button"
        disabled={!hasChildren}
        aria-label={`Expand ${node.name}`}
        aria-expanded={hasChildren ? expanded : undefined}
        onClick={hasChildren ? onExpand : undefined}
        sx={{
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          flexShrink: 0,
          mr: 1,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasChildren ? 'pointer' : 'default',
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' },
        }}
      >
        {hasChildren && (
          <Iconify
            icon={expanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={18}
            height={18}
          />
        )}
      </Box>
      <Checkbox
        id={checkboxId}
        inputProps={{
          'aria-label': `Access to ${node.name}`,
          'aria-checked': status === 'partial' ? 'mixed' : status === 'full',
        }}
        checked={status === 'full'}
        indeterminate={status === 'partial'}
        onChange={() => onToggle(node)}
        size="small"
        disableRipple
        sx={{ p: 0.5, mr: 1 }}
      />
      <Box
        component="label"
        htmlFor={checkboxId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
          flex: 1,
          cursor: 'pointer',
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: hasChildren ? 600 : 400, overflowWrap: 'anywhere' }}
        >
          {node.name}
        </Typography>
        <Chip
          label={node.type}
          size="small"
          variant="soft"
          color={colors[node.type]}
          sx={{
            height: 20,
            fontSize: '0.7rem',
            borderRadius: 0.5,
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        />
      </Box>
    </Box>
  );
}
