import type { UseBooleanReturn } from 'src/hooks/useBoolean';

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
