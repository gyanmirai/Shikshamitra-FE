import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Button, Typography } from '@mui/material';

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
    <Scrollbar data-testid="permission-matrix-mobile" sx={{ flex: 1, minHeight: 0 }}>
      {rows.length
        ? rows.map((row) =>
            row.group ? (
              <Button
                key={row.id}
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
                sx={{ minHeight: 44, ml: row.depth }}
              >
                {row.title}
              </Button>
            ) : (
              <Box
                key={row.id}
                data-testid={`permission-${row.title}`}
                sx={{
                  mb: 2,
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
                  <Typography variant="subtitle2">{row.title}</Typography>
                  {user && row.actions.some((action) => action.overridden) && (
                    <Typography variant="caption" color="text.secondary">
                      User override
                    </Typography>
                  )}
                </Stack>
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
    </Scrollbar>
  );
}
