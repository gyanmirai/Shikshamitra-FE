import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

interface StopsChargesAndNameProps {
  stopList: any;
}

const StopsChargesAndName: React.FC<StopsChargesAndNameProps> = ({ stopList }) => {
  console.log('data', stopList);
  return (
    <CustomizableTable
      data={[]}
      columns={[
        { id: 'stopName', label: 'Stop Name' },
        { id: 'stopCharges', label: 'Stop Charges' },
      ]}
    />
  );
};

export default StopsChargesAndName;
