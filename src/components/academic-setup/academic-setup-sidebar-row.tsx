import { Iconify } from 'src/components/iconify';
import { Box, Tooltip, ListItemText, ListItemButton } from '@mui/material';

import { NODE_TYPE_META, type AcademicSetupNode } from './academic-setup-model';

type AcademicSetupSidebarRowProps = {
  node: AcademicSetupNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
};

export const AcademicSetupSidebarRow = ({
  node,
  depth,
  isSelected,
  isExpanded,
  onClick,
}: AcademicSetupSidebarRowProps) => {
  const meta = NODE_TYPE_META[node.type];
  const childCount = node.children?.length ?? 0;
  const hasChildren = childCount > 0;

  return (
    <ListItemButton
      selected={isSelected}
      aria-label={`View ${meta.label} ${node.name}`}
      aria-expanded={hasChildren ? isExpanded : undefined}
      data-testid={`hierarchy-tree-row-${node.id}`}
      onClick={onClick}
      sx={{
        minHeight: 48,
        px: 1,
        py: 0.5,
        mx: 1,
        mb: 1,
        width: 'auto',
        border: '1px solid',
        borderColor: isSelected ? 'text.secondary' : 'transparent',
        borderRadius: 1.5,
        color: 'text.primary',
        bgcolor: isSelected ? 'background.neutral' : 'transparent',
        touchAction: 'manipulation',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        '&:hover': {
          bgcolor: isSelected ? 'background.neutral' : 'action.hover',
          borderColor: isSelected ? 'text.secondary' : 'divider',
        },
        '&.Mui-selected': { bgcolor: 'background.neutral' },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <Tooltip title={node.name} placement="right" enterDelay={700}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <ListItemText
            primary={node.name}
            secondary={`Level ${depth + 1} · ${meta.label}`}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 700, noWrap: true }}
            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary', noWrap: true }}
          />
        </Box>
      </Tooltip>

      {hasChildren ? (
        <Box sx={{ ml: 0.5, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {depth < 2 ? (
            <Box
              component="span"
              aria-hidden
              sx={{
                minWidth: 24,
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
                typography: 'caption',
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {childCount}
            </Box>
          ) : null}
          <Box sx={{ width: 28, height: 44, display: 'grid', placeItems: 'center' }}>
            <Iconify
              icon="eva:arrow-ios-forward-fill"
              width={16}
              aria-hidden
              sx={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 180ms ease',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            />
          </Box>
        </Box>
      ) : null}
    </ListItemButton>
  );
};
