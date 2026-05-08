import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

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
  const [expanded, setExpanded] = useState<number | false>(0); // 0 = first open by default
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
      <Grid container spacing={1}>
        <ClassSelectionView
          classList={classes || []}
          selectedClass={selectedClassId}
          onSelectClass={setSelectedClassId}
          isLoading={isLoadingClassesFetching || isLoadingClasses}
        />

        {/* Fee Structure Details */}
        {selectedClassId && (
          <Grid size={{ xs: 12, md: 9.6 }}>
            <SectionCard
              title={`Fee Structure For : ${classes?.find((c: any) => c.id === selectedClassId)?.name || ''}`}
              paperProps={{ sx: { p: 1 } }}
            >
              <Scrollbar sx={{ height: '480px' }}>
                {isFetching ? (
                  <FeeStructureSkeleton />
                ) : mappedFeeStructures.length ? (
                  mappedFeeStructures.map((structure: any, idx: number) => (
                    <FeeStructureViewCard
                      key={idx}
                      className={selectedClassId}
                      feeStructure={structure}
                      index={idx}
                      expanded={expanded === idx}
                      onChange={() => setExpanded(expanded === idx ? false : idx)}
                      feeStructureMain={feeStructure}
                    />
                  ))
                ) : (
                  <EmptyContent title="No Fee Structure Created For This Class" mt={10} />
                )}
              </Scrollbar>
            </SectionCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ViewFeeStructure;
