import type { Dayjs } from 'dayjs';

export interface ISurvey {
  id: number;
  surveyTitle: string;
  description: string;
  organization: string[];
  classes: string[];
  audience: string[];
  startDate: Dayjs | string | null;
  endDate: Dayjs | string | null;
  numberOfResponses?: number;
  responseRate: number;
  status: string;
}

export interface IQuestionData {
  id: string;
  question: string;
  answer: string;
}

export interface IResponseData {
  id: string;
  responsendedName: string;
  role: string;
  responsendedEmail: string;
  response: IQuestionData[];
}

export interface IScheduledSurveyTableProps {
  data: ISurvey[];
  onDelete: (id: number) => void;
  onEdit: (survey: ISurvey) => void;
  onView: (survey: ISurvey) => void;
}
