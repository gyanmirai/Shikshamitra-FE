import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { getVisibilityPermissionName } from './permission-grants';

import type { NavigationPermission } from './permission-catalogue';

export type PermissionNavigationNode = NavigationPermission;

export default function PermissionNavigation({
  title, description, nodes, selectedTitle, onSelect, findVisibility, disabled, submodules = false,
}: {
  title: string;
  description: string;
  nodes: PermissionNavigationNode[];
  selectedTitle?: string;
  onSelect: (node: PermissionNavigationNode) => void;
  findVisibility: (name: string | undefined) => boolean | undefined;
  disabled: boolean;
  submodules?: boolean;
}) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={submodules
        ? { p: 2.5, borderBottom: '1px dashed', borderColor: 'divider' }
        : { p: 2.5, bgcolor: 'background.neutral' }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{description}</Typography>
      </Box>
      <Scrollbar sx={submodules ? { p: 2 } : undefined}>
        <Stack spacing={submodules ? 1 : 0.5} sx={{ p: 1, pb: 8 }}>
          {nodes.map((node) => {
            const isSelected = selectedTitle === node.title;
            const hasVisibility = findVisibility(getVisibilityPermissionName(node));
            return (
              <Tooltip key={node.title} title={hasVisibility ? '' : 'Navigation is hidden. Use Set Module Visibility to change it.'}>
                <span>
                  <Button fullWidth size="large" startIcon={submodules ? undefined : node.icon}
                    onClick={() => onSelect(node)} disabled={disabled} aria-pressed={isSelected}
                    sx={{
                      justifyContent: 'flex-start', px: 2.5, py: 1.5, borderRadius: 1.5,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      bgcolor: isSelected
                        ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                        : submodules ? 'background.neutral' : 'transparent',
                      '&:hover': {
                        bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, submodules ? 0.08 : 0.04),
                      },
                      transition: 'all 0.2s',
                    }}>
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500 }}>{node.title}</Typography>
                    </Box>
                    {isSelected && <Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
                  </Button>
                </span>
              </Tooltip>
            );
          })}
          {submodules && nodes.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Iconify icon="solar:folder-with-files-broken" width={48} sx={{ mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">No sub-modules found</Typography>
            </Box>
          )}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
