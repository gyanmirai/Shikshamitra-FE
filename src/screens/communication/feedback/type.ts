import type { Dayjs } from 'dayjs';

export interface TSurvey {
  id: number;
  surveyTitle: string;
  description: string;
  organization: string[];
  classes: string[];
  audience: string[];
  startDate: Dayjs;
  endDate: Dayjs;
  numberOfResponses?: number;
  responseRate: number;
  status: string;
}

export interface TQuestionData {
  id: string;
  question: string;
  answer: string;
}

export interface TResponseData {
  id: string;
  responsendedName: string;
  role: string;
  responsendedEmail: string;
  response: TQuestionData[];
}
