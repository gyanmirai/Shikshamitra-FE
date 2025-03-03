import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

const eventList = () => {
  const data = [
    {
      id: 1,
      eventName: 'Event 1',
      eventDescription: 'Event 1 Description',
    },
    {
      id: 2,
      eventName: 'Event 2',
      eventDescription: 'Event 2 Description',
    },
  ];

  const columnn = [
    { id: 'eventName', label: 'Event Name' },
    { id: 'eventDescription', label: 'Event Description' },
  ];
  return <CustomizableTable tableId="eventNameTable" columns={columnn} data={data} />;
};

export default eventList;
