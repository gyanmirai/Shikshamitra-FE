import React, { useState } from 'react';

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
    <>
      <ViewBasicDetailsOfStructure feeStructure={feeStructure} />
      {/* Class Selection */}
      <ClassSelectionView
        feeStructureClasses={feeStructure.feeStructureClasses}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      {/* Fee Structure Details */}
      {selectedClass &&
        (feeStructure.feeStructureClasses[selectedClass] || []).map((structure, idx) => {
          const totalFeeAmount =
            structure.feeItems?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) ||
            0;

          return (
            <FeeStructureViewCard
              key={idx}
              className={selectedClass}
              feeStructure={structure}
              index={idx}
              expanded={expanded === idx} // ✅ pass boolean
              onChange={() => setExpanded(expanded === idx ? false : idx)} // ✅ toggle
              feeStructureMain={feeStructure}
            />
          );
        })}
    </>
  );
};

export default ViewFeeStructure;
