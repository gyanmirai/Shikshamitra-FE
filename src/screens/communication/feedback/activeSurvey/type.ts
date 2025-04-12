import type { ISurvey } from '../type';

/**
 * Interface representing a single question and its answer in a survey response
 */
interface IQuestionData {
  id: string; // Unique identifier for the question
  question: string; // The actual question text
  answer: string; // The respondent's answer to the question
}

/**
 * Interface representing a complete survey response from a participant
 */
interface IResponseData {
  id: string; // Unique identifier for the response
  responsendedName: string; // Name of the person who responded
  role: string; // Role of the respondent (e.g., Student, Parent)
  responsendedEmail: string; // Email address of the respondent
  response: IQuestionData[]; // Array of questions and answers submitted
}

export interface IPublishSurveyDialogProps {
  open: boolean;
  survey: ISurvey | null;
  onClose: () => void;
  onPublish: (survey: ISurvey | null) => void;
}
