import { Iconify } from 'src/components/iconify';
import { Box, ButtonBase, Typography } from '@mui/material';

import { NODE_TYPE_META, type AcademicSetupNode } from './academic-setup-model';

export const AcademicSetupChildCard = ({
  node,
  onSelect,
}: {
  node: AcademicSetupNode;
  onSelect: (node: AcademicSetupNode) => void;
}) => {
  const meta = NODE_TYPE_META[node.type];
  const childCount = node.children?.length ?? 0;
  const childLabel = meta.childLabel.toLowerCase();
  const detail =
    node.type === 'Division'
      ? `${'strength' in node.data ? node.data.strength : '—'} student capacity`
      : `${childCount} ${childCount === 1 ? childLabel.replace(/s$/, '') : childLabel}`;

  return (
    <ButtonBase
      aria-label={`Open ${meta.label} ${node.name}`}
      onClick={() => onSelect(node)}
      sx={{
        width: '100%',
        minHeight: 64,
        p: 1,
        textAlign: 'left',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        justifyContent: 'flex-start',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {node.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      </Box>
      <Iconify icon="eva:arrow-ios-forward-fill" width={16} color="text.secondary" aria-hidden />
    </ButtonBase>
  );
};
