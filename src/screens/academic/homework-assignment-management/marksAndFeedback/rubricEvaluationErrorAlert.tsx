import { Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

type RubricEvaluationErrorAlertProps = {
  isLoading: boolean;
  onRetry: () => unknown;
};

const RubricEvaluationErrorAlert = ({ isLoading, onRetry }: RubricEvaluationErrorAlertProps) => (
  <Alert
    severity="error"
    action={
      <LoadingButton color="inherit" size="small" loading={isLoading} onClick={onRetry}>
        Retry
      </LoadingButton>
    }
  >
    Unable to load this student&apos;s existing evaluation. Please try again.
  </Alert>
);

export default RubricEvaluationErrorAlert;
