export interface StudentBirthday {
  name: string;
  age: number;
  className: string;
  dateLabel?: string;
}

export interface BirthdaySectionProps {
  todaysBirthdays: StudentBirthday[];
  upcomingBirthdays: StudentBirthday[];
  title: string;
}
