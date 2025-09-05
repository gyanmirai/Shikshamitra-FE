import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

import { allBirthdayData } from './data/view-all-birthday-data';

const ViewAllBirthdayWithDate = () => (
  <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
    <CustomizableTable
      tableId="allBirthdayWithDate"
      columns={[
        {
          id: 'name',
          label: 'Name',
        },
        {
          id: 'class',
          label: 'Class',
        },
        {
          id: 'division',
          label: 'Division',
        },
        {
          id: 'birthdate',
          label: 'Birthdate',
        },
      ]}
      data={allBirthdayData}
    />
  </Scrollbar>
);

export default ViewAllBirthdayWithDate;
