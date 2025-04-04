// Type for the remainingLectures state
export interface TRemainingLectures {
  [subjectId: string]: number;
}

// Type for subject objects in the timetable
export interface TSubject {
  id: number;
  name: string;
  color: string;
  teachers: string[];
  room: string;
  noOfLeacture: number;
}
