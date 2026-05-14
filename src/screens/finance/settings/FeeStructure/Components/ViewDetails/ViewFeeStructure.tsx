import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';

import ClassSelectionView from './ClassSelectionView';
import FeeStructureViewCard from './FeeStructureViewCard';
import FeeStructureSkeleton from './FeeStructureSkeleton';
import ViewBasicDetailsOfStructure from './ViewBasicDetailsOfStructure';
import { standardFeeStructureInitialValues } from '../FeeStructureInitialValues';

import type { IFeeStructure } from '../../type';

const ViewFeeStructure = ({
  open,
  onClose,
  data: feeStructure,
}: {
  open: any;
  onClose: () => void;
  data: IFeeStructure | null;
}) => {
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

  const [
    getClassByMedium,
    { data: classes, isLoading: isLoadingClasses, isFetching: isLoadingClassesFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const { data: standardFeeStructure, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: selectedClassId },
    options: { skip: !feeStructure?.id || !selectedClassId },
  });

  const mappedFeeStructures = React.useMemo(() => {
    if (!standardFeeStructure) return [];
    return standardFeeStructureInitialValues(standardFeeStructure).feeStructureClasses ?? [];
  }, [standardFeeStructure]);
  React.useEffect(() => {
    if (feeStructure?.mediumId) {
      getClassByMedium(feeStructure.mediumId);
    }
  }, [feeStructure?.mediumId, getClassByMedium]);

  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  if (!feeStructure) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ViewBasicDetailsOfStructure feeStructure={feeStructure} />
      {/* Class Selection */}
      <Grid container spacing={1} alignItems="stretch">
        <ClassSelectionView
          classList={classes || []}
          selectedClass={selectedClassId}
          onSelectClass={setSelectedClassId}
          isLoading={isLoadingClassesFetching || isLoadingClasses}
        />

        {/* Fee Structure Details */}
        {selectedClassId && (
          <Grid size={{ xs: 12, md: 9.6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                height: '100%',
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify
                  icon="solar:bill-list-bold-duotone"
                  width={18}
                  sx={{ color: 'primary.main' }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Fee Structure For:{' '}
                    {classes?.find((c: any) => c.id === selectedClassId)?.name || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Division-wise fee heads and amounts
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 1.5 }} />
              <Scrollbar sx={{ height: '480px' }}>
                {isFetching ? (
                  <FeeStructureSkeleton />
                ) : mappedFeeStructures.length ? (
                  mappedFeeStructures.map((structure: any, idx: number) => (
                    <FeeStructureViewCard
                      key={idx}
                      className={selectedClassId}
                      feeStructure={structure}
                    />
                  ))
                ) : (
                  <EmptyContent title="No Fee Structure Created For This Class" mt={10} />
                )}
              </Scrollbar>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ViewFeeStructure;
