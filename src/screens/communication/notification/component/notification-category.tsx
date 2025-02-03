import React from 'react';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const NotificationCategory = () => {
  const notificationData = [
    { id: 1, categoryName: 'Fees ' },
    { id: 2, categoryName: 'Event Alerts' },
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
