import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

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
    <Scrollbar sx={{ height: '100%', p: 1 }}>
      <ViewBasicDetailsOfStructure feeStructure={feeStructure} />
      {/* Class Selection */}
      <Grid container spacing={2}>
        <ClassSelectionView
          feeStructureClasses={feeStructure.feeStructureClasses}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />

        {/* Fee Structure Details */}
        {selectedClass && (
          <Grid size={{ xs: 10 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" color="primary.main" mb={expanded ? 0 : 1}>
                Fee Structure For Class : {selectedClass}
              </Typography>
            </Grid>
            {(feeStructure.feeStructureClasses[selectedClass] || []).map((structure, idx) => (
              <FeeStructureViewCard
                key={idx}
                className={selectedClass}
                feeStructure={structure}
                index={idx}
                expanded={expanded === idx}
                onChange={() => setExpanded(expanded === idx ? false : idx)}
                feeStructureMain={feeStructure}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Scrollbar>
  );
};

export default ViewFeeStructure;
