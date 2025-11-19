import type { ISurvey } from '../type';

export interface IPublishSurveyDialogProps {
  open: boolean;
  survey: ISurvey | null;
  onClose: () => void;
  onPublish: (survey: ISurvey | null) => void;
}
