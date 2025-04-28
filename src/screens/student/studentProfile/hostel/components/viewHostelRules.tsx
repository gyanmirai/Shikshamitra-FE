import React from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const ViewHostelRules = () => {
  const viewDetailsDialog = useBoolean();
  return (
    <CustomizableTable
      tableId="hostel-rules-table"
      searchFieldProps={{
        placeholder: 'Search Hostel Rule...',
        label: 'Search Hostel Rule...',
      }}
      noDataText="Hostel Rules Data Not Available"
      columns={[
        { id: 'ruleName', label: 'Hostel Rule Name' },
        { id: 'desciption', label: 'Description' },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 40,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                showViewIcon
                handleViewClick={() => {
                  viewDetailsDialog.onTrue();
                }}
                showThreeDots={false}
                placement="right-top"
              />
            );
          },
        },
      ]}
      data={[
        {
          ruleName: 'No Smoking',
          description: 'Smoking is prohibited in all areas of the hostel.',
        },
        {
          ruleName: 'Quiet Hours',
          description: 'Quiet hours are from 10 PM to 7 AM every day.',
        },
        {
          ruleName: 'Guests',
          description: 'No overnight guests allowed in the hostel premises.',
        },
        {
          ruleName: 'Curfew',
          description:
            'Students must return to the hostel by 9 PM on weekdays and 11 PM on weekends.',
        },
        {
          ruleName: 'Food in Rooms',
          description:
            'No food allowed inside the rooms. All meals must be taken in the dining hall.',
        },
      ]}
    />
  );
};

export default ViewHostelRules;
