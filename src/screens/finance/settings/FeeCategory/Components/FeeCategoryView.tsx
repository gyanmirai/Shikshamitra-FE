import React from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeCategoryByIdQuery } from 'src/redux/feeCategory/feeCategoryApi';
import { Box, Card, Grid, Stack, Divider, Typography, CardContent } from '@mui/material';

interface IFeeCategoryViewProps {
  id: string;
}

const FeeCategoryView: React.FC<IFeeCategoryViewProps> = ({ id }) => {
  const { data: feeCategoryDetails, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoryByIdQuery,
    params: id,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const category = feeCategoryDetails;
  const feeHeads = category?.feeHeads || [];

  return (
    <Box p={1}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Category Name
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {category?.name}
          </Typography>
        </Box>

        {category?.description && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {category.description}
            </Typography>
          </Box>
        )}

        <Divider />

        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Mapped Fee Heads ({feeHeads.length})
          </Typography>

          {feeHeads.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No Fee Heads mapped to this category.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {feeHeads.map((fh: any, index: number) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                          {fh.name || 'N/A'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minHeight: 40, display: 'block', whiteSpace: 'pre-wrap' }}
                        >
                          {fh.description || 'No description provided.'}
                        </Typography>

                        <Divider />

                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            Income Category
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {fh.incomeCategoryName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Income Category: {fh.incomeCategoryName || 'N/A'}
                          </Typography>
                        </Box>

                        <Divider />

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          pt={0.5}
                        >
                          <Typography variant="caption" fontWeight={600}>
                            Concession Applicable
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color={fh.isConcessionApplied ? 'success.main' : 'text.secondary'}
                          >
                            {fh.isConcessionApplied ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default FeeCategoryView;
