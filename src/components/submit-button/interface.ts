export interface SubmitButtonProps {
  loading?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement> | any) => void;
  type?: 'button' | 'submit';
  buttonText?: string;
  variant?: 'text' | 'outlined' | 'contained';
  startIcon?: React.ReactNode;
  disabled?: boolean;
}
