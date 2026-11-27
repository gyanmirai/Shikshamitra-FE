import type { IFeeCategoryResponse } from 'src/redux/feeCategory/feeCategoryApi';

import React from 'react';
import { Box, Stack, Alert, Paper, Button, Skeleton, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { FormSectionCard } from 'src/components/form-section-card';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCategoryByIdQuery } from 'src/redux/feeCategory/feeCategoryApi';

interface IFeeCategoryViewProps {
  id: string;
}

const feeHeadMetadataRowSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  alignItems: 'start',
  columnGap: 1.5,
};

const FeeCategoryView: React.FC<IFeeCategoryViewProps> = ({ id }) => {
  const {
    currentData: category,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoryByIdQuery,
    params: id,
    popupConfig: { error: false },
  });

  if (isLoading || (isFetching && !category)) {
    return (
      <Stack spacing={2} role="status" aria-label="Loading fee category details">
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    );
  }

  if (isError || !category) {
    return (
      <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
        Fee category details could not be loaded.
      </Alert>
    );
  }

  const feeHeads: IFeeCategoryResponse['feeHeads'] = category.feeHeads ?? [];

  return (
    <Stack spacing={2} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      <FormSectionCard
        icon="mdi:file-document-outline"
        title="Category Details"
        titleTypographyProps={{ variant: 'subtitle1' }}
        descriptionTooltip="The saved category name, description, and current status."
      >
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 2fr) minmax(0, 3fr)' },
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box>
            <Typography component="dt" variant="body2" color="text.secondary" mb={0.5}>
              Category name
            </Typography>
            <Stack
              component="dd"
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              alignItems="center"
              sx={{ m: 0 }}
            >
              <Typography component="h3" variant="body2" sx={{ minWidth: 0, fontWeight: 600 }}>
                {category.name || '—'}
              </Typography>
              <Label color={category.isActive ? 'success' : 'default'}>
                {category.isActive ? 'Active' : 'Archived'}
              </Label>
            </Stack>
          </Box>
          <Box>
            <Typography component="dt" variant="body2" color="text.secondary" mb={0.5}>
              Description
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>
              {category.description?.trim() || 'No description provided.'}
            </Typography>
          </Box>
        </Box>
      </FormSectionCard>

      <FormSectionCard
        icon="mdi:clipboard-list-outline"
        title={`Fee Heads (${feeHeads.length})`}
        titleTypographyProps={{ variant: 'subtitle1' }}
        descriptionTooltip="Mapped fee heads with their descriptions, income categories, and concession settings."
      >
        {feeHeads.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No fee heads are mapped to this category.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              '& > article:last-of-type:nth-of-type(odd)': {
                gridColumn: '1 / -1',
              },
            }}
          >
            {feeHeads.map((head) => (
              <Paper
                key={head.id}
                component="article"
                aria-label={head.name || 'Unnamed fee head'}
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: { xs: 2, md: 2.5 },
                  minWidth: 0,
                  borderRadius: 2,
                }}
              >
                <Typography component="h3" variant="subtitle1">
                  {head.name || 'Unnamed fee head'}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {head.description?.trim() || 'No description provided.'}
                  </Typography>
                </Box>
                <Stack
                  component="dl"
                  spacing={1}
                  sx={{ m: 0, pt: 1.5, borderTop: 1, borderColor: 'divider' }}
                >
                  <Box sx={feeHeadMetadataRowSx}>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      Income category
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{ m: 0, textAlign: 'right' }}>
                      {head.incomeCategoryName || '—'}
                    </Typography>
                  </Box>
                  <Box sx={feeHeadMetadataRowSx}>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      Concession applicable
                    </Typography>
                    <Box component="dd" sx={{ m: 0, justifySelf: 'end' }}>
                      <Label color={head.isConcessionApplied ? 'success' : 'default'}>
                        {head.isConcessionApplied ? 'Yes' : 'No'}
                      </Label>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </FormSectionCard>
    </Stack>
  );
};

export default FeeCategoryView;
