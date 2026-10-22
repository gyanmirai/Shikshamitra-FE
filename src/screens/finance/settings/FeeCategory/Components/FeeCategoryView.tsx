import React from 'react';
import { Label } from 'src/components/label';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';
import { useGetFeeCategoryByIdQuery } from 'src/redux/feeCategory/feeCategoryApi';

interface IFeeCategoryViewProps {
  id: string;
}

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

  const feeHeads = category.feeHeads || [];

  return (
    <Stack spacing={2} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      <FormSectionCard
        icon="solar:tag-linear"
        title="Category Details"
        titleTypographyProps={{ variant: 'subtitle1' }}
        descriptionTooltip="The saved category name, description, and current status."
      >
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Category name
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography component="h3" variant="h6" sx={{ minWidth: 0 }}>
              {category.name || '—'}
            </Typography>
            <Label color={category.isActive ? 'success' : 'default'}>
              {category.isActive ? 'Active' : 'Archived'}
            </Label>
          </Stack>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Description
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {category.description?.trim() || 'No description provided.'}
          </Typography>
        </Box>
      </FormSectionCard>

      <FormSectionCard
        icon="solar:layers-linear"
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
              gridAutoRows: '1fr',
              '& > article:last-of-type:nth-of-type(odd)': {
                gridColumn: '1 / -1',
              },
            }}
          >
            {feeHeads.map((head: any) => (
              <Stack
                key={head.id}
                component="article"
                aria-label={head.name || 'Unnamed fee head'}
                spacing={1.5}
                sx={{ p: 2, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography component="h3" variant="subtitle1">
                  {head.name || 'Unnamed fee head'}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {head.description?.trim() || 'No description provided.'}
                  </Typography>
                </Box>
                <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.5 }}>
                  <Box>
                    <Typography
                      component="dt"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Income category
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                      {head.incomeCategoryName || '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      component="dt"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Concession applicable
                    </Typography>
                    <Box component="dd" sx={{ m: 0 }}>
                      <Label color={head.isConcessionApplied ? 'success' : 'default'}>
                        {head.isConcessionApplied ? 'Yes' : 'No'}
                      </Label>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            ))}
          </Box>
        )}
      </FormSectionCard>
    </Stack>
  );
};

export default FeeCategoryView;
