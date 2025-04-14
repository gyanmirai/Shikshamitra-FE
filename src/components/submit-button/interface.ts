export interface SubmitButtonProps {
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  buttonText?: string;
  variant?: 'text' | 'outlined' | 'contained';
  startIcon?: React.ReactNode;
  disabled?: boolean;
}
