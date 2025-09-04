import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import ClassSelectionView from './ClassSelectionView';
import FeeStructureViewCard from './FeeStructureViewCard';

import type { IFeeStructure } from '../../type';

const ViewFeeStructure = ({
  open,
  onClose,
  data: feeStructure,
}: {
  open: UseBooleanReturn;
  onClose: () => void;
  data: IFeeStructure | null;
}) => {
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  if (!feeStructure) return null;

  return (
    <>
      <ClassSelectionView
        feeStructureClasses={feeStructure.feeStructureClasses}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      {/* ✅ show structure only when a class is selected */}
      {selectedClass && (
        <SectionCard title={`Fee Structure - Class ${selectedClass}`}>
          <FeeStructureViewCard
            className={selectedClass}
            feeItems={feeStructure.feeStructureClasses[selectedClass]?.feeItems || []}
          />
        </SectionCard>
      )}
    </>
  );
};

export default ViewFeeStructure;
