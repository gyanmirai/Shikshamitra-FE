// Type for the remainingLectures state
export interface Subject {
  subject: string;
  [key: string]: any; // Extendable if your subject object has more properties
}

export interface DayData {
  day: string;
  subjectColor: string;
  subjects: Subject[];
}

export interface TimetableSlot {
  startTime: string;
  class?: string;
  division?: string;
  endTime: string;
  isBreak: boolean;
  dayData: DayData[];
}

export type TSubjectGroup = {
  id: string;
  subjectName: string;
  subjectType: string;
  subjectColor: string;
  subjects: Subject[];
  allocateLectures: number;
  totalLectures: number;
};
