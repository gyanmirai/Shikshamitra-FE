'use client';

import type { CustomBreadcrumbsProps } from 'src/components/custom-breadcrumbs/types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useStudentSetupEmbedding, useStudentSetupFormState } from './StudentSetupEmbeddingProvider';

export function StudentSetupManagerHeader(props: CustomBreadcrumbsProps & { editorOpen?: boolean; dirty?: boolean; busy?: boolean }) {
  const { editorOpen = false, dirty = false, busy = false, ...header } = props;
  useStudentSetupFormState({ dirty: editorOpen || dirty, busy });
  const { embedded } = useStudentSetupEmbedding();
  if (!embedded) return <CustomBreadcrumbs {...header} />;
  const { action, isBack, onBack, heading } = props;
  if (!action && !isBack) return null;
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      sx={{ px: 1, py: 1, flexShrink: 0 }}
    >
      {isBack && (
        <>
          <Button size="small" variant="outlined" color="inherit" onClick={onBack}>
            Back to settings
          </Button>
          <Typography variant="subtitle1" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            {heading}
          </Typography>
        </>
      )}
      {action && (
        <Box sx={{ ml: 'auto', minWidth: 0, '& > *': { flexWrap: 'wrap' } }}>{action}</Box>
      )}
    </Stack>
  );
}


