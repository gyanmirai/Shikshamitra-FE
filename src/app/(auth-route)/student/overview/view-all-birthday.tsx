import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizable-table';

import { allBirthdayData } from './data/view-all-birthday-data';

const ViewAllBirthday = () => (
  <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
    <CustomizableTable
      tableId="allBirthday"
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
          label: 'division',
        },
      ]}
      data={allBirthdayData}
    />
  </Scrollbar>
);

export default ViewAllBirthday;
