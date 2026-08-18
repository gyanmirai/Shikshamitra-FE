import type { AdmissionOfferingValidation } from 'src/redux/student/admissions/admission-offerings-api';

import { Alert, AlertTitle } from '@mui/material';

type Props = { result?: AdmissionOfferingValidation | null };

export function AdmissionOfferingReadiness({ result }: Props) {
  if (!result) {
    return (
      <Alert severity="info">
        Saving checks the academic hierarchy, uniqueness, dates, published workflow, and both
        published forms on the server.
      </Alert>
    );
  }

  if (result.isValid) {
    return (
      <Alert severity="success">
        <AlertTitle>Ready</AlertTitle>
        This configuration is ready to receive inquiries and applications during its effective
        window.
      </Alert>
    );
  }

  return (
    <Alert severity="warning">
      <AlertTitle>Configuration incomplete</AlertTitle>
      {result.errors.map((error) => error.message).join(' ')}
    </Alert>
  );
}
