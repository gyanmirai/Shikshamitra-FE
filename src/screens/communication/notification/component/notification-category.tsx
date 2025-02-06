import React from 'react';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const NotificationCategory = () => {
  const notificationData = [
    { id: 1, categoryName: 'Fees ', subCategoryName: 'Overdue' },
    { id: 2, categoryName: 'Fees ', subCategoryName: 'General Reminder' },
    { id: 3, categoryName: 'Fees ', subCategoryName: 'Pending' },
  ];
  return (
    <CustomizableTable
      isLoading={false}
      isFilter={false}
      isSearch={false}
      isShowedDense={false}
      tableId="notification-category-table"
      columns={[
        { id: 'categoryName', label: 'Category' },
        { id: 'subCategoryName', label: 'Sub-Category' },
        {
          id: 'action',
          label: 'Action',
          render: (row: any) => (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showDeleteIcon
              showEditIcon
            />
          ),
        },
      ]}
      data={notificationData}
    />
  );
};

export default NotificationCategory;
