import { Typography } from '@mui/material';

import type { MatrixAction } from './permission-matrix-model';

export default function PermissionActionNotes({ action }: { action: MatrixAction }) {
  return (
    <Typography
      component="div"
      variant="caption"
      sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
    >
      {action.rule === 'mixed' && (
        <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
          This action contains mixed rules. A choice applies to the mapped permissions in this
          group.
        </Typography>
      )}
      {action.action === 'Edit' &&
        action.names.some((name) =>
          name.startsWith('HR.PayrollManagement.Settings.StatutorySchemes.')
        ) && (
          <Typography variant="caption" color="inherit">
            Includes scheme edits, activation, enrollment, override approvals and administrator
            calculation settings.
          </Typography>
        )}
      {!action.editable && (
        <Typography variant="caption" color="inherit" sx={{ display: 'block', mt: 0.5 }}>
          This action is unavailable for this role or user in the server permission catalogue.
        </Typography>
      )}
    </Typography>
  );
}
