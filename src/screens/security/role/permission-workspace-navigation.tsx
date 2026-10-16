import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Button, Collapse, Typography } from '@mui/material';

import type { NavigationPermission } from './permission-catalogue';

export default function PermissionWorkspaceNavigation({
  modules,
  selectedModule,
  selectedSubmodule,
  onModule,
  onSubmodule,
  visibility = false,
  disabled,
  bulkActions,
}: {
  modules: NavigationPermission[];
  selectedModule?: string;
  selectedSubmodule?: string;
  onModule: (module: NavigationPermission) => void;
  onSubmodule: (node: NavigationPermission) => void;
  visibility?: boolean;
  disabled: boolean;
  bulkActions?: ReactNode;
}) {
  return (
    <Box
      component="nav"
      aria-label="Permission modules"
      sx={{
        width: { xs: '100%', md: 212 },
        flexShrink: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.neutral',
        height: { xs: 210, md: '100%' },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: { xs: 'none', md: 'block' } }}>
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}
        >
          Modules
        </Typography>
      </Box>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ p: { xs: 1, md: 1.5 } }} spacing={0.5}>
          {modules.map((module) => {
            const active = selectedModule === module.title;
            return (
              <Box key={module.title}>
                <Button
                  fullWidth
                  color="inherit"
                  disabled={disabled}
                  aria-pressed={active}
                  aria-expanded={visibility ? undefined : active}
                  onClick={() => onModule(module)}
                  startIcon={module.icon}
                  sx={(theme) => ({
                    justifyContent: 'flex-start',
                    px: 1.5,
                    py: 0.75,
                    minHeight: { xs: 44, md: 40 },
                    '& .MuiButton-startIcon > *': { width: 18, height: 18 },
                    color: active ? 'primary.dark' : 'text.primary',
                    bgcolor: active
                      ? varAlpha(theme.vars.palette.primary.mainChannel, 0.1)
                      : undefined,
                    ...theme.applyStyles('dark', {
                      color: active ? 'primary.light' : 'text.primary',
                    }),
                  })}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      textAlign: 'left',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {module.title}
                  </Typography>
                </Button>
                {!visibility && (
                  <Collapse in={active} timeout={0} unmountOnExit>
                    <Stack
                      spacing={0.25}
                      sx={{
                        ml: 2.5,
                        pl: 1,
                        my: 0.75,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {(module.submodule ?? []).map((node) => {
                        const selected = selectedSubmodule === node.title;
                        return (
                          <Button
                            key={node.title}
                            fullWidth
                            color="inherit"
                            disabled={disabled}
                            aria-pressed={selected}
                            aria-current={selected ? 'page' : undefined}
                            onClick={() => onSubmodule(node)}
                            sx={(theme) => ({
                              justifyContent: 'flex-start',
                              minHeight: { xs: 44, md: 36 },
                              px: 1,
                              fontSize: 12,
                              textAlign: 'left',
                              color: selected ? 'primary.dark' : 'text.primary',
                              fontWeight: selected ? 700 : 500,
                              bgcolor: selected ? theme.vars.palette.background.paper : undefined,
                              ...theme.applyStyles('dark', {
                                color: selected ? 'primary.light' : 'text.primary',
                              }),
                            })}
                          >
                            {node.title}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Stack>
      </Scrollbar>
      {bulkActions && (
        <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.75 }}>
            All modules
          </Typography>
          {bulkActions}
        </Box>
      )}
    </Box>
  );
}
