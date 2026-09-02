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
        mx: 0.75,
        mb: 0.5,
        width: 'auto',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderRadius: 1.5,
        color: isSelected ? 'primary.main' : 'text.primary',
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        touchAction: 'manipulation',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        '&:hover': {
          bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
          borderColor: isSelected ? 'primary.main' : 'divider',
        },
        '&.Mui-selected': { bgcolor: 'primary.lighter' },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          mr: 1,
          flexShrink: 0,
          borderRadius: 1.25,
          display: 'grid',
          placeItems: 'center',
          bgcolor: isSelected ? 'background.paper' : 'action.hover',
          color: isSelected ? 'primary.main' : 'text.secondary',
        }}
      >
        <Iconify icon={meta.icon} width={18} aria-hidden />
      </Box>

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
