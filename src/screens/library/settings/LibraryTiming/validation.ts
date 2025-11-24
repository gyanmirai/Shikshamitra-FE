// import dayjs from 'dayjs';
// import * as Yup from 'yup';

// const getValidationSchema = (timingData: any[]) => {
//   const shape: any = {};
//   timingData.forEach((row) => {
//     shape[`${row.id}_endTime`] = Yup.string().test(
//       'is-after-start',
//       'End Time must be after Start Time',
//       function (value) {
//         const start = this.parent[`${row.id}_startTime`];
//         if (!start || !value) return true;
//         const startTime = dayjs(start, 'hh:mm A');
//         const endTime = dayjs(value, 'hh:mm A');
//         return endTime.isAfter(startTime);
//       }
//     );
//   });
//   return Yup.object().shape(shape);
// };
