import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import ClassSelectionView from './ClassSelectionView';
import FeeStructureViewCard from './FeeStructureViewCard';
import ViewBasicDetailsOfStructure from './ViewBasicDetailsOfStructure';

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

  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  if (!feeStructure) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ViewBasicDetailsOfStructure feeStructure={feeStructure} />
      {/* Class Selection */}
      <Scrollbar sx={{ maxHeight: '290px' }}>
        <Grid container spacing={2}>
          <ClassSelectionView
            feeStructureClasses={feeStructure.feeStructureClasses}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
          />

          {/* Fee Structure Details */}
          {selectedClass && (
            <Grid size={{ xs: 10.6 }} mb={2}>
              <SectionCard title={`Fee Structure For Class : ${selectedClass}`}>
                {feeStructure.feeStructureClasses[selectedClass]?.length ? (
                  feeStructure.feeStructureClasses[selectedClass].map((structure, idx) => (
                    <FeeStructureViewCard
                      key={idx}
                      className={selectedClass}
                      feeStructure={structure}
                      index={idx}
                      expanded={expanded === idx}
                      onChange={() => setExpanded(expanded === idx ? false : idx)}
                      feeStructureMain={feeStructure}
                    />
                  ))
                ) : (
                  <EmptyContent title="No Fee Structure Created" />
                )}
              </SectionCard>
            </Grid>
          )}
        </Grid>
      </Scrollbar>
    </Box>
  );
};

export default ViewFeeStructure;
