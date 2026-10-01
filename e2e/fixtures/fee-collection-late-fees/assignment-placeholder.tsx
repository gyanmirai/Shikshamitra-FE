import { Alert } from '@mui/material';

// This scenario always supplies an already-assigned student. Avoid loading the
// unrelated assignment workflow; collection table, form, ledger and API remain real.
export default function AssignmentPlaceholder(_props: unknown) {
  return <Alert severity="info">Fee assignment is outside this synthetic collection scenario.</Alert>;
}
