import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';

import PermissionBulkActions from './permission-bulk-actions';
import PermissionInlineEditor from './permission-inline-editor';

import type { PermissionMatrixProps } from './permission-matrix';

export default function PermissionMatrixMobile({
  rows,
  user,
  disabled,
  visibility,
  onChange,
  collapsed,
  toggleGroup,
  empty,
}: PermissionMatrixProps & {
  collapsed: Set<string>;
  toggleGroup: (id: string) => void;
  empty: ReactNode;
}) {
  return (
    <Box data-testid="permission-matrix-mobile">
      {rows.length
        ? rows.map((row) =>
            row.group ? (
              <Box
                key={row.id}
                data-testid={`permission-${row.title}`}
                sx={{
                  ml: row.depth * 2,
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => toggleGroup(row.id)}
                  disabled={disabled}
                  aria-label={`${collapsed.has(row.id) ? 'Expand' : 'Collapse'} ${row.title}`}
                  aria-expanded={!collapsed.has(row.id)}
                  startIcon={
                    <Iconify
                      icon={
                        collapsed.has(row.id)
                          ? 'eva:arrow-ios-forward-fill'
                          : 'eva:arrow-ios-downward-fill'
                      }
                    />
                  }
                  sx={{
                    minHeight: 44,
                    minWidth: 0,
                    px: 0,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    '& .MuiButton-startIcon': { ml: 0, mr: 1, width: 16 },
                    '& .MuiButton-startIcon > *': { width: 16, height: 16 },
                  }}
                >
                  {row.title}
                </Button>
                {!visibility && (
                  <Box sx={{ pl: 3 }}>
                    <PermissionBulkActions scope={row.title} nodes={[row.node]} />
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                key={row.id}
                data-testid={`permission-${row.title}`}
                sx={{
                  mb: 2,
                  ml: row.depth * 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ px: 1.5, py: 1 }}
                >
                  <Typography variant="subtitle2" sx={{ pl: 3, overflowWrap: 'anywhere' }}>
                    {row.title}
                  </Typography>
                  {user && row.actions.some((action) => action.overridden) && (
                    <Typography variant="caption" color="text.secondary">
                      User override
                    </Typography>
                  )}
                </Stack>
                {!visibility && (
                  <Box sx={{ pl: 4.5, pr: 1.5, pb: 1.5 }}>
                    <PermissionBulkActions scope={row.title} nodes={[row.node]} />
                  </Box>
                )}
                {row.actions.map((action) => (
                  <Box key={action.label} sx={{ px: 1.5, pb: 1.5 }}>
                    <PermissionInlineEditor
                      feature={row.title}
                      action={action}
                      user={user}
                      visibility={visibility}
                      disabled={disabled}
                      showLabel
                      onChange={(state) => onChange(row, action, state)}
                    />
                  </Box>
                ))}
              </Box>
            )
          )
        : empty}
    </Box>
  );
}
