// utils/initialValues.ts

import weeklyLecturesTableData from 'src/json/academic/timetable/weeklyLecturesTableData.json';

export const getNoOfLectureInitialValues = () => ({
  className: '',
  weeklyLectures: weeklyLecturesTableData.map(({ id, noOfLecture }) => ({
    id: id.toString(),
    weeklyLectures: noOfLecture,
  })),
});
