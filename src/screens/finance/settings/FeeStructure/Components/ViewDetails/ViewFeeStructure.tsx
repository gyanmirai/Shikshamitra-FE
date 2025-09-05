import React from 'react';

import ClassSelectionView from './ClassSelectionView';
import FeeStructureViewCard from './FeeStructureViewCard';

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
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  if (!feeStructure) return null;

  return (
    <>
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
              feeItems={structure.feeItems}
            />
          );
        })}
    </>
  );
};

export default ViewFeeStructure;
