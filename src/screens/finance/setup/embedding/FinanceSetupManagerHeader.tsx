'use client';

import type { CustomBreadcrumbsProps } from 'src/components/custom-breadcrumbs/types';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useFinanceSetupEmbedding } from './FinanceSetupEmbeddingProvider';

/** Preserve native actions while the guide owns the heading and step context. */
export function FinanceSetupManagerHeader({
  editorOpen = false,
  ...props
}: CustomBreadcrumbsProps & { editorOpen?: boolean }) {
  const { embedded, setEditorOpen, actionContainer } = useFinanceSetupEmbedding();
  useEffect(() => {
    setEditorOpen?.(editorOpen);
    return () => setEditorOpen?.(false);
  }, [editorOpen, setEditorOpen]);
  if (!embedded) return <CustomBreadcrumbs {...props} />;
  if (!props.action && !props.isBack) return null;
  if (actionContainer && !props.isBack) {
    return createPortal(props.action, actionContainer);
  }
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      sx={{ px: 1, py: 1, flexShrink: 0 }}
    >
      {props.isBack && (
        <>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={props.onBack}
            startIcon={<Iconify icon={GlobalIcons.back} width={18} />}
          >
            Back to settings
          </Button>
          <Typography variant="subtitle1">{props.heading}</Typography>
        </>
      )}
      {props.action && (
        <Box sx={{ ml: 'auto', minWidth: 0, '& > *': { flexWrap: 'wrap' } }}>{props.action}</Box>
      )}
    </Stack>
  );
}
