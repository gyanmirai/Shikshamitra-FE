// Type for the remainingLectures state
export interface TRemainingLectures {
  [subjectId: string]: number;
}

// Type for subject objects in the timetable
export type TSubject = {
  name: string;
  teachers: string[];
};

export type TSubjectGroup = {
  id: string;
  subjectName: string;
  subjectType: string;
  subjectColor: string;
  subjects: TSubject[];
  noOfLecture: number;
};
