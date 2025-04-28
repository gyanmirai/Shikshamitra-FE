import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHostelRule | null;
}

export interface IHostelRule {
  ruleName: string;
  ruleDescription: string;
  document?: File;
}
