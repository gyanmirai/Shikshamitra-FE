// Type for the remainingLectures state
export interface Subject {
  subject: string;
  [key: string]: any; // Extendable if your subject object has more properties
}

export interface DayData {
  day: string;
  subjectColor: string;
  subjects: Subject[];
  class?: string;
  division?: string;
}

export interface TimetableSlot {
  startTime: string;
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
