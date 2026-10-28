'use client';

import type { CustomBreadcrumbsProps } from 'src/components/custom-breadcrumbs/types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAcademicSetupEmbedding } from './AcademicSetupEmbeddingProvider';

export function AcademicSetupManagerHeader(props: CustomBreadcrumbsProps) {
  const { embedded } = useAcademicSetupEmbedding();
  if (!embedded) return <CustomBreadcrumbs {...props} />;
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
