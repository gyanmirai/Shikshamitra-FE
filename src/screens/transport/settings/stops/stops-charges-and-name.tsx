import React from 'react';
import CustomizableTable from 'src/components/customizable-table';

interface StopsChargesAndNameProps {
  stopList: any;
}

const StopsChargesAndName: React.FC<StopsChargesAndNameProps> = ({ stopList }) => (
  <CustomizableTable
    tableId="stops-charges-and-name"
    data={[]}
    columns={[
      { id: 'stopName', label: 'Stop Name' },
      { id: 'stopCharges', label: 'Stop Charges' },
    ]}
  />
);

export default StopsChargesAndName;
