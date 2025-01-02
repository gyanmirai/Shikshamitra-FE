import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

const EmployeeHistory = () => (
  <CustomizableTable
    columns={[
      { id: 'company', label: 'Company' },
      { id: 'position', label: 'Position' },
      { id: 'startDate', label: 'Start Date' },
      { id: 'endDate', label: 'End Date' },
    ]}
    data={[
      {
        company: 'ABC Corp',
        position: 'Junior Developer',
        startDate: '2018-01-15',
        endDate: '2020-03-31',
      },
      {
        company: 'XYZ Inc',
        position: 'Software Engineer',
        startDate: '2020-04-01',
        endDate: '2022-06-30',
      },
      {
        company: '123 Tech',
        position: 'Senior Developer',
        startDate: '2022-07-01',
        endDate: 'Present',
      },
    ]}
  />
);
export default EmployeeHistory;
