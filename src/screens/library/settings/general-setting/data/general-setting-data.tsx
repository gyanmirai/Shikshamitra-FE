import type { ILibraryTiming, ILibraryCategory } from './general-setting-interface';

export const libararyCategoryDummyData: ILibraryCategory[] = [
  {
    categoryName: 'Science-Fiction',
    description: 'Books about futuristic science and technology',
  },
  { categoryName: 'Education', description: 'Books for learning and academics' },
];

export const libraryTimingDataDummy: ILibraryTiming[] = [
  { id: 1, day: 'Monday', startTime: '', endTime: '', isHoliday: false },
  { id: 2, day: 'Tuesday', startTime: '', endTime: '', isHoliday: false },
  { id: 3, day: 'Wednesday', startTime: '', endTime: '', isHoliday: false },
  { id: 4, day: 'Thursday', startTime: '', endTime: '', isHoliday: false },
  { id: 5, day: 'Friday', startTime: '', endTime: '', isHoliday: false },
];
