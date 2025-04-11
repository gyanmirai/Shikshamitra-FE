export interface ILibraryCategory {
  categoryName: string;
  description: string;
}

export interface ILibraryTiming {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  isHoliday: boolean;
}
