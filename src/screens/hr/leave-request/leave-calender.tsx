import React from 'react';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeLeaveQuery } from 'src/redux/employee/employeeApi';

import CommonCalender from 'src/components/calender';

import type { TabComponentType } from '.';

// {
//     "id": "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
//     "title": "Summer Music Festival",
//     "allDay": false,
//     "color": "#00A76F",
//     "description": "Atque eaque ducimus minima distinctio velit. Laborum et veniam officiis. Delectus ex saepe hic id laboriosam officia. Odit nostrum qui illum saepe debitis ullam. Laudantium beatae modi fugit ut. Dolores consequatur beatae nihil voluptates rem maiores.",
//     "start": "2024-10-23T06:50:11+00:00",
//     "end": "2024-10-23T10:20:11+00:00",
//     "textColor": "#00A76F"
// }

const LeaveCalender = (props: TabComponentType) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });

  const calendarData =
    data?.items.map((i: any) => ({
      ...i,
      start: i.startDate,
      end: i.endDate,
      allDay: false,
      textColor: '#00A76F',
      title: i.leaveType,
      description: i.description.replace(/<[^>]+>/g, ''),
    })) || [];

  return <CommonCalender data={calendarData} isLoading={isLoading} />;
};

export default LeaveCalender;
